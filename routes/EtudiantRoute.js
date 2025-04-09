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
    cb(null, "public/Documents");
  },
  filename: function (req, file, cb) {
    cb(null,  Date.now() + '-' + file.originalname);
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
router.get("/UserList",authcontroller.AllUser);
router.get("/deconnect",authcontroller.DeconnectUser);

//implementation de l'authentification jwt 
router.post("/Loginjwt", authjwtcontroller.ConnectUser);
// Utilisation du middleware de vérification du jeton JWT
router.use("/protected", authjwtcontroller.verifyToken, (req, res) => {
  // Accès aux ressources protégées
  res.json({ message: `Bienvenue ${req.username} !` });
});


export default router;