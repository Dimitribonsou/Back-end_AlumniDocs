// uploadRoute.js
//importer la configuration des variables d'environnement
import dotenv from 'dotenv';
dotenv.config();
import { Readable } from "stream";
// Importe le module express pour créer des routes
import express from "express";
// Importe la fonction pour obtenir le service Google Drive
import { getDriveService } from "../config/driveClient.js";
import upload from "../middlewares/multer.js"; // ton multer memoryStorage
// Crée un routeur express
const router = express.Router();

// Définit l'ID du dossier Drive où stocker les fichiers (depuis variable d'environnement ou valeur par défaut)
const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID || "100e9HV6-mo6OevD4e7SLEKt6BDjI_Wi2";
// Obtient le service Google Drive
const drive = await getDriveService();
// Déclare la route POST /upload pour l'upload de fichiers
router.post("/upload", upload.single("file"), async (req, res) => {
  // Vérifie si un fichier a été envoyé
  if (!req.file) return res.status(400).json({ error: "Aucun fichier envoyé" });


try {
    console.log("DRIVE_FOLDER_ID:", process.env.DRIVE_FOLDER_ID);
    // Prépare les métadonnées du fichier à uploader
    const fileMetadata = {
      name: req.file.originalname,
      parents: [process.env.DRIVE_FOLDER_ID] || [DRIVE_FOLDER_ID],
    };
    // Transformer le buffer en flux lisible
    const stream = new Readable();
    stream.push(req.file.buffer);
    stream.push(null);
    // Prépare les métadonnées et le média pour l'upload
    const media = {
      mimeType: req.file.mimetype,
      body: stream, // on lit directement depuis la mémoire
    };
    // Effectue l'upload du fichier vers Google Drive
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: "id, name, mimeType, parents, webViewLink",
    });
    // Retourne les informations du fichier uploadé
    res.json({
      success: true,
      file: response.data,
    });
  } catch (err) {

    console.error("Upload error:", err);
    res.status(500).json({
      error: "Erreur upload vers Drive",
      details: err.message,
    });
  }
});

// Exporte le routeur pour l'utiliser dans l'application principale
export default router;
