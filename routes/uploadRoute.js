// routes/uploadRoute.js
import express from "express";
import multer from "multer";
import { getDriveService } from "../config/driveClient.js";
import  db from "../config/connection.js";
import {
  getOrCreateFolder,
  findFolderByName,
  sanitizeFolderName,
  normalizeNameForKey,
  bufferToStream
} from "../utils/driveUtils.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // tout en mémoire

const ROOT_FOLDER_ID = process.env.DRIVE_FOLDER_ID; // Documents_Etudiants

// helper: ensure class folder and store in DB (idempotent)
async function ensureClassFolder(drive, className) {
  className = sanitizeFolderName(className);

  // 1. Check DB
  // const [rows] = await db.query(
  //   "SELECT id, drive_folder_id FROM classes WHERE name = ? AND root_drive_id = ? LIMIT 1",
  //   [className, ROOT_FOLDER_ID]
  // );
  // if (rows.length) return rows[0];

  // 2. Not in DB -> check Drive and create if needed
  const folder = await getOrCreateFolder(drive, className, ROOT_FOLDER_ID);

  // 3. Persist in DB (handle race with INSERT ... ON DUPLICATE KEY)
  try {
    const [res] = await db.query(
      "INSERT INTO classes (name, drive_folder_id, root_drive_id) VALUES (?, ?, ?)",
      [className, folder.id, ROOT_FOLDER_ID]
    );
    return { id: res.insertId, drive_folder_id: folder.id };
  } catch (err) {
    // possible duplicate (concurrency) -> fetch existing
    const [rows2] = await db.query(
      "SELECT id, drive_folder_id FROM classes WHERE name = ? AND root_drive_id = ? LIMIT 1",
      [className, ROOT_FOLDER_ID]
    );
    if (rows2.length) return rows2[0];
    throw err;
  }
}

// helper: ensure student folder under class
async function ensureStudentFolder(drive, classDbRow, studentRef, fullName) {
  const normalized = normalizeNameForKey(fullName);
  const displayName = sanitizeFolderName(fullName + (studentRef ? ` (${studentRef})` : ""));

  // check DB students table
  // const [rows] = await db.query(
  //   "SELECT id, drive_folder_id FROM students WHERE normalized_name = ? AND class_id = ? LIMIT 1",
  //   [normalized, classDbRow.id]
  // );
  // if (rows.length) return { studentDbId: rows[0].id, drive_folder_id: rows[0].drive_folder_id };

  // check Drive under class folder
  // const existing = await findFolderByName(drive, displayName, classDbRow.drive_folder_id);
  const existing = false;
  let folderInfo;
  if (existing) {
    folderInfo = existing;
  } else {
    folderInfo = await getOrCreateFolder(drive, displayName, classDbRow.drive_folder_id);
  }

  // persist student row
  return{message:"ok"};
  // try {
  //   const [res] = await db.query(
  //     "INSERT INTO students (student_ref, full_name, normalized_name, class_id, drive_folder_id) VALUES (?, ?, ?, ?, ?)",
  //     [studentRef || null, fullName, normalized, classDbRow.id, folderInfo.id]
  //   );
  //   return { studentDbId: res.insertId, drive_folder_id: folderInfo.id };
  // } catch (err) {
  //   // race: another process inserted -> fetch existing
  //   const [rows2] = await db.query(
  //     "SELECT id, drive_folder_id FROM students WHERE normalized_name = ? AND class_id = ? LIMIT 1",
  //     [normalized, classDbRow.id]
  //   );
  //   if (rows2.length) return { studentDbId: rows2[0].id, drive_folder_id: rows2[0].drive_folder_id };
  //   throw err;
  // }
}

// Endpoint upload
// Expect form-data: file (File), className (Text), firstName, lastName, studentRef (optionnel)
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "file manquant" });

    // Utilise les valeurs par défaut
    const className = "CSI3_DLW";
    const firstName = "Dimitri";
    const lastName = "Bonsou";
    const studentRef = "34";
    if (!className) return res.status(400).json({ error: "className requis" });

    // Récupère le service Drive
    const drive = await getDriveService();

    // 1) Vérifie/crée le dossier de la classe à la racine
    // const classRow = await ensureClassFolder(drive, className);
    const drive_folder_id = "1INslo-C83UHkvE-IfLJaCvC2MpCJ2J-g";

    // 2) Upload le fichier dans le dossier de la classe
    const stream = bufferToStream(req.file.buffer);
    // const fileMetadata = { name: req.file.originalname, parents: [classRow.drive_folder_id] };
    const fileMetadata = { name: req.file.originalname, parents: [process.env.CLASS_FOLDER_ID] };
    const media = { mimeType: req.file.mimetype, body: stream };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: "id, name, mimeType, size, webViewLink"
    });

    // 3) (optionnel) Sauvegarde en BDD si besoin
    // await db.query(
    //   "INSERT INTO documents (class_id, drive_file_id, name, mime_type, size_bytes) VALUES (?, ?, ?, ?, ?)",
    //   [classRow.id, response.data.id, response.data.name, response.data.mimeType, response.data.size || 0]
    // );

    return res.json({ success: true, file: response.data });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: "Erreur upload vers Drive", details: err.message });
  }
});

export default router;
