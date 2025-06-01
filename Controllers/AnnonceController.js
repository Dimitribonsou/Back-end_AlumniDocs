import  db from "./../connection.js";
import fonction from "./function.js";
//controller permettant d'enregistrer un nouvelle utilisateur
const AddAnnonce= async (req, res) => {
  try {
    InsertAnnonce(req, res);
  } catch (err) {
    res.status(500).send("une erreur c'est produite : " + err);
  }
};
// fonction permettant d'enregistrer une nouvelle annonce
const InsertAnnonce = async (req, res) => {
  const annee_scolaire=fonction.obtenirAnneeScolaire();
  const reqestFileName=req.file ? req.file.filename : "";
  let q =
    "INSERT INTO `annonces`( `libelle`, `description`, `image`,`id_admin`,`annee_scolaire`) VALUES (?,?,?,?,?)";
  db.query(
    q,
    [req.body.libelle,req.body.description, reqestFileName,req.body.id_admin,annee_scolaire],
    (err) => {
      if (err) throw err;
      res.status(200).send("Annonce enregistrer  avec success !");
    }
  );
};
//controller permettant d'enregistrer un nouvelle utilisateur
const AddPublication= async (req, res) => {
  try {
    InsertPublication(req, res);
  } catch (err) {
    res.status(500).send("une erreur c'est produite : " + err);
  }
};
// fonction permettant d'enregistrer un etudiant
const InsertPublication = async (req, res) => {
  const id_annonce = Number(req.body.id_annonce);
  const id_classe = Number(req.body.id_classe);

  // Vérifier si la publication existe déjà
  const checkQuery = "SELECT * FROM `publications` WHERE `id_annonce` = ? AND `id_classe` = ?";
  
  db.query(checkQuery, [id_annonce, id_classe], (err, results) => {
    if (err) {
      res.status(500).send("Erreur lors de la vérification de la publication : " + err);
      return;
    }

    // Si la publication existe déjà
    if (results.length > 0) {
      res.status(400).send("Cette publication existe déjà pour cette classe");
      return;
    }

    // Si la publication n'existe pas, on l'insère
    const insertQuery = "INSERT INTO `publications`(`id_annonce`, `id_classe`) VALUES (?,?)";
    db.query(insertQuery, [id_annonce, id_classe], (err) => {
      if (err) {
        res.status(500).send("Erreur lors de l'insertion de la publication : " + err);
        return;
      }
      res.status(200).send("Publication enregistrée avec succès !");
    });
  });
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
    const id_annonce = req.params.id_anonce;
    console.log(id_annonce)
    const q = "DELETE FROM `annonces` WHERE `id_annonce`=? ";
    db.query(q, [id_annonce], (err) => {
      if (err)
        res
          .status(500)
          .send(
            "une erreur c'est produite lors de l'executtion de la requete : " +
              err
          );
      res.status(200).send("Annonces suprimer avec success");
    });
  } catch (err) {
    res.status(500).send("une erreur c'est produite : " + err);
  }
};
// controller permettant d'afficher la liste de tout les etudiants
const AllAnnonces = async (req, res) => {
  try {
    const q = `SELECT 
      annonces.id_annonce,
      annonces.libelle,
      annonces.statut,
      DATE(annonces.date_publication) AS date_publication,
      TIME(annonces.date_publication) AS heure_publication,
      a.nom AS nom_admin,
      annonces.annee_scolaire
    FROM annonces 
    INNER JOIN admin a ON a.id_utilisateur = annonces.id_admin 
    INNER JOIN publications pb ON pb.id_annonce = annonces.id_annonce 
    WHERE annonces.annee_scolaire = ? 
    GROUP BY annonces.id_annonce
    ORDER BY annonces.date_publication DESC LIMIT 10`;

    db.query(q, [fonction.obtenirAnneeScolaire()], (err, results) => {
      if (err) {
        res.status(500).send("une erreur c'est produite lors de l'execution de la requete");
        return;
      }
      // Convertir la chaîne de classes en tableau
      const formattedResults = results.map(result => ({
        ...result
      }));
      res.status(200).send(JSON.stringify(formattedResults));
    });
  } catch (err) {
    res.status(500).send("une erreur c'est produite : " + err);
  }
};
// controller permettant d'afficher la liste de tout les etudiants
const getAnnonce = async (req, res) => {
  try {
    const id_annonce = req.params.id;
    const q = "SELECT a.`id_annonce`, a.`libelle`, `description`, `image`, DATE(pb.`date_publication`) as date_publication,TIME(pb.`date_publication`) as heure_publication, `id_admin`, `annee_scolaire`  FROM `annonces` a INNER JOIN publications pb on pb.id_annonce=a.id_annonce  WHERE  pb.id_annonce=?";
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
// controller permettant d'afficher  les annonces par classes
const getAnnonceByClasse = async (req, res) => {
  try {
    const id_classe = req.params.id_classe;
    const annee_scolaire =fonction.obtenirAnneeScolaire();
    const q = "SELECT a.`id_annonce`, a.`libelle`, `description`, `image`, DATE(pb.`date_publication`) as date_publication,TIME(pb.`date_publication`) as heure_publication, `id_admin`, `annee_scolaire`  FROM `annonces` a INNER JOIN publications pb on pb.id_annonce=a.id_annonce INNER JOIN classe on classe.id_classe=pb.id_classe WHERE classe.id_classe=? AND `annee_scolaire`=? ORDER BY pb.`date_publication` DESC  LIMIT 10";
    db.query(q,[id_classe,annee_scolaire] ,(err, results) => {
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
// controller permettant d'afficher  les annonces par classes
const getLastAnnonceByClasse = async (req, res) => {
  try {
    const id_classe = req.params.id_classe;
    const annee_scolaire =fonction.obtenirAnneeScolaire();
    const q = "SELECT a.`id_annonce`, a.`libelle`, `description`, `image`, DATE(pb.`date_publication`) as date_publication,TIME(pb.`date_publication`) as heure_publication, `id_admin`, `annee_scolaire`  FROM `annonces` a INNER JOIN publications pb on pb.id_annonce=a.id_annonce INNER JOIN classe on classe.id_classe=pb.id_classe WHERE classe.id_classe=? AND `annee_scolaire`=? ORDER BY pb.`date_publication` DESC  LIMIT 3";
    db.query(q,[id_classe,annee_scolaire] ,(err, results) => {
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
    getAnnonce,
    getAnnonceByClasse,
    getLastAnnonceByClasse,
    AddPublication
};
export default annonceController;  
