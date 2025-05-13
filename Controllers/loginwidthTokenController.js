import  bcrypt from "bcrypt";
import jwt  from  "jsonwebtoken";
import db  from  "./../connection.js";
import dotenv from 'dotenv'
// Configurer l'acces aux variables d'environnement
dotenv.config();
const  JWT_SECRET = process.env.JWT_SECRET;
// Fonction pour générer un jeton JWT
function generateToken(userId, username) {
  const token = jwt.sign({ userId, username }, JWT_SECRET, {
    expiresIn: "1h",
  });
  return token;
}

// Middleware de vérification du jeton JWT
const verifyToken = (req, res, next) => {
  // recuperer le token de la requete 
  const token = req.headers.authorization?.split(" ")[1];
// si le token est manquant renvoyer une erreur
  if (!token) {
    return res
      .status(401)
      .json({ message: "Jeton d'authentification manquant" });
  }

  try {
    // decoder le token pour recuperer les infos qui sont stocker
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.username = decoded.username;
    // passer au middlewares suivant si les operations sont bien effectuer
    next();
  } catch (err) {
    return res
      .status(403)
      .json({ message: "Jeton d'authentification invalide" });
  }
};

// Méthode pour la connexion de l'utilisateur
const ConnectUser = async (req, res, next) => {
  try {
    console.log("envoyer par jamila");
    const email = req.body.email;
    const password = req.body.password;
    const query = "SELECT `id_utilisateur`, `nom`, `prenom`, `email`, `password` FROM `etudiant` WHERE  `email`=?";
    db.query(query, [email], async (err, results) => {
      if (err) {
        return res
          .json({ message: "Une erreur s'est produite lors de la requête" });
      }

      if (results.length === 0) {
        return res.json({islogin:false, message: "Email ou mot de passe incorect" });
      }
      //stocker le resultat de la requete dans la constante user
      const user = results[0];
      //verifier si les mots de passe corresponde avec la methode compare
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.json({islogin:false, message: "Email ou mot de passe incorect" });
      }
     //generer un token apres connection
      const token = generateToken(user.id_utilisateur, user.nom);
// retourner les infos de l'utilisateur connecter au client 
      res.status(200).json({
        islogin:true,
        token_key:token,
        iduser: user.id_utilisateur,
        nom: user.nom,
        prenom: user.prenom,
        telephone: user.telephone,
        email: user.email,
        message: "Connexion réussie",
      });
    });
  } catch (err) {
    return res
      .json({
           islogin:false,
           message: "Une erreur s'est produite : " + err
         });
  }
};

const authjwtcontroller={
  ConnectUser,
  verifyToken
};
export default authjwtcontroller;
