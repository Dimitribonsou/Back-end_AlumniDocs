// driveRoutes.js

// Importe express pour créer le routeur
import express from "express";
//importer la connexion a la base de donnee
import  db from "../config/connection.js";
// Importe la fonction pour créer un client OAuth2 Google
import { createOAuth2Client } from "./../config/authClient.js";
// Importe le module googleapis
import { google } from "googleapis";
// Importe Readable pour transformer un buffer en stream
import { Readable } from "stream";
// Importe fs pour lire/écrire des fichiers (ici pour stocker le token)
import fs from "fs";
import upload from "../middlewares/multer.js"; // ton 
import dotenv from "dotenv";
import { log } from "console";
// Charge les variables d'environnement
dotenv.config();

// Crée un routeur express
const router = express.Router();

// Définit le chemin où le token sera sauvegardé
const TOKEN_PATH = "./token.json";
global.drive_folder_id = null;

// Fonction pour obtenir un client Google Drive authentifié
// function getAuthenticatedDriveClient() {
//   // Crée un client OAuth2
//   const oAuth2Client = createOAuth2Client();
//   // Vérifie que le fichier de tokens existe
//   if (!fs.existsSync(TOKEN_PATH)) throw new Error("Tokens manquants. Va sur /auth pour autoriser.");
//   // Lit les tokens depuis le fichier
//   const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH));
//   // console.log("tokens avant:", tokens);
//   // Configure le client OAuth2 avec les tokens
//   oAuth2Client.setCredentials(tokens);
//   // console.log("expiry_date:", new Date(2026, 8, 31).getTime()); 
//   //Écoute les nouveaux tokens pour les sauvegarder (refresh automatique)
//   oAuth2Client.on("tokens", (t) => {
//     if (t.refresh_token) {
//       const existing = fs.existsSync(TOKEN_PATH) ? JSON.parse(fs.readFileSync(TOKEN_PATH)) : {};
//       const merged = { ...existing, ...t };
//       fs.writeFileSync(TOKEN_PATH, JSON.stringify(merged));
//     } else if (t.access_token) {
//       const existing = fs.existsSync(TOKEN_PATH) ? JSON.parse(fs.readFileSync(TOKEN_PATH)) : {};
//       const merged = { ...existing, ...t };
//       fs.writeFileSync(TOKEN_PATH, JSON.stringify(merged));
//     }
//   });

//       // console.log("tokens apres:", tokens);
//   // Retourne le service Google Drive authentifié
//   return google.drive({ version: "v3", auth: oAuth2Client });
// }
// Fonction pour obtenir un client Google Drive authentifié
async function  getAuthenticatedDriveClient() {
  // Crée un client OAuth2
  const oAuth2Client = createOAuth2Client();

  // Vérifie que le fichier de tokens existe
  if (!fs.existsSync(TOKEN_PATH)) {
    // Si le fichier de tokens n'existe pas, crée un nouveau client OAuth2 et obtient les tokens
    const newTokens = await obtainNewTokens();
    // Écrit les nouveaux tokens dans le fichier
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(newTokens));
  }

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

// Fonction pour obtenir de nouveaux tokens en échangeant le code d'autorisation
async function obtainNewTokens() {
  // Récupère le code d'autorisation depuis l'URL
  const code = process.env.AUTHORIZATION_CODE;

  // Crée un client OAuth2
  const oAuth2Client = createOAuth2Client();

  // Échange le code contre des tokens d'accès
  const { tokens } = await oAuth2Client.getToken(code);

  // Retourne les nouveaux tokens
  return tokens;
}
getAuthenticatedDriveClient()
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
    // Récupère l'id de la classe depuis le corps de la requête
    // const { classe_id } = req.body;
    const  classe_id  = 45;
    if (!classe_id) return res.status(400).json({ error: "classe_id manquant" });
    // Récupère le drive_folder_id depuis la base de données en fonction de la classe_id
    await db.query(
      "SELECT drive_folder_id FROM classe WHERE id_classe = ?",
      [classe_id], async (err, results) => {
        if (err) {
          console.error("Erreur lors de la requête SQL:", err);
          return res.status(500).json({ error: "Erreur serveur" });
        }
        // console.log("Résultat query:", results[0].drive_folder_id);
        // console.log("hello");
        req.drive_folder_id = results[0].drive_folder_id;
        // Prépare les métadonnées du fichier
        const fileMetadata = {
          name: req.file.originalname,
          parents: [req.drive_folder_id],
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
              fields: "id, name, mimeType, parents, webViewLink,webContentLink",
            });
            // ✅ Donne accès public
          const permissions= await drive.permissions.create({
              fileId: response.data.id,
              requestBody: {
                role: "reader",
                type: "anyone",
              },
            });
            console.log("Permissions actuelles :", permissions.data);

            // ✅ Génère un lien utilisable directement dans <img>
            const fileId = response.data.id;
            const imageUrl = `https://drive.google.com/uc?id=${fileId}`;

            req.fileUploadResult = {
              ...response.data,
              imageUrl, // lien direct
            };
            // Ici: sauvegarde en BDD si souhaité (ex: drive_file_id = response.data.id)
            res.json({ success: true, file: response.data ,imageUrl:imageUrl});
      }
    );
    console.log("Résultat query req:", await req.drive_folder_id);
    // if (!rows ) {
    //   return res.status(404).json({ error: "Classe introuvable" });
    // }
    //     const drive_folder_id = rows.drive_folder_id;
    //     console.log("drive_folder_id:", drive_folder_id);
    //     // Prépare les métadonnées du fichier
    //     const fileMetadata = {
    //       name: req.file.originalname,
    //       parents: [drive_folder_id],
    //     };
    
    //     // Prépare le contenu du fichier et son type MIME
    //     const media = {
    //       mimeType: req.file.mimetype,
    //       body: stream,
    //     };
    
    //     // Upload le fichier vers Google Drive
    //     const response = await drive.files.create({
    //       requestBody: fileMetadata,
    //       media,
    //       fields: "id, name, mimeType, parents, webViewLink,webContentLink",
    //     });
    //     // ✅ Donne accès public
    //    const permissions= await drive.permissions.create({
    //       fileId: response.data.id,
    //       requestBody: {
    //         role: "reader",
    //         type: "anyone",
    //       },
    //     });
    //     console.log("Permissions actuelles :", permissions.data);

    //     // ✅ Génère un lien utilisable directement dans <img>
    //     const fileId = response.data.id;
    //     const imageUrl = `https://drive.google.com/uc?id=${fileId}`;

    //     req.fileUploadResult = {
    //       ...response.data,
    //       imageUrl, // lien direct
    //     };
    //     // Ici: sauvegarde en BDD si souhaité (ex: drive_file_id = response.data.id)
    //     res.json({ success: true, file: response.data ,imageUrl:imageUrl});
      
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
