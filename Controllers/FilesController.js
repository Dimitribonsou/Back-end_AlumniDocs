import path from 'path';
import multer from 'multer';
import fs from 'fs';
import db from "../connection.js";
import fonction from "./function.js";

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

// Fonction pour créer le chemin du dossier de l'étudiant
const createStudentFolder = (nom, prenom, filiere) => {
  const baseDir = 'public/Documents/Etudiants';
  const studentFolder = path.join(baseDir, `${cleanFileName(nom)}_${cleanFileName(prenom)}_${cleanFileName(filiere)}`);
  
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  
  if (!fs.existsSync(studentFolder)) {
    fs.mkdirSync(studentFolder, { recursive: true });
  }
  
  return studentFolder;
};

// Configuration de multer
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    try {
      const id_etudiant = req.body.id_etudiant;
      const nom = req.body.nom;
      const classe = req.body.classe;
     // const query = "SELECT nom, prenom, classe FROM etudiant e JOIN inscription i ON e.id_utilisateur = i.id_etudiant WHERE e.id_utilisateur = ?";
      
    //   db.query(query, [id_etudiant], (err, results) => {
    //     if (err || results.length === 0) {
    //       return cb(new Error('Étudiant non trouvé'));
    //     }
        
        // const { nom, prenom, classe } = results[0];
        const studentFolder = createStudentFolder(nom, prenom, classe);
        cb(null, studentFolder);
    //   });
    } catch (error) {
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    const documentType = req.body.documentTypes ? 
      req.body.documentTypes[file.fieldname] : 'DOCUMENT';
    const timestamp = Date.now();
    const newFileName = `${cleanFileName(documentType)}_${timestamp}${path.extname(file.originalname)}`;
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
  fileFilter: fileFilter,
  limits: {
    fileSize: 1 * 1024 * 1024, // 5MB
    files: 10
  }
}).array('files', 10);

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
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Aucun fichier n'a été uploadé"
      });
    }

    const {
      id_etudiant,
      documentTypes,
      descriptions
    } = req.body;

    const annee_scolaire = fonction.obtenirAnneeScolaire();
    const results = [];
    const errors = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const documentType = documentTypes[i] || 'DOCUMENT';
      const description = descriptions[i] || '';

      try {
        const query = `
          INSERT INTO documents 
          (libelle, statut_document, id_etudiant, annee_scolaire) 
          VALUES (?, ?, ?, ?)
        `;

        const chemin_fichier = file.path.replace('public', '');
        
        await new Promise((resolve, reject) => {
          db.query(
            query,
            [documentType, 'en attente', id_etudiant, annee_scolaire],
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

const FileController = {
  handleUpload,
  uploadDocuments,
  NewFiles,
  DownloadFiles
};

export default FileController;