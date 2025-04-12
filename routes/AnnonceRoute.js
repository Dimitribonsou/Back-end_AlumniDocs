import express from  "express";
const router = express.Router();
import multer  from  "multer";
import annonceController from './../Controllers/AnnonceController'
// DE STOCKAGE DES FICHIERS
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/Images");
  },
  filename: function (req, file, cb) {
    cb(null,  Date.now() + '-' + file.originalname);
  }
});
// Configuration de multer avec le storage défini
const upload = multer({ storage: storage });
//route pour l'ajout d'une annonce
router.post("/newAnnonce",upload.single('image'), annonceController.AddAnnonce);
//route pour la connection de l'utilisateur
// router.post("/Login", authcontroller.ConnectUser);
router.delete("/deleteAnnonce/:id", annonceController.DeleteAnnonces);
router.put("/UpdateAnnonce/:id", annonceController.UpdateAnnonce);
router.get("/getAnnonceDetail/:id", annonceController.getAnnonce);
router.get("/annonceList",annonceController.AllAnnonces);
// route permettant d'afficher les annonces par clase
router.get("/getAnnonceClasse/:id_classe", annonceController.getAnnonceByClasse);
router.get("/getAnnonceRecent/:id_classe", annonceController.getLastAnnonceByClasse);

export default router;