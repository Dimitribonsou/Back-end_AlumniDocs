// listAndDownload.js

// Importe express pour créer le routeur
import express from "express";
// Importe la fonction pour obtenir le service Google Drive
import { getDriveService } from "./../config/driveClient.js";
//importer la configuration des variables d'environnement
import dotenv from 'dotenv';
dotenv.config();
// Crée un routeur express
const router = express.Router();
// Définit l'ID du dossier Drive à utiliser (variable d'environnement ou valeur par défaut)
const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID || "100e9HV6-mo6OevD4e7SLEKt6BDjI_Wi2";

// Route GET pour lister les fichiers du dossier Drive
router.get("/drive/files", async (req, res) => {
  try {
    // Obtient le service Google Drive authentifié
    const drive = await getDriveService();
    // Liste les fichiers dans le dossier Drive spécifié
    const response = await drive.files.list({
      q: `'${DRIVE_FOLDER_ID}' in parents and trashed=false`, // filtre : dans le dossier et non supprimé
      fields: "files(id, name, mimeType, webViewLink)", // champs à retourner
      pageSize: 100, // nombre max de fichiers
    });
    // Retourne la liste des fichiers en JSON
    return res.json(response.data.files || []);
  } catch (err) {
    // Affiche l'erreur dans la console
    console.error(err);
    // Retourne une erreur 500 en cas de problème
    return res.status(500).json({ error: "Erreur listing Drive" });
  }
});

// Route GET pour télécharger/streamer un fichier Drive par son id
router.get("/drive/files/:id/download", async (req, res) => {
  try {
    // Obtient le service Google Drive authentifié
    const drive = await getDriveService();
    // Récupère l'id du fichier depuis l'URL
    const fileId = req.params.id;

    // Récupère les métadonnées du fichier (nom, type MIME)
    const meta = await drive.files.get({ fileId, fields: "name, mimeType" });
    // Définit le nom du fichier dans la réponse HTTP
    res.setHeader("Content-Disposition", `attachment; filename="${meta.data.name}"`);
    // Définit le type MIME dans la réponse HTTP
    res.setHeader("Content-Type", meta.data.mimeType || "application/octet-stream");

    // Récupère le contenu du fichier en mode stream
    const driveRes = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );

    // Envoie le flux du fichier au client
    driveRes.data.pipe(res);
  } catch (err) {
    // Affiche l'erreur dans la console
    console.error(err);
    // Retourne une erreur 500 en cas de problème
    res.status(500).json({ error: "Erreur download Drive", details: err.message });
  }
});

// Exporte le routeur pour l'utiliser dans l'application principale
export default router;
