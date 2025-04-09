import  db from "./../connection.js";
//******************** Controller pour gerer fonctionnalites lier aux classes les classes ***************** */
//controller permettant d'enregistrer un nouvelle  classe
const AddClasse= async (req, res) => {
  try {
    InsertClasse(req, res);
  } catch (err) {
    res.status(500).send("une erreur c'est produite : " + err);
  }
};
// fonction permettant d'enregistrer un etudiant
const InsertClasse = async (req, res) => {
  let q =
    "INSERT INTO `classe`(`libelle`, `numero_salle`, `salle_sup`, `id_niveau`) VALUES (?,?,?,?)";
  db.query(
    q,
    [req.body.libelle,req.body.numero_salle, req.body.salle_sup,req.body.id_niveau],
    (err) => {
      if (err) throw err;
      res.status(200).send("Classe enregistrer  avec success !");
    }
  );
};
const UpdateClasse = async (req, res) => {
  try {
    modifierClasse(req, res);
  } catch (err) {
    res.status(500).send("une erreur c'est produite : " + err);
  }
};
// methode permettant de modifier les infos d'un utilisateur
const modifierClasse = async (req, res) => {
  const id_classe = req.params.id;
  let q =
    "UPDATE `classe` SET `libelle`=?,`numero_salle`=?,`classe_sup`=?,`id_niveau`=? WHERE `id_classe`=? ";
  db.query(
    q,
    [req.body.libelle,req.body.numero_salle, req.body.classe_sup, req.body.id_niveau, id_classe],
    (err) => {
      if (err) throw err;
      console.log("mise a jour effectuer ave succes ! ");
      res.status(200).send("mise a jour effectuer avec success !");
    }
  );
};

// methode permettant de supprimer un etudiant
const DeleteClasse = async (req, res) => {
  try {
    // recuperer l'id de la classe passer dans l'url
    const id_classe = req.params.id;
    const q = "DELETE FROM `classe` WHERE `id_classe`=? ";
    db.query(q, [id_classe], (err) => {
      if (err)
        res
          .status(500)
          .send(
            "une erreur c'est produite lors de l'execution de la requete : " +
              err
          );
      res.status(200).send("classe suprimer avec success");
    });
  } catch (err) {
    res.status(500).send("une erreur c'est produite : " + err);
  }
};
// controller permettant d'afficher la liste de tout les etudiants
const AllClasses = async (req, res) => {
  try {
    const q = "SELECT * FROM `classe` ORDER BY `libelle` ASC";
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
const getclasse = async (req, res) => {
  try {
    const id_classe= req.params.id;
    const q = "SELECT * FROM `classe` WHERE id_classe=?";
    db.query(q,[id_classe] ,(err, results) => {
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

//******************** Controller pour gerer fonctionnalites lier aux classes les classes ***************** */





const adminController={
    AddClasse,
    AllClasses,
    DeleteClasse,
    getclasse,
    UpdateClasse
};
export default adminController;  
