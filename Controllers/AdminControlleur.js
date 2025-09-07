import  db from "../config/connection.js";
import fonction from "./function.js";
//middleware our le cryptage
import  bcrypt from "bcrypt";
// fonction de hachage de mot de passe
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}
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
  console.log(req.body)
  let q =
    "INSERT INTO `classe`(`libelle`, `numero_salle`, `classe_sup`, `niveau`) VALUES (?,?,?,?)";
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
    const q = "SELECT * FROM `classe` ORDER BY `id_classe` DESC";
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
    console.log(annee_scolaire);
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
// controller permettant d'afficher la liste de tout les etudiants
const AllPromotion = async (req, res) => {
  try {
    const q = " SELECT DISTINCT (`annee_scolaire`) FROM `promotion`  ORDER BY `annee_scolaire` DESC LIMIT 10";
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

const StatistiqueResult = async (req, res) => {
    try {
        // Utiliser des promesses pour gérer les requêtes
        const getInscriptions = () => {
            return new Promise((resolve, reject) => {
                db.query('SELECT COUNT(*) as total_inscriptions FROM inscription', (err, results) => {
                    if (err) reject(err);
                    resolve(results[0].total_inscriptions);
                });
            });
        };

        const getAnnonces = () => {
            return new Promise((resolve, reject) => {
                db.query('SELECT COUNT(*) as total_annonces FROM publications', (err, results) => {
                    if (err) reject(err);
                    resolve(results[0].total_annonces);
                });
            });
        };

        const getRequetes = () => {
            return new Promise((resolve, reject) => {
                db.query('SELECT COUNT(*) as requetes_en_attente FROM requete WHERE statut=?',[true], (err, results) => {
                    if (err) reject(err);
                    resolve(results[0].requetes_en_attente);
                });
            });
        };

        // Exécuter toutes les requêtes en parallèle
        const [total_inscriptions, total_annonces, requetes_en_attente] = await Promise.all([
            getInscriptions(),
            getAnnonces(),
            getRequetes()
        ]);

        // Retourner les statistiques
        res.status(200).json({
            success: true,
            data: {
                total_inscriptions,
                total_annonces,
                requetes_en_attente
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques',
            error: error.message
        });
    }
};
const  StatChartJs= async (req,res)=>{
   try {
          // Utiliser des promesses pour gérer les requêtes
          const getInscriptionsByMonth = () => {
            return new Promise((resolve, reject) => {
                db.query(`SELECT cr.libelle AS categorie, COUNT(r.id_requete) AS total
                    FROM requete r
                    JOIN categorie_requete cr ON r.id_categorie = cr.id_categorie
                    GROUP BY cr.libelle
                    ORDER BY total DESC`, (err, results) => {
                    if (err) reject(err);
                    // Séparer les catégories et les valeurs
                    const categories = results.map(item => item.categorie);
                    const valeurs = results.map(item => item.total);
                    resolve({ categories, valeurs });
                });
            });
        };

        const getRequestByCategirie = () => {
            return new Promise((resolve, reject) => {
                db.query(`SELECT MONTH(created_at) AS mois_num, COUNT(*) AS total
                          FROM inscription
                          GROUP BY mois_num
                          ORDER BY mois_num`, (err, results) => {
                    if (err) reject(err);
                    // Séparer les mois et les inscriptions
                    const mois = results.map(item => {
                        const moisNoms = [
                            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
                        ];
                        return moisNoms[item.mois_num - 1];
                    });
                    const inscriptions = results.map(item => item.total);
                    resolve({ mois, inscriptions });
                });
            });
        };

          // Exécuter toutes les requêtes en parallèle
          const [dataRequetes, dataInscriptions] = await Promise.all([
            getInscriptionsByMonth(),
            getRequestByCategirie()
        ]);

        // Retourner les statistiques
        res.status(200).json({
            success: true,
            data: {
                categories: dataRequetes.categories,
                valeurs: dataRequetes.valeurs,
                mois: dataInscriptions.mois,
                inscriptions: dataInscriptions.inscriptions
            }
        });
   } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques',
        error: error.message
    });
   }
}
/**  controller pour gerer les administrateurs */
//controller permettant d'enregistrer un nouvelle  classe
const NewAdmin= async (req, res) => {
  try {
    InsertAdmin(req, res);
  } catch (err) {
    res.status(500).send("une erreur c'est produite : " + err);
  }
};
// fonction permettant d'enregistrer un etudiant
const InsertAdmin = async (req, res) => {
  console.log(req.body)
  const password = req.body.password;
  // console.log(password);
  const passwordhached = await hashPassword(password);
  let q =
    "INSERT INTO `admin`(`nom`, `prenom`, `email`, `telephone`, `password`, `code_access`, `genre`) VALUES (?,?,?,?,?,?,?)";
  db.query(
    q,
    [req.body.nom,req.body.prenom, req.body.email,req.body.telephone,passwordhached,req.body.code_access,req.body.genre],
    (err) => {
      if (err) throw err;
      res.status(200).send("Admin enregistrer  avec success !");
    }
  );
};
// methode permettant de supprimer un administrateur
const DeleteAdmin = async (req, res) => {
  try {
    // recuperer l'id de la classe passer dans l'url
    const id_admin = req.params.id;
    const q = "DELETE FROM `admin` WHERE   `id_utilisateur`=? ";
    db.query(q, [id_admin], (err) => {
      if (err)
        res
          .status(500)
          .send(
            "une erreur c'est produite lors de l'execution de la requete : " +
              err
          );
      res.status(200).send("Administrateur suprimer avec success");
    });
  } catch (err) {
    res.status(500).send("une erreur c'est produite : " + err);
  }
};
// controller permettant d'afficher la liste de tout les Admins
const AllAdmin = async (req, res) => {
  try {
    const q = "SELECT `id_utilisateur`, `nom`, `prenom`, `email`, `telephone`, `password`, `statut_compte`, `code_access`, `genre` FROM `admin` ORDER BY `id_utilisateur` DESC";
    db.query(q, (err, results) => {
      if (err)
        res
          .status(500)
          .send(
            "une erreur c'est produite lors de l'executtion de la requete "+err
          );
      res.status(200).send(JSON.stringify(results));
    });
  } catch (err) {
    res.status(500).send("une erreur c'est produite : " + err);
  }
};
// envoyer automatiquement les notifications aux etudiants
const getnotification= async (req,res)=>{
  try {
       const annee_scolaire=fonction.obtenirAnneeScolaire();
      let q =
      "INSERT INTO `notifications`( `libelle`, `description`,  `id_user`, `annee_scolaire`, `statut`) VALUES (?,?,?,?,?)";
    db.query(
      q,
      [req.body.libelle,req.body.description, req.body.id_user,annee_scolaire,req.body.statut],
      (err) => {
        if (err) throw err;
        res.status(200).send("Notifications enregistrer  avec success !");
      }
    );       
  } catch (error) {
     res.status(500).send("Erreur lors de l'Ajout de la notification")
  }
}
// fonction permettant de marquer un etudiant comme Admin ou Echouer
const setStatutEtudiant=(req,res)=>{
  try {
      const statut=req.body.statut
      // recuperer de l'etudiant passer en parametre
      const id_etudiant=req.params.id_etudiant
       // redaction de la requete de mise a  jour
       const query="UPDATE `inscription` SET `statut`=? WHERE `id_etudiant`=?"
       // execution de la requete dans la base de donnee
       db.query(query,[statut,id_etudiant],(err)=>{
         if(err) throw new err;
       })
       res.status(200).send("Statut de l'etudiant mis a jour avec success");
  } catch (error) {
    res.status(500).send("Erreur lors de la mise a jour du statut");
  }
}
const setClasseEtudiant=(req,res)=>{
  try {
     let classe_superieur=0;
     // ### premiere etape recuperer l'id de la classe superieur
    const id_classe=req.body.id_classe
       const query1="SELECT  `classe_sup` FROM `classe` WHERE id_classe=?"
       db.query(query1,[id_classe],(err,result)=>{
         if(err) throw new err;
         // stocker l'id de la classe superieur dans une variable global
         classe_superieur=result[0].classe_sup;
         console.log(classe_superieur);
         console.log(result);
       })
       //### deuxieme etape mettre a jour la classe de l'etudiant dans la base de donnee.
      // recuperer de l'etudiant passer en parametre
      const id_etudiant=req.params.id_etudiant
    
       // redaction de la requete de mise a  jour
       const query="UPDATE `inscription` SET `id_classe`=? WHERE `id_etudiant`=?"
       // execution de la requete dans la base de donnee
       db.query(query,[classe_superieur,id_etudiant],(err)=>{
         if(err) throw new err;
         console.log(classe_superieur)
         res.status(200).send("Classe de l'etudiant mis a jour avec success");
       })
  } catch (error) {
    res.status(500).send("Erreur lors de la mise a jour de la classe"+error);
  }
}
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
    UpdateFiliere,
    StatistiqueResult,
    StatChartJs,
    NewAdmin,
    DeleteAdmin,
    AllAdmin,
    getnotification,
    AllPromotion,
    setStatutEtudiant,
    setClasseEtudiant
};
export default adminController;  
