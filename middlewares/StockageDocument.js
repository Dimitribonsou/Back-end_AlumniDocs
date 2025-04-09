// Importation des modules nécessaires
import  fs  from 'fs';        // Module pour gérer les opérations sur les fichiers
import  path  from 'path';    // Module pour gérer les chemins de fichiers
import  multer  from 'multer';
// recuperer le nom capturer dans le middleware captureStudentName
import  {sharedData} from './captureStudentName.js';
// Configuration du stockage pour multer
const storage = multer.diskStorage({
    // Fonction pour déterminer le dossier de destination des fichiers
    destination: function (req, file, cb) {
        // Récupérer et formater le nom de l'étudiant en majuscules
        const studentName = req.studentName ? req.studentName.toUpperCase() : sharedData.studentName.toUpperCase();
         console.log("recuperation du nom dans destination() : "+studentName)
        // Construire le chemin complet du dossier (ex: ./../back-end/Documents/BONSOU)
        const studentDir = path.join('./../back-end/Documents', studentName);
        
        try {
            // Créer le dossier s'il n'existe pas, sinon utiliser l'existant
            // { recursive: true } permet de créer les dossiers parents si nécessaire
            fs.mkdirSync(studentDir, { recursive: true });
            
            // Log pour le suivi des opérations
            console.log(`Utilisation du dossier: ${studentDir}`);
            
            // Callback avec le chemin du dossier (null = pas d'erreur)
            cb(null, studentDir);
        } catch (error) {
            // En cas d'erreur, log et transmission de l'erreur via le callback
            console.error(`Erreur avec le dossier: ${error}`);
            cb(error, null);
        }
    },

    // Fonction pour déterminer le nom du fichier
    filename: function (req, file, cb) {
        // Récupérer et formater le nom de l'étudiant en majuscules
        const studentName = req.studentName ? req.studentName.toUpperCase() : sharedData.studentName.toUpperCase();
        
        // Initialiser le préfixe du fichier
        let prefix = '';
        
        // Déterminer le préfixe en fonction du type de document
        if (file.fieldname === 'document1') {
            prefix = 'CSI3-DLW-BAC-';
        } else if (file.fieldname === 'document2') {
            prefix = 'CSI3-DLW-PROB-';
        }
        
        // Construire le nouveau nom de fichier (ex: CSI3-DLW-BAC-BONSOU.pdf)
        const newFilename = prefix + studentName + path.extname(file.originalname);
        
        // Construire le chemin complet du fichier
        const fullPath = path.join('./../back-end/Documents', studentName, newFilename);
        
        try {
            // Vérifier si un fichier avec le même nom existe déjà
            if (fs.existsSync(fullPath)) {
                // Si oui, supprimer l'ancien fichier
                fs.unlinkSync(fullPath);
                // Log pour suivre la suppression
                console.log(`Ancien fichier supprimé: ${newFilename}`);
            }
            
            // Log pour suivre la création/remplacement
            console.log(`Création/Remplacement du fichier: ${newFilename}`);
            
            // Callback avec le nouveau nom de fichier (null = pas d'erreur)
            cb(null, newFilename);
        } catch (error) {
            // En cas d'erreur, log et transmission de l'erreur via le callback
            console.error(`Erreur lors du traitement du fichier: ${error}`);
            cb(error, null);
        }
    }
});

// Exemple de structure de dossiers créée :
/*
Documents/
  └── BONSOU/
      ├── CSI3-DLW-BAC-BONSOU.pdf    // Premier document
      └── CSI3-DLW-PROB-BONSOU.pdf   // Deuxième document
*/

// Configuration de multer avec le storage défini
const upload = multer({ storage: storage });

// Export du middleware pour l'utiliser dans les routes
export default upload;