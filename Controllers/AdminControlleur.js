import  db from "./../connection.js";
import fonction from "./function.js";
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
// controller permettant d'afficher la liste de tout les etudiants
const getStudentClasse = async (req, res) => {
  try {
    const id_etudiant= req.params.id;
    // obtenir l'annee scolaire en cours
    const annee_scolaire=fonction.obtenirAnneeScolaire();
    const q = "SELECT c.id_classe ,c.libelle as libelle_classe,p.annee_scolaire ,c.niveau as niveau , f.libelle as filiere FROM `promotion` p INNER JOIN classe c ON c.id_classe=p.id_classe  INNER JOIN filiere f ON f.id_filiere=c.id_filiere WHERE id_etudiant=? AND p.annee_scolaire=?";
    db.query(q,[id_etudiant,annee_scolaire] ,(err, results) => {
      if (err)
        res
          .status(500)
          .send(
            "une erreur c'est produite lors de l'execution de la requete "
          );
          // retourner le resultat avec le status 200
      res.status(200).json(results);
    });
  } catch (err) {
    res.status(500).send("une erreur c'est produite : " + err);
  }
};

//******************** Controller pour gerer fonctionnalites lier aux filieres ***************** */
//controller permettant d'enregistrer une nouvelle  filiere
const AddFiliere= async (req, res) => {
  try {
    InsertFiliere(req, res);
  } catch (err) {
    res.status(500).send("une erreur c'est produite : " + err);
  }
};
// fonction permettant d'enregistrer une filiere
const InsertFiliere = async (req, res) => {
  console.log("filiere !!!!!")
  console.log(req.body);
  console.log(req.body.libelle);
  let q =
    "INSERT INTO `filiere`( `libelle`) VALUES (?)";
  db.query(
    q,
    [req.body.libelle],
    (err) => {
      if (err) throw err;
      res.status(200).send("Filiere enregistrer  avec success !");
    }
  );
};
const UpdateFiliere = async (req, res) => {
  try {
    modifierFiliere(req, res);
  } catch (err) {
    res.status(500).send("une erreur c'est produite : " + err);
  }
};
// methode permettant de modifier les infos d'un utilisateur
const modifierFiliere = async (req, res) => {
  const id_filiere = req.params.id;
  let q =
    "UPDATE `filiere` SET `libelle`=? WHERE `id_filiere`=? ";
  db.query(
    q,
    [req.body.libelle, id_filiere],
    (err) => {
      if (err) throw err;
      console.log("mise a jour effectuer ave succes ! ");
      res.status(200).send("mise a jour effectuer avec success !");
    }
  );
};

// methode permettant de supprimer un etudiant
const DeleteFiliere = async (req, res) => {
  try {
    // recuperer l'id de la classe passer dans l'url
    const id_filiere = req.params.id;
    const q = "DELETE FROM `filiere` WHERE  `id_filiere`=? ";
    db.query(q, [id_filiere], (err) => {
      if (err)
        res
          .status(500)
          .send(
            "une erreur c'est produite lors de l'execution de la requete : " +
              err
          );
      res.status(200).send("Filiere suprimer avec success");
    });
  } catch (err) {
    res.status(500).send("une erreur c'est produite : " + err);
  }
};
// controller permettant d'afficher la liste de tout les etudiants
const AllFiliere = async (req, res) => {
  try {
    const q = "SELECT `id_filiere`, `libelle` FROM `filiere`  ORDER BY `id_filiere` DESC LIMIT 10";
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




const adminController={
    AddClasse,
    AllClasses,
    DeleteClasse,
    getclasse,
    UpdateClasse,
    getStudentClasse,
    AddFiliere,
    DeleteFiliere,
    AllFiliere,
    UpdateFiliere
};
export default adminController;  
