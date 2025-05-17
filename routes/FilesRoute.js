import  express  from 'express';
import FileController from '../Controllers/FilesController.js';
import multer  from  "multer";
const  router = express.Router();
// irt  upload from '../middlewares/StockageDocument.js';
// DE STOCKAGE DES FICHIERS
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/Fichiers/Documents/");
  },
  filename: function (req, file, cb) {
    cb(null,  file.originalname);
  }
});
// Configuration de multer avec le storage défini
const upload = multer({ storage: storage });

// route pour uploader les documents de facons individuels
 router.post("/upload-file",upload.single('document'),FileController.AddDocuments);

// route pour effectuer le telechargement des fichier
router.get('/download/:filename', FileController.DownloadFiles);

// Route pour télécharger tous les documents d'un étudiant
router.get('/download/student/:nom/:prenom/:classe', FileController.downloadStudentDocuments);

// Route pour télécharger tous les documents d'une classe
router.get('/download/class/:classe', FileController.downloadClassDocuments);

export default router;