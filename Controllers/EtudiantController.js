import  db from "../connection.js";
//middleware our le cryptage
import  bcrypt from "bcrypt";

//###############################################  gerer l'authentification des utilisateurs #################################

// fonction de hachage de mot de passe
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}
//*********************methode pour l'envoie des donnees au serveur************************** */
const ConnectUser = async (req, res, next) => {
  try {
    let data = {
      iduser: null,
      nom: null,
      email: null,
      mdp: null,
      statut: false,
      message: null,
    };
    const email = req.body.email;
    const password = req.body.password;
    console.log("email envoyer : " + email);
    console.log("password envoyer : " + password);
    const rep = "SELECT  * FROM `utilisateur` WHERE  `EMAIL`=?";

    db.query(rep, [email], async (err, results, fields) => {
      if (err) {
        res.status(500).send("Une erreur s'est produite lors de la requête");
        return null;
      }
      if (results.length === 0) {
        data = {
          iduser: null,
          nom: null,
          email: null,
          mdp: null,
          statut: false,
          message: "Email invalid",
        };
        res.json(data);
        return;
      }
      //comparer le mot de passe hacher stocker dans la base de donnee avec celui saisie par l'utilisateur
      else if (
        results[0].PASSWORD != null &&
        results[0].PASSWORD != undefined
      ) {
        const passwordexist = await bcrypt.compare(
          password,
          results[0].PASSWORD
        );
        console.log("password encrypter : " + passwordexist);
        if (!passwordexist) {
          data = {
            iduser: null,
            nom: null,
            email: null,
            mdp: null,
            statut: false,
            message: "Mot de passe Invalid",
          };
          res.json(data);
          return;
        }
        // stocker les informations de l'utilisateur dans les variables de session (nom, photo, idUser)
        req.session.idusers = results[0].ID_USER;
        req.session.nom = results[0].USERNAME;
        req.session.email = results[0].EMAIL;
        req.session.password = results[0].PASSWORD;
        data = {
          iduser: req.session.idusers,
          nom: req.session.nom,
          email: req.session.email,
          mdp: req.session.password,
          statut: true,
          message: "utilisateur connecter avec succes ! ",
        };
        // // si c'est un administrateur
        // if (results[0].ROLE === 1) {
        //   // renvoyer vers l'interface de l'administrateur
        //   console.log("adminnistrateur connecter");
        //   res.json(data);
        //   return ;
        // }
        // renvoyer vers la page d'acceuil
        console.log("utilisateur connecter avec succes ! ", data);
        res.json(data);
        return;
      } else {
        data = {
          iduser: null,
          nom: null,
          email: null,
          mdp: null,
          statut: false,
          message: "Email et Mot de passe Incorect",
        };
        res.json(data);
        return;
      }
    });
  } catch (err) {
    res.status(500).send("une erreur c'est produite : " + err);
  }
};
// message de bienvenue
const Welcome=async(req,res)=>{
  res.status(200).send("Welcome to AlumniDocs API");
}
//controller permettant d'enregistrer un nouvelle utilisateur
const AddUser = async (req, res) => {
  try {
    InsertUser(req, res);
  } catch (err) {
    res.status(500).send("une erreur c'est produite : " + err);
  }
};
// fonction permettant d'enregistrer un etudiant
const InsertUser = async (req, res) => {
  const password = req.body.password;
  // console.log(password);
  const passwordhached = await hashPassword(password);
  let q =
    "INSERT INTO `etudiant`( `nom`, `prenom`, `email`, `telephone`, `password`, `genre`) VALUES (?,?,?,?,?,?)";
  db.query(
    q,
    [req.body.nom,req.body.prenom, req.body.email,req.body.telephone, passwordhached, req.body.genre],
    (err) => {
      if (err) throw err;
      res.status(200).send("Creation de compte effectuer avec success !");
    }
  );
};
const UpdateUserInfo = async (req, res) => {
  try {
    UpdateUser(req, res);
  } catch (err) {
    res.status(500).send("une erreur c'est produite : " + err);
  }
};
// methode permettant de modifier les infos d'un utilisateur
const UpdateUser = async (req, res) => {
  const id_user = req.params.id;
  // const password = req.body.password;
  // console.log(password);
  // const passwordhached = await hashPassword(password);
  let q =
    "UPDATE `etudiant` SET `nom`=?,`prenom`=?,`email`=?,`telephone`=?,`matricule`=? WHERE id_utilisateur=? ";
  db.query(
    q,
    [req.body.nom,req.body.prenom, req.body.email, req.body.telephone, req.body.matricule, id_user],
    (err) => {
      if (err) throw err;
      console.log("mise a jour effectuer ave succes ! ");
      res.status(200).send("mise a jour effectuer avec success !");
    }
  );
};
// methode permettant de deconnecter un utilisateur
const DeconnectUser = (req, res) => {
  try {
    // req.session.nom="user";
    req.session.destroy();
    res.redirect("/");
  } catch (err) {
    res.status(500).send("une erreur c'est produite : " + err);
  }
};
// methode permettant de supprimer un etudiant
const Deleteusers = async (req, res) => {
  try {
    const id = req.params.id;
    const q = "DELETE FROM `etudiant` WHERE `id_utilisateur`=? ";
    db.query(q, [id], (err) => {
      if (err)
        res
          .satus(500)
          .send(
            "une erreur c'est produite lors de l'executtion de la requete : " +
              err
          );
      res.status(200).send("utilisateur suprimer avec success");
    });
  } catch (err) {
    res.status(500).send("une erreur c'est produite : " + err);
  }
};
// controller permettant d'afficher la liste de tout les etudiants
const AllUser = async (req, res) => {
  try {
    const q = "SELECT `id_utilisateur`, `nom`, `prenom`, `email`, `telephone`, `statut_compte`, `matricule`  FROM `etudiant` ORDER BY `nom` ASC";
    db.query(q, (err, results) => {
      if (err)
        res
          .status(500)
          .send(
            "une erreur c'est produite lors de l'executtion de la requete "
          );
      res.status(200).send(JSON.stringify(results));
    });
  } catch (err) {
    res.status(500).send("une erreur c'est produite : " + err);
  }
};
// controller permettant d'afficher la liste de tout les etudiants
const getUser = async (req, res) => {
  try {
    const id_user = req.params.id;
    const q = "SELECT * FROM `etudiant` WHERE id_utilisateur=?  ORDER BY `nom` ASC";
    db.query(q,[id_user] ,(err, results) => {
      if (err)
        res
          .status(500)
          .send(
            "une erreur c'est produite lors de l'execution de la requete "
          );
      res.status(200).send(JSON.stringify(results));
    });
  }
  catch (err) 
  {
    res.status(500).send("une erreur c'est produite : " + err);
  }
};
const getProfilInfos= (req,res)=>{
  try {
    // recuperer l'id de l'etudiant
    const id_user = req.params.id_user;
    const q = "SELECT * FROM `profil_etudiant` WHERE  id_etudiant=?  ORDER BY `id_etudiant` ASC";
    db.query(q,[id_user] ,(err, results) => {
      if (err)
        res
          .status(500)
          .send(
            "une erreur c'est produite lors de l'execution de la requete "
          );
      res.status(200).send(JSON.stringify(results));
    });
  }
  catch (err) 
  {
    res.status(500).send("une erreur c'est produite : " + err);
  }
}
const getIncriptionInfos= (req,res)=>{
  try {
    // recuperer l'id de l'etudiant
    const id_user = req.params.id_user;
    const q = "SELECT  `matricule`, `id_classe`, `bac`, `annee_obtension_bac`, `diplome_entrer`, `annee_obtension_diplome`, `id_etudiant` FROM `inscription` WHERE   id_etudiant=?  ORDER BY `id_etudiant` ASC";
    db.query(q,[id_user] ,(err, results) => {
      if (err)
        res
          .status(500)
          .send(
            "une erreur c'est produite lors de l'execution de la requete "
          );
      res.status(200).send(JSON.stringify(results));
    });
  }
  catch (err) 
  {
    res.status(500).send("une erreur c'est produite : " + err);
  }
}
const authcontroller={
  ConnectUser,
  AddUser,
  AllUser,
  Deleteusers,
  DeconnectUser,
  UpdateUserInfo,
  Welcome,
  getUser,
  getProfilInfos,
  getIncriptionInfos
};
export default authcontroller;  
