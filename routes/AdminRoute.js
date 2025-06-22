import express from  "express";
const router = express.Router();
import adminController from "../Controllers/AdminControlleur.js";

// gestion des routes pour la gestion des classes
router.delete("/deleteClass/:id", adminController.DeleteClasse);
router.put("/UpdateClass/:id", adminController.UpdateClasse);
router.post("/NewClass", adminController.AddClasse);
router.get("/getClass/:id", adminController.getclasse);
router.get("/getStudentClass/:id", adminController.getStudentClasse);
router.get("/ClassList",adminController.AllClasses);
// gestion des routes pour la gestion des filieres
router.post("/NewFiliere", adminController.AddFiliere);
router.delete("/deleteFiliere/:id", adminController.DeleteFiliere);
router.put("/UpdateFiliere/:id", adminController.UpdateFiliere);
router.get("/FiliereList",adminController.AllFiliere);
// afficher les satistiques 
router.get("/statInfos",adminController.StatistiqueResult)
router.get("/StatChartJS",adminController.StatChartJs)
// gerer les routes liees aux administrateurs
router.post("/NewAdmin", adminController.NewAdmin);
router.delete("/deleteAdmin/:id", adminController.DeleteAdmin);
router.get("/AdminList",adminController.AllAdmin);
//route pour envoyer automatiquement les notifications aux utilisateurs
router.post("/NewNotification", adminController.getnotification);
export default router;