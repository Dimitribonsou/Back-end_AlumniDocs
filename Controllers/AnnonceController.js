import  db from "./../connection.js";
//controller permettant d'enregistrer un nouvelle utilisateur
const AddAnnonce= async (req, res) => {
  try {
    InsertAnnonce(req, res);
  } catch (err) {
    res.status(500).send("une erreur c'est produite : " + err);
  }
};
// fonction permettant d'enregistrer un etudiant
const InsertAnnonce = async (req, res) => {
  let q =
    "INSERT INTO `annonces`( `libelle`, `description`, `image`,`id_admin`) VALUES (?,?,?,?)";
  db.query(
    q,
    [req.body.libelle,req.body.description, req.body.image,req.body.id_admin],
    (err) => {
      if (err) throw err;
      res.status(200).send("Annonce publier  avec success !");
    }
  );
};
const UpdateAnnonce = async (req, res) => {
  try {
    modifierAnnonce(req, res);
  } catch (err) {
    res.status(500).send("une erreur c'est produite : " + err);
  }
};
// methode permettant de modifier les infos d'un utilisateur
const modifierAnnonce = async (req, res) => {
  const id_user = req.params.id;
  let q =
    "UPDATE `annonces` SET `libelle`=?,`description`=?',`image`=?,`statut`=?  WHERE id_annonce=? ";

  db.query(
    q,
    [req.body.libelle,req.body.description, req.body.image, req.body.statut, id_user],
    (err) => {
      if (err) throw err;
      console.log("mise a jour effectuer ave succes ! ");
      res.status(200).send("mise a jour effectuer avec success !");
    }
  );
};

// methode permettant de supprimer un etudiant
const DeleteAnnonces = async (req, res) => {
  try {
    const id_annonce = req.params.id;
    const q = "DELETE FROM `annonces` WHERE `id_annonce`=? ";
    db.query(q, [id_annonce], (err) => {
      if (err)
        res
          .status(500)
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
const AllAnnonces = async (req, res) => {
  try {
    const q = "SELECT * FROM `annonces` ORDER BY `date_publication` DESC";
    db.query(q, (err, results) => {
      if (err)
        res
          .status(500)
          .send(
            "une erreur c'est produite lors de l'executtion de la requete "
          );
          // retourner le resultat au format json
      res.status(200).send(JSON.stringify(results));
    });
  } catch (err) {
    res.status(500).send("une erreur c'est produite : " + err);
  }
};
// controller permettant d'afficher la liste de tout les etudiants
const getAnnonce = async (req, res) => {
  try {
    const id_annonce = req.params.id;
    const q = "SELECT * FROM `annonces` WHERE id_annonce=?";
    db.query(q,[id_annonce] ,(err, results) => {
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
const annonceController={
    AddAnnonce,
    UpdateAnnonce,
    DeleteAnnonces,
    AllAnnonces,
    getAnnonce
};
export default annonceController;  
