
// Importe la fonction pour créer un client OAuth2 Google
import { createOAuth2Client } from "./../config/authClient.js";
// Importe le module googleapis
import { google } from "googleapis";
// Importe Readable pour transformer un buffer en stream
import { Readable } from "stream";
// Importe fs pour lire/écrire des fichiers (ici pour stocker le token)
import fs from "fs";
// Importe dotenv pour charger les variables d'environnement
import dotenv from "dotenv";
// Charge les variables d'environnement
dotenv.config();

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

/**
 * Middleware pour uploader un fichier vers Google Drive
 * @param {Object} req - Objet Requête
 * @param {Object} res - Objet Response
 * @param {Function} next - Fonction à appeler pour continuer le traitement
 * @throws {Error} - Erreur si le fichier n'est pas envoyé
 */
const upload_file_template = async (req, res, next) => {
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
    let request_type = req.body.request_type;
    let  drive_folder_id='';
    //verfie le type de la requete et affecte le dossier correspondant
     if(request_type!='' && request_type!="Requete")
          drive_folder_id=process.env.ANNONCE_FOLDER_ID;
        else
           drive_folder_id=process.env.REQUEST_FOLDER_ID;
   
        //  console.log("request_type",request_type);
        //  console.log("drive_folder_id",drive_folder_id);
        // Prépare les métadonnées du fichier
        const fileMetadata = {
          name: req.file.originalname,
          parents: [drive_folder_id],
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
        // ✅ Rendre le fichier lisible par tout le monde
        drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
            role: "reader",
            type: "anyone",
        },
        });
        // Ici: sauvegarde en BDD si souhaité (ex: drive_file_id = response.data.id)
        req.fileUploadResult = response.data; // Stocke le résultat dans req pour l'utiliser dans le middleware suivant
        // res.json({ success: true, file: response.data });
        // Passe au middleware suivant si nécessaire
        // console.log("Fichier uploadé vers Drive :", response.data);
        next(); 
  } catch (err) {
    // Affiche l'erreur dans la console
    console.error("Upload error:", err);
    // Retourne une erreur 500 en cas de problème
    res
      .status(500)
      .json({ error: "Erreur upload vers Drive", details: err.message });
  }
};
export default upload_file_template;