import express  from "express";
const app = express();
import cors  from "cors";
import bodyParser  from "body-parser";
import etudiantRoute from './routes/EtudiantRoute.js';
import filesRoute from './routes/FilesRoute.js';
import requestsRoute from './routes/RequeteRoute.js';

import path from  'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
// Configurer l'acces aux variables d'environnement
dotenv.config();
//importer le midelwares cors pour autoriser la communication avec different serveur
app.use(cors());
//importer les midelwares pour autoriser l'envoie des donnees au format json au serveur
app.use(bodyParser.urlencoded({ extends: true }));
app.use(bodyParser.json());
app.use(express.json())
// Créer les variables de chemin
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
// autoriser l'acces aux fichier images par le serveurs
app.use('/public',express.static(path.join(__dirname,'./public')));
//importer les routes du projet
app.use("/AlumniDocs-API",etudiantRoute);
app.use("/AlumniDocs-API",filesRoute);
//Ajouter la route pour la gestion des Requetes
app.use("/AlumniDocs-API",requestsRoute);

const port =process.env.PORT || 5000;

app.listen(port, (err) => {
  console.log(`serveur demarrer sur l'adresse http://localhost:${port}/AlumniDocs-API`);
});


