import express from  "express";
const router = express.Router();
import multer  from  "multer";
import requeteController from "../Controllers/RequeteController.js";

// DE STOCKAGE DES FICHIERS
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/Fichiers/Requetes/");
  },
  filename: function (req, file, cb) {
    cb(null,  file.originalname);
  }
});
// Configuration de multer avec le storage défini
const upload = multer({ storage: storage });
//route pour l'ajout d'une requete
router.post("/newRequest",upload.single('piece_jointe'), requeteController.Addrequete);
// route pour la suppression d'une requete
router.delete("/deleteRequest/:id_requete", requeteController.DeleteRequete);
// route pour la mise a jour d'une requete
router.put("/UpdateRequest/:id_requete", requeteController.UpdateRequete);
// route pour l'affichage des details d'une requete
router.get("/getRequestDetail/:id_requete", requeteController.getRequeteDetail);
// route pour l'affichage des routes d'une requete
router.get("/requestList",requeteController.AllRequete);
// route pour l'envoie d'une nouvelle notification
router.post("/pushNotification",requeteController.AddNotification);
// afficher la liste des notifications d'un etudiant pour une annee scolaire
router.get("/getStudentNotification/:id_etudiant",requeteController.getNotification)


export default router;