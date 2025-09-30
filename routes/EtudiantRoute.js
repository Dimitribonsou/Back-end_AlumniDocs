import express from  "express";
const router = express.Router();
import multer  from  "multer";
import session  from  "express-session";
import authcontroller  from  "../Controllers/EtudiantController.js";
import authjwtcontroller  from  "../Controllers/loginwidthTokenController.js";
import dotenv from 'dotenv'
// activer les fichiers de configuration dans ce fichier
dotenv.config();
//DEFINIR LE CHEMIN DE STOCKAGE DES FICHIERS
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/Fichiers/Profils/");
  },
  filename: function (req, file, cb) {
    cb(null,  Date.now().toFixed() + '-' + file.originalname);
  }
});
// Créez un objet "multer" avec les options de stockage 
const upload = multer({ storage: storage });
router.use(
  session({
    secret:process.env.SESSION_SECRET ,
    resave: false,
    saveUninitialized: true,
  })
);

//route pour l'authentification
router.post("/NewAccount", authcontroller.AddUser);
router.get("/", authcontroller.Welcome);
//route pour la connection de l'utilisateur
// router.post("/Login", authcontroller.ConnectUser);
router.delete("/deleteUser/:id", authcontroller.Deleteusers);
router.put("/UpdateUser/:id", authcontroller.UpdateUserInfo);
router.get("/getUser/:id", authcontroller.getUser);
router.get("/UserList",authcontroller.AllStudent);
router.get("/deconnect",authcontroller.DeconnectUser);

//afficher la liste des etudiants en fonction des classes
router.get("/studenClass",authcontroller.getStudentByClass);
// definir les routes pour recuperer les infos du profil et de l'etudiant
router.get("/getProfil/:id_user", authcontroller.getProfilInfos);
router.get("/getIncription/:id_user", authcontroller.getIncriptionInfos);
router.post("/newIncription", authcontroller.AddIncription);
router.post("/newProfil",upload.single('photo'),authcontroller.AddProfil);
router.get('/studentDetail/:id', authcontroller.getStudentCompleteInfo);
//implementation de l'authentification jwt 
// router.post('/Loginjwt', authjwtcontroller.ConnectUser);
router.post('/Loginjwt', authjwtcontroller.initiateLogin);
router.post('/login-otp', authjwtcontroller.initiateLogin);
router.post('/verify-otp', authjwtcontroller.verifyOTP);
router.get('/profile-completion/:id', authcontroller.getProfileCompletionRate);
//Route pour recuperer les infos sur les types de documents
router.get('/doc-type-infos/:id_user', authcontroller.getDocTypeInfos);

export default router;