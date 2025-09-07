// driveClient.js
import dotenv from 'dotenv';
dotenv.config();
// Importe le module googleapis pour accéder aux API Google
import { google } from "googleapis";
// Importe le module path pour gérer les chemins de fichiers
import path from "path";

// Définit le chemin du fichier de clés d'authentification Google
const KEYFILE = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(process.cwd(), "credentials.json");
// Définit les permissions minimales nécessaires pour accéder à Google Drive
const SCOPES = ["https://www.googleapis.com/auth/drive.file"]; // privilégier le scope minimal

// Crée une instance d'authentification Google avec le fichier de clés et les scopes définis
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILE,
  scopes: SCOPES,
});

// Fonction asynchrone qui retourne un service Google Drive authentifié
export async function getDriveService() {
  // Obtient le client d'authentification
  const authClient = await auth.getClient();
  // Retourne le service Google Drive configuré avec le client d'authentification
  return google.drive({ version: "v3", auth: authClient });
}
