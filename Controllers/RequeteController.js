import  db from "./../connection.js";
import fonction from "./function.js";
//controller permettant d'enregistrer un nouvelle utilisateur
const Addrequete= async (req, res) => {
  try {
    Insertrequete(req, res);
  } catch (err) {
    res.send("une erreur c'est produite : " + err);
  }
};
// fonction permettant d'enregistrer un etudiant
const Insertrequete= async (req, res) => {
  console.log("insertion requete en cours");
  const objet = req.body.objet;
  const description = req.body.description;
  const id_categorie = req.body.id_categorie;
  const id_etudiant= req.body.id_etudiant;
  // const nomFichier = req.file.filename;
  // const fileRequete=req.file;
  // const reqestFileName=fileRequete.filname;
  const reqestFileName=req.file ? req.file.filename : "";

  const annee_scolaire=fonction.obtenirAnneeScolaire();
  console.log(annee_scolaire);
  let q =
    "INSERT INTO `requete`(`objet`, `description`, `piece_jointe`, `id_categorie`, `annee_scolaire`,`id_etudiant`) VALUES (?,?,?,?,?,?)";
  db.query(
    q,
    [objet,description, reqestFileName,id_categorie,annee_scolaire,id_etudiant],
    (err) => {
      if (err)
        {
          res.send("Une erreur est survenue.");
          console.log("Une erreur est survenue.");
          throw err;
        } 
          
      res.status(200).send("Requete envoyer  avec success !");
    }
  );
};
const UpdateRequete= async (req, res) => {
  try {
    modifierRequete(req, res);
  } catch (err) {
    res.status(500).send("une erreur c'est produite : " + err);
  }
};
// methode permettant de modifier les infos d'un utilisateur
const modifierRequete = async (req, res) => {
  const id_requete = req.params.id_requete;
  let q =
    "UPDATE `requete` SET `objet`=?,`description`=?,`piece_jointe`=?,`id_categorie`=?,`date_modification`=? WHERE `id_requete`=?";
    // recuperer la date du jour
    let date_modification= new Date.now();
  db.query(
    q,
    [req.body.objet,req.body.description, req.body.piece_jointe, req.body.id_categorie, date_modification,id_requete],
    (err) => {
      if (err) throw err;
      console.log("mise a jour effectuer ave succes ! ");
      res.status(200).send("mise a jour effectuer avec success !");
    }
  );
};
// methode permettant de modifier le statut d'une requete
const SetRequeteStatut = async (req, res) => {
  try {
    const id_requete = req.params.id_requete;
    // recuperer la date et l'heure actuelle pour mettre a jour la date de modification automatiquement la base de donnee
    const new_date=new Date().toISOString()
    const date_modification=new_date.split('T')[0]+' '+new_date.split('T')[1].split('.')[0];
  let q =
    "UPDATE `requete` SET `statut`=?,`date_modification`=? WHERE `id_requete`=?";

  db.query(
    q,
    [req.body.statut,date_modification,id_requete],
    (err) => {
      if (err) throw err;
      res.status(200).send("mise a jour du statut effectuer avec success !");
    }
  );
  } catch (error) {
    res.status(200).send("Erreur lors de la mise a jour !"+error);
  }
  
};

// methode permettant de supprimer un etudiant
const DeleteRequete = async (req, res) => {
  try {
    const id_requete = req.params.id_requete;
    const q = "DELETE FROM `requete` WHERE id_requete=? ";
    db.query(q, [id_requete], (err) => {
      if (err)
        res
          .status(500)
          .send(
            "une erreur c'est produite lors de l'executtion de la requete : " +
              err
          );
      res.status(200).send("Requete suprimer avec success");
    });
  } catch (err) {
    res.status(500).send("une erreur c'est produite : " + err);
  }
};
// controller permettant d'afficher la liste de tout les etudiants
const AllRequete = async (req, res) => {
  try {
     let annee_scolaire=fonction.obtenirAnneeScolaire();
     let statut="en attente";
    const q = "SELECT `id_requete`, `objet`, `description`, `piece_jointe`, DATE(`date_envoi`) AS date_envoi,`statut`,CONCAT(etd.nom,' ',etd.prenom) as etudiant ,etd.id_utilisateur as id_etudiant , cr.libelle as type FROM `requete` r INNER JOIN etudiant etd ON etd.id_utilisateur=r.id_etudiant INNER JOIN categorie_requete cr ON cr.id_categorie=r.id_categorie WHERE `annee_scolaire`=?  ORDER BY date_envoi DESC";
    db.query(q,[annee_scolaire], (err, results) => {
      if (err)
        res
          .status(500)
          .send(
            "une erreur c'est produite lors de l'executtion de la requete "
          );
          // retourner le resultat au format json
      res.status(200).json(results);
    });
  } catch (err) {
    res.status(500).send("une erreur c'est produite : " + err);
  }
};
// controller permettant d'afficher la liste de tout les etudiants
const getRequeteDetail = async (req, res) => {
  try {
    const id_requete = req.params.id_requete;
    const q = "SELECT * FROM `requete` WHERE id_requete=?";
    db.query(q,[id_requete] ,(err, results) => {
      if (err)
        res
          .status(500)
          .send(
            "une erreur c'est produite lors de l'execution de la requete "
          );
          // retourner le resultat avec le status 200
      res.status(200).send(JSON.stringify(results));
    });
  } catch (err) {
    res.status(500).send("une erreur c'est produite : " + err);
  }
};
//*****************************Definir les controllers pour les notifications************************ */
//controller permettant d'enregistrer un nouvelle utilisateur
const AddNotification= async (req, res) => {
    try {
        InsertNotification(req, res);
    } catch (err) {
      res.status(500).send("une erreur c'est produite : " + err);
    }
  };
  // fonction permettant d'enregistrer un etudiant
  const InsertNotification= async (req, res) => {
    const annee_scolaire=fonction.obtenirAnneeScolaire();
    let q =
      "INSERT INTO `notifications`( `libelle`, `description`, `id_user`, `annee_scolaire`) VALUES (?,?,?,?)";
    db.query(
      q,
      [req.body.libelle,req.body.description, req.body.id_user,annee_scolaire],
      (err) => {
        if (err) throw err;
        res.status(200).send("Notification envoyer  avec success !");
      }
    );
  };
// controller permettant d'afficher la liste de tout les etudiants
const getNotification= async (req, res) => 
  {
    try {
      const id_etudiant = req.params.id_etudiant;
      const annee_scolaire=fonction.obtenirAnneeScolaire();
      const q = "SELECT `id_notification`, `libelle`, `description`,  DATE(`date_envoi`) AS date_envoi ,TIME(date_envoi) as heure_envoi,statut FROM `notifications` WHERE  `id_user`=? AND `annee_scolaire`=? ORDER BY date_envoi DESC";
      db.query(q,[id_etudiant,annee_scolaire] ,(err, results) => {
        if (err)
          res
            .status(500)
            .json({message: "une erreur c'est produite lors de l'execution de la requete " });
            // retourner le resultat avec le status 200
        res.status(200).json(results);
      });
    } 
    catch (err) {
      res.
       json({message:"une erreur c'est produite."});
    };
}
const requeteController={
    Addrequete,
    UpdateRequete,
    DeleteRequete,
    AllRequete,
    getRequeteDetail,
    AddNotification,
    getNotification,
    SetRequeteStatut
};
export default requeteController;
