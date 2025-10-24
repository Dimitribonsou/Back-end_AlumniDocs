// authRoutes.js

// Importe express pour créer le routeur
import express from "express";
// Importe fs pour lire/écrire des fichiers (ici pour stocker le token)
import fs from "fs";
// Importe la fonction pour créer un client OAuth2 Google
import { createOAuth2Client } from "./../config/authClient.js";
// Importe le module googleapis
import { google } from "googleapis";

// Crée un routeur express
const router = express.Router();
// Définit le chemin où le token sera sauvegardé
const TOKEN_PATH = "../token.json";

// Route GET /auth : lance le processus d'authentification Google
router.get("/auth", (req, res) => {
  // Crée un client OAuth2
  const oAuth2Client = createOAuth2Client();
  // Définit les scopes nécessaires (ici accès aux fichiers Drive)
  const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
  // Génère l'URL d'autorisation Google
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",      // nécessaire pour obtenir refresh_token
    prompt: "consent",           // force la demande de refresh_token
    scope: SCOPES,
  });
  // console.log("Visite cette URL pour autoriser l'application:", authUrl);
  // Redirige l'utilisateur vers l'URL d'autorisation Google
  res.redirect(authUrl);
});

// Route GET /oauth2callback : callback appelé par Google après l'authentification
router.get("/oauth2callback", async (req, res) => {
  // Récupère le code d'autorisation dans la query string
  const code = req.query.code;
  // Vérifie que le code est présent
  if (!code) return res.status(400).send("Code manquant");
  // Crée un client OAuth2
  const oAuth2Client = createOAuth2Client();
  try {
    // Échange le code contre des tokens d'accès
    const { tokens } = await oAuth2Client.getToken(code);
    // Sauvegarde les tokens dans un fichier local
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    // Configure le client OAuth2 avec les tokens pour la session
    oAuth2Client.setCredentials(tokens);

    // Affiche un message de succès à l'utilisateur
    res.send("Authentification réussie — token enregistré. Tu peux maintenant utiliser l'API.");
  } catch (err) {
    // Affiche l'erreur dans la console
    console.error("Erreur échange token:", err);
    // Retourne une erreur 500 en cas de problème
    res.status(500).send("Erreur lors de l'échange du code pour les tokens.");
  }
});

// Exporte le routeur pour l'utiliser dans l'application principale
export default router;
