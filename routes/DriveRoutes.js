// driveRoutes.js

// Importe express pour créer le routeur
import express from "express";

// Importe la fonction pour créer un client OAuth2 Google
import { createOAuth2Client } from "./../config/authClient.js";
// Importe le module googleapis
import { google } from "googleapis";
// Importe Readable pour transformer un buffer en stream
import { Readable } from "stream";
// Importe fs pour lire/écrire des fichiers (ici pour stocker le token)
import fs from "fs";
import upload from "../middlewares/multer.js"; // ton multer memoryStorage
// Importe dotenv pour charger les variables d'environnement
import dotenv from "dotenv";
// Charge les variables d'environnement
dotenv.config();

// Crée un routeur express
const router = express.Router();

// Définit le chemin où le token sera sauvegardé
const TOKEN_PATH = "./token.json";

// Fonction pour obtenir un client Google Drive authentifié
function getAuthenticatedDriveClient() {
  // Crée un client OAuth2
  const oAuth2Client = createOAuth2Client();
  // Vérifie que le fichier de tokens existe
  if (!fs.existsSync(TOKEN_PATH)) throw new Error("Tokens manquants. Va sur /auth pour autoriser.");
  // Lit les tokens depuis le fichier
  const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH));
  // Configure le client OAuth2 avec les tokens
  oAuth2Client.setCredentials(tokens);
  // Écoute les nouveaux tokens pour les sauvegarder (refresh automatique)
  oAuth2Client.on("tokens", (t) => {
    if (t.refresh_token) {
      const existing = fs.existsSync(TOKEN_PATH) ? JSON.parse(fs.readFileSync(TOKEN_PATH)) : {};
      const merged = { ...existing, ...t };
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(merged));
    } else if (t.access_token) {
      const existing = fs.existsSync(TOKEN_PATH) ? JSON.parse(fs.readFileSync(TOKEN_PATH)) : {};
      const merged = { ...existing, ...t };
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(merged));
    }
  });

  // Retourne le service Google Drive authentifié
  return google.drive({ version: "v3", auth: oAuth2Client });
}

// Route POST /upload : upload un fichier vers Google Drive
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    // Vérifie si un fichier a été envoyé
    if (!req.file) return res.status(400).json({ error: "fichier manquant" });
    // Obtient le client Drive authentifié
    const drive = getAuthenticatedDriveClient();

    // Convertit le buffer du fichier en stream
    const stream = new Readable();
    stream.push(req.file.buffer);
    stream.push(null);

    // Prépare les métadonnées du fichier
    const fileMetadata = {
      name: req.file.originalname,
      parents: [process.env.DRIVE_FOLDER_ID], // dossier cible dans Drive
    };

    // Prépare le contenu du fichier et son type MIME
    const media = {
      mimeType: req.file.mimetype,
      body: stream,
    };

    // Upload le fichier vers Google Drive
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: "id, name, mimeType, parents, webViewLink",
    });

    // Ici: sauvegarde en BDD si souhaité (ex: drive_file_id = response.data.id)
    res.json({ success: true, file: response.data });
  } catch (err) {
    // Affiche l'erreur dans la console
    console.error("Upload error:", err);
    // Retourne une erreur 500 en cas de problème
    res.status(500).json({ error: "Erreur upload vers Drive", details: err.message });
  }
});

// Route GET /list : liste les fichiers du dossier Drive
router.get("/list", async (req, res) => {
  try {
    // Obtient le client Drive authentifié
    const drive = getAuthenticatedDriveClient();
    // Liste les fichiers dans le dossier Drive spécifié
    const response = await drive.files.list({
      q: `'${process.env.DRIVE_FOLDER_ID}' in parents and trashed=false`,
      fields: "files(id, name, mimeType, webViewLink)",
      pageSize: 100,
    });
    // Retourne la liste des fichiers en JSON
    res.json(response.data.files || []);
  } catch (err) {
    // Affiche l'erreur dans la console
    console.error(err);
    // Retourne une erreur 500 en cas de problème
    res.status(500).json({ error: "Erreur lors du listing", details: err.message });
  }
});

// Exporte le routeur pour l'utiliser
export default router;
