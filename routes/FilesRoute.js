import  express  from 'express';
import FileController from '../Controllers/FilesController.js';
const  router = express.Router();
import  upload from '../middlewares/StockageDocument.js';
import  {captureStudentName} from '../middlewares/captureStudentName.js';

// // Modifier la route pour utiliser le middleware de capture du nom
router.post('/upload', 
    captureStudentName, // Capturer le nom avant l'upload
    express.urlencoded({ extended: true }), // Pour parser le corps de la requête
    upload.fields([
        { name: 'document1', maxCount: 1 },
        { name: 'document2', maxCount: 1 }
    ]), 
    FileController.NewFiles
);

router.post('/upload-documents',
  express.urlencoded({ extended: true }),
  FileController.uploadDocuments
);
// router.post('/upload-documents',
//   express.urlencoded({ extended: true }),
//   FileController.handleUpload,
//   FileController.uploadDocuments
// );

//     // Middleware de gestion d'erreur pour captureStudentName
//     async (req, res, next) => {
//         try {
//             await captureStudentName(req, res, next);
//         } catch (error) {
//             return res.status(500).json({
//                 success: false,
//                 message: "Erreur lors de la capture du nom",
//                 error: error.message
//             });
//         }
//     },
//     // Middleware de gestion d'erreur pour upload
//     (req, res, next) => {
//         upload.fields([
//             { name: 'document1', maxCount: 1 },
//             { name: 'document2', maxCount: 1 }
//         ])(req, res, (err) => {
//             if (err) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Erreur lors de l'upload des fichiers",
//                     error: err.message
//                 });
//             }
//             next();
//         });
//     },
//     // Handler final
//     async (req, res) => {
//         try {
//             // Vérifier que tous les fichiers sont présents
//             if (!req.files || !req.files['document1'] || !req.files['document2']) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Tous les fichiers requis n'ont pas été fournis"
//                 });
//             }

//             res.status(200).json({
//                 success: true,
//                 message: "Upload réussi",
//                 files: {
//                     document1: req.files['document1'][0].filename,
//                     document2: req.files['document2'][0].filename
//                 }
//             });
//         } catch (error) {
//             res.status(500).json({
//                 success: false,
//                 message: "Erreur lors du traitement final",
//                 error: error.message
//             });
//         }
//     }
// );


// route pour effectuer le telechargement des fichier
router.get('/download/:filename', FileController.DownloadFiles);

// Route pour télécharger tous les documents d'un étudiant
router.get('/download/student/:nom/:prenom/:classe', FileController.downloadStudentDocuments);

// Route pour télécharger tous les documents d'une classe
router.get('/download/class/:classe', FileController.downloadClassDocuments);

export default router;