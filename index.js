import dotenv from 'dotenv';
// Configurer l'acces aux variables d'environnement
dotenv.config();
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
import driveRoutes from './routes/DriveRoutes.js';
// import uploadRoute from './routes/uploadRoute.js';
import authRoute from './routes/AuthRoute.js';
import listAndDownloadRoute from './routes/listAndDownload.js';
import path from  'path';
import { fileURLToPath } from 'url';
//importer le midelwares cors pour autoriser la communication avec different serveur
app.use(cors());
const allowedOrigins = [
  'http://localhost:3000',
  'https://front-end-alumni-docs.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // autorise les outils comme Postman ou requêtes sans origine
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // à activer si tu envoies des cookies ou des headers personnalisés
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
//Ajouter les routes pour l'upload et le listing des fichiers Drive
app.use("/AlumniDocs-API", driveRoutes);
// app.use("/AlumniDocs-API", uploadRoute);
app.use("/AlumniDocs-API", authRoute);
app.use("/AlumniDocs-API", listAndDownloadRoute);
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


