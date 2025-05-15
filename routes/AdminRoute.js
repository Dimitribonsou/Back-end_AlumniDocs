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
export default router;