import path from 'path';
import multer from 'multer';
import fs from 'fs';
import db from "../config/connection.js";
import fonction from "./function.js";
import JSZip from 'jszip';

 const NewFiles =  (req, res)  => {
    try {
        const files = req.files; // Les fichiers sont maintenant dans req.files
        const studentName = req.body.nom;

        if (!files || !files['document1'] || !files['document2']) {
            return res.status(400).json({
                message: "Les deux documents sont requis"
            });
        }
        const doc1Path = files['document1'][0].path;
        const doc2Path = files['document2'][0].path;
        
        // Ici, vous pouvez traiter les chemins des fichiers comme nécessaire
        // Par exemple, les sauvegarder dans la base de données

        res.status(200).json({
            message: "Documents téléversés avec succès",
            doc1: doc1Path,
            doc2: doc2Path
        });
        console.log("nom envoyer depuis le serveur: "+studentName);

    } catch (error) {
        console.log('Erreur lors du traitement des fichiers:', error);
        res.status(500).json({
            message: "Erreur lors du traitement des fichiers",
            error: error.message
        });
    }
};

const DownloadFiles= (req,res) => {
  const filename = req.params.filename;
  // chemin d'acces au fichier
  const filePath = path.join(__dirname, './../Images', filename);
  // Vérifier si le fichier existe avant de le télécharger
  res.download(filePath, filename, (err) => {
      if (err) {
          console.error('Erreur lors du téléchargement du fichier:', err);
          res.status(404).send('Fichier non trouvé');
      }
  });
}

// Fonction pour nettoyer le nom du fichier
const cleanFileName = (name) => {
  return name.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
};

// Fonction pour créer la structure de dossiers
const createFolderStructure = (nom, prenom, classe) => {
  const baseDir = 'public/Fichiers/Documents/';
  const classeDir = path.join(baseDir, classe.toUpperCase());
  const studentDir = path.join(classeDir, `${cleanFileName(nom)}_${cleanFileName(prenom)}`);
  
  // Créer les dossiers s'ils n'existent pas
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  if (!fs.existsSync(classeDir)) {
    fs.mkdirSync(classeDir, { recursive: true });
  }
  if (!fs.existsSync(studentDir)) {
    fs.mkdirSync(studentDir, { recursive: true });
  }
  
  return studentDir;
};

// Configuration de multer mise à jour
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    try {
      const { nom, prenom, classe } = req.body;
      const studentFolder = createFolderStructure(nom, prenom, classe);
      cb(null, studentFolder);
    } catch (error) {
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    const { nom, classe, type_document } = req.body;
    const timestamp = Date.now();
    const newFileName = `${cleanFileName(nom)}_${cleanFileName(classe)}_${cleanFileName(type_document)}_${timestamp}${path.extname(file.originalname)}`;
    cb(null, newFileName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non supporté: ${file.mimetype}`), false);
  }
};

const upload = multer({
  storage: storage,
  // fileFilter: fileFilter,
  limits: {
    fileSize: 1 * 1024 * 1024, // 1MB
    files: 10
  }
}).array('documents', 10);

const handleUpload = (req, res, next) => {
  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'La taille du fichier dépasse la limite de 5MB'
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Trop de fichiers. Maximum 10 fichiers autorisés'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Erreur lors de l\'upload',
        error: err.message
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
};

const uploadDocuments = async (req, res) => {
  try {
    console.log("Début de l'upload");
    console.log("Body:", req.body);
    console.log("Files:", req.files);
  q
   
    const {
      id_etudiant,
      documentTypes,
    } = req.body;

    const annee_scolaire = fonction.obtenirAnneeScolaire();
    const results = [];
    const errors = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const documentType = documentTypes ? documentTypes[i] : 'DOCUMENT';

      try {
        const query = `
          INSERT INTO documents 
          (libelle, statut_document, id_etudiant, annee_scolaire, chemin) 
          VALUES (?, ?, ?, ?, ?)
        `;

        const chemin_fichier = file.path.replace('public', '');
        
        await new Promise((resolve, reject) => {
          db.query(
            query,
            [
              documentType,
              'en attente',
              id_etudiant,
              annee_scolaire,
              chemin_fichier,
            ],
            (err, result) => {
              if (err) {
                reject(err);
                return;
              }
              results.push({
                id: result.insertId,
                nom: file.filename,
                chemin: chemin_fichier,
                type: documentType,
                statut: 'en attente'
              });
              resolve();
            }
          );
        });
      } catch (error) {
        errors.push({
          filename: file.originalname,
          error: error.message
        });
      }
    }

    console.log("Documents Uploadés avec succès");
    res.status(200).json({
      success: true,
      message: "Documents uploadés avec succès",
      data: {
        success: results,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    console.error("Erreur lors de l'upload:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'upload des documents",
      error: error.message
    });
  }
};

// Nouvelle fonction pour télécharger tous les documents d'un étudiant
const downloadStudentDocuments = async (req, res) => {
  try {
    const { nom, prenom, classe } = req.params;
    const studentDir = path.join('public/Documents/Etudiants', classe.toUpperCase(), `${cleanFileName(nom)}_${cleanFileName(prenom)}`);
    
    if (!fs.existsSync(studentDir)) {
      return res.status(404).json({
        success: false,
        message: "Aucun document trouvé pour cet étudiant"
      });
    }

    const files = fs.readdirSync(studentDir);
    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Aucun document trouvé pour cet étudiant"
      });
    }

    // Créer un fichier ZIP contenant tous les documents
    const zip = new JSZip();
    files.forEach(file => {
      const filePath = path.join(studentDir, file);
      zip.file(file, fs.readFileSync(filePath));
    });

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${nom}_${prenom}_documents.zip`);
    res.send(zipBuffer);

  } catch (error) {
    console.error("Erreur lors du téléchargement:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors du téléchargement des documents",
      error: error.message
    });
  }
};

// Nouvelle fonction pour télécharger tous les documents d'une classe
const downloadClassDocuments = async (req, res) => {
  try {
    const { classe } = req.params;
    const classeDir = path.join('public/Documents/Etudiants', classe.toUpperCase());
    
    if (!fs.existsSync(classeDir)) {
      return res.status(404).json({
        success: false,
        message: "Aucun document trouvé pour cette classe"
      });
    }

    const zip = new JSZip();
    const students = fs.readdirSync(classeDir);

    for (const student of students) {
      const studentDir = path.join(classeDir, student);
      if (fs.statSync(studentDir).isDirectory()) {
        const files = fs.readdirSync(studentDir);
        files.forEach(file => {
          const filePath = path.join(studentDir, file);
          zip.file(`${student}/${file}`, fs.readFileSync(filePath));
        });
      }
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${classe}_documents.zip`);
    res.send(zipBuffer);

  } catch (error) {
    console.error("Erreur lors du téléchargement:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors du téléchargement des documents",
      error: error.message
    });
  }
};

/** gerer l'upload des documents de facon individuel */
//controller permettant d'enregistrer un nouvelle utilisateur
const AddDocuments= async (req, res) => {
  try {
    InsertDocument(req, res);
  } catch (err) {
    res.send("une erreur c'est produite : " + err);
  }
};
// fonction permettant d'enregistrer un etudiant
const InsertDocument= async (req, res) => {
  console.log("insertion document en cours");
  const libelle = req.body.libelle;
  const id_etudiant= req.body.id_etudiant;
  // const nomFichier = req.file.filename;
  // const fileRequete=req.file;
  // const reqestFileName=fileRequete.filname;
  const reqestFileName=req.file ? req.file.filename : "";

  const annee_scolaire=fonction.obtenirAnneeScolaire();
  console.log(annee_scolaire);
  let q =
    "INSERT INTO `documents`( `libelle`, `id_etudiant`, `annee_scolaire`,nom_fichier) VALUES (?,?,?,?)";
  db.query(
    q,
    [libelle,id_etudiant,annee_scolaire,reqestFileName],
    (err) => {
      if (err)
        {
          res.send("Une erreur est survenue.");
          console.log("Une erreur est survenue.");
          throw err;
        } 
          
      res.status(200).send("Document Enregistrer  avec success !");
    }
  );
};
const FileController = {
  handleUpload,
  uploadDocuments,
    NewFiles,
  DownloadFiles,
  downloadStudentDocuments,
  downloadClassDocuments,
  AddDocuments
};

export default FileController;

