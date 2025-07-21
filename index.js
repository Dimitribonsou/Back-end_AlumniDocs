import express  from "express";
const app = express();
import cors  from "cors";
import bodyParser  from "body-parser";
import etudiantRoute from './routes/EtudiantRoute.js';
import filesRoute from './routes/FilesRoute.js';
import requestsRoute from './routes/RequeteRoute.js';
import AdminRoute from './routes/AdminRoute.js';
import AnnonceRoute from './routes/AnnonceRoute.js'
import ImageRoute from './routes/ImageRoute.js'
import path from  'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
// Configurer l'acces aux variables d'environnement
dotenv.config();
//importer le midelwares cors pour autoriser la communication avec different serveur
app.use(cors());
app.use(cors({
  origin: '*',
  // credentials: true
}));

//importer les midelwares pour autoriser l'envoie des donnees au format json au serveur
app.use(bodyParser.urlencoded({ extends: true }));
// Middleware pour parser les données du formulaire
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json())
// Créer les variables de chemin
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
// autoriser l'acces aux fichier images par le serveurs
app.use('/public',express.static(path.join(__dirname,'./public')));
// Servir les fichiers statiques depuis le dossier public
app.use('/public', express.static('public'));
//importer les routes du projet
app.use("/AlumniDocs-API",etudiantRoute);
app.use("/AlumniDocs-API",filesRoute);
app.use("/AlumniDocs-API",AnnonceRoute);
app.use("/AlumniDocs-API",ImageRoute);
//Ajouter la route pour la gestion des Requetes
app.use("/AlumniDocs-API",requestsRoute);
app.use("/AlumniDocs-API",AdminRoute);
// message d'acceuil
app.get("/",(req,res)=>{
  res.status(200).send("Welcome to AlumniDocs API Build By DIMIDEV");
})
const port =process.env.PORT || 5000;
// const HOST = '172.20.10.3'; // ton IP locale
const HOST = 'localhost'; // ton IP locale
app.listen(port, (err) => {
  console.log(`serveur demarrer sur l'adresse http://${HOST}:${port}/AlumniDocs-API`);
});


