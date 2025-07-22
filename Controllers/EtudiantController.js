import  db from "../connection.js";
//middleware our le cryptage
import  bcrypt from "bcrypt";
import fonction from "./function.js";

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
  //definir les requetes pour verifier l'existance du mot de passe et de l'adresse email
  const emailExistQuery = "SELECT * FROM `etudiant` WHERE `email`=?";
  const phoneExistQuery = "SELECT * FROM `etudiant` WHERE `telephone`=?";
  db.query(emailExistQuery, [req.body.email], (err, emailResults) => {
    if (err) throw err;
    if (emailResults.length > 0) {
      return res.status(409).send("Adresse mail deja utiliser par un autre compte.");
    } else {
      db.query(phoneExistQuery, [req.body.telephone], (err, phoneResults) => {
        if (err) throw err;
        if (phoneResults.length > 0) {
          return res.status(409).send("Numero de telephone deja utiliser par un autre compte.");
        }
      });
    }
  });
  let q =
    "INSERT INTO `etudiant`( `nom`, `prenom`, `email`, `telephone`, `password`, `genre`) VALUES (?,?,?,?,?,?)";
  db.query(
    q,
    [req.body.nom,req.body.prenom, req.body.email,req.body.telephone, passwordhached, req.body.genre],
    (err) => {
      if (err) throw err;
      res.status(200).send("Création de compte effectuer avec success !");
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
const AllStudent = async (req, res) => {
  try {
      const q = `SELECT 
      DISTINCT(p.id_etudiant), 
      p.id_classe, 
      p.annee_scolaire,
      inc.matricule, 
      etd.nom, 
      etd.prenom, 
      etd.email, 
      etd.telephone,
      cl.libelle AS classe,
      GROUP_CONCAT(DISTINCT doc.nom_fichier ORDER BY doc.nom_fichier SEPARATOR ', ') AS documents
  FROM 
      promotion p
  JOIN 
      etudiant etd ON etd.id_utilisateur = p.id_etudiant
  JOIN 
      classe cl ON cl.id_classe = p.id_classe
  JOIN 
      inscription inc ON inc.id_etudiant = etd.id_utilisateur
  LEFT JOIN 
      documents doc ON doc.id_etudiant = etd.id_utilisateur

  GROUP BY 
      p.id_classe, 
      p.id_etudiant, 
      p.annee_scolaire,
      inc.matricule, 
      etd.nom, 
      etd.prenom, 
      etd.telephone, 
      cl.libelle;
  `;
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
// controller permettant d'afficher la liste de tout les etudiants d'une classe
const getStudentByClass = async (req, res) => {
  try {
    const id_classe = req.params.id_classe;
    const q = "SELECT  `nom`, `prenom`, `email`, `telephone`, `matricule`, `genre`, cl.libelle ,p.`id_classe`, p.`id_etudiant`, `annee_scolaire` FROM `promotion` p INNER JOIN etudiant etd ON etd.id_utilisateur=p.id_etudiant INNER JOIN classe cl ON cl.id_classe=p.id_classe    ORDER BY etd.`nom` ASC";
    db.query(q,[id_classe] ,(err, results) => {
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
/**** Gerer le profil des etudiants */
//controller permettant d'enregistrer un nouvelle utilisateur
const AddProfil = async (req, res) => {
  try {
    InsertProfil(req, res);
  } catch (err) {
    res.send("une erreur c'est produite : " + err);
  }
};
// fonction permettant d'enregistrer un etudiant
const InsertProfil = async (req, res) => {
  // appel de la fonction permettant d'obetenir l'annee scolaire en cour.
  const annee_scolaire= fonction.obtenirAnneeScolaire();
  // recuperer les donnnees soumis depuis le cote clients
  const civilite =req.body.civilité
  const nationalite =req.body.nationalite
  const date_naissance =req.body.date_naissance
  const lieuNaissance =req.body.lieu_naissance
  // const photo =req.body.photo
  const photo =req.file ? req.file.filename : "user.jpg";
  const dep_naisance =req.body.dep_naissance
  const region_naissance =req.body.region_naissance
  const id_etudiant =req.body.id_etudiant
  const nom_marital =req.body.nomMarital
  const quartier =req.body.quartier
  const nom_pere =req.body.nomPere
  const tel_pere =req.body.telPere
  const email_pere =req.body.emailPere
  const nom_mere =req.body.nomMere
  const tel_mere =req.body.telMere
  const email_mere =req.body.emailMere
  const profession_mere =req.body.professionMere
  const profession_pere =req.body.professionPere
  let q =
    "INSERT INTO `profil_etudiant`( `civilite`, `nationalite`, `date_naissance`, `lieuNaissance`, `photo`, `dep_naisance`, `region_naissance`, `id_etudiant`, `nom_marital`, `quartier`, `nom_pere`, `tel_pere`, `email_pere`, `nom_mere`, `tel_mere`, `email_mere`, `profession_mere`, `profession_pere`,`annee_scolaire`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
  db.query(
    q,
    [civilite,nationalite,date_naissance,lieuNaissance,photo,dep_naisance,region_naissance,id_etudiant,nom_marital,quartier,nom_pere,tel_pere,email_pere,nom_mere,tel_mere,email_mere,profession_mere,profession_pere,annee_scolaire],
    (err) => {
      if (err)  res.send("une erreur c'est produite : " + err);
      res.status(200).send("Profil Completer  avec success !");
    }
  );
};
const uploadProfilPhoto=(req,res)=>{
     const id_user = req.params.id;
     const fileImage="user.jpg";
  let q =
    "UPDATE `profil_etudiant` SET `id_profil`='[value-1]',`civilite`='[value-2]',`nationalite`='[value-3]',`date_naissance`='[value-4]',`lieuNaissance`='[value-5]',`photo`='[value-6]',`dep_naisance`='[value-7]',`region_naissance`='[value-8]',`id_etudiant`='[value-9]',`nom_marital`='[value-10]',`quartier`='[value-11]',`nom_pe WHERE 1 ";
  db.query(
    q,
    [fileImage, id_user],
    (err) => {
      if (err) throw err;
      console.log("mise a jour effectuer ave succes ! ");
      res.status(200).send("mise a jour effectuer avec success !");
    }
  ); 
}
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
/***** gerer les incriptions des etudiants */
//controller permettant d'enregistrer un nouvelle utilisateur
const AddIncription = async (req, res) => {
  try {
    InsertInscription(req, res);
  } catch (err) {
    res.send("une erreur c'est produite : " + err);
  }
};
// fonction permettant d'enregistrer un etudiant
const InsertInscription = async (req, res) => {
  console.log("controler solliciter ...")
  // appel de la fonction permettant d'obetenir l'annee scolaire en cour.
  const annee_scolaire= fonction.obtenirAnneeScolaire();
  let q =
    "INSERT INTO `inscription`( `matricule`, `id_classe`, `bac`, `annee_obtension_bac`, `diplome_entrer`, `annee_obtension_diplome`, `id_etudiant`, `serie_bac`,`annee_scolaire`,`etablissement_bac`) VALUES (?,?,?,?,?,?,?,?,?,?)";
  db.query(
    q,
    [req.body.matricule,req.body.id_classe, req.body.bac,req.body.annee_obtension_bac, req.body.diplome_entrer, req.body.annee_obtension_diplome,req.body.id_etudiant,req.body.serie_bac,annee_scolaire,req.body.etablissement_bac],
    (err) => {
      if (err)  res.send("une erreur c'est produite : " + err);
      res.status(200).send("Inscription effectuer avec success !");
    }
  );
};
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
const getStudentCompleteInfo = async (req, res) => {
  try {
    const id_etudiant = req.params.id;
    const q = `
      SELECT DISTINCT
        e.nom,
        e.prenom,
        e.email,
        e.telephone,
        e.matricule,
        e.genre as civilite,
        p.nom_marital,
        p.nationalite,
        p.date_naissance,
        p.region_naissance,
        p.lieuNaissance,
        p.dep_naisance as departementNaissance,
        p.quartier,
        p.nom_pere,
        p.tel_pere,
        p.email_pere,
        p.profession_pere,
        p.nom_mere,
        p.tel_mere,
        p.email_mere,
        p.profession_mere,
        i.annee_scolaire as anneeAcademique,
        c.libelle as classe,
        i.bac,
        i.annee_obtension_bac as anneeObtentionBac,
        i.diplome_entrer as diplomeEntree,
        i.annee_obtension_diplome as anneeObtentionDiplome
      FROM etudiant e
      LEFT JOIN (
        SELECT * FROM profil_etudiant 
        WHERE id_etudiant = ? 
        ORDER BY id_profil DESC 
        LIMIT 1
      ) p ON e.id_utilisateur = p.id_etudiant
      LEFT JOIN (
        SELECT * FROM inscription 
        WHERE id_etudiant = ? 
        ORDER BY annee_scolaire DESC 
        LIMIT 1
      ) i ON e.id_utilisateur = i.id_etudiant
      LEFT JOIN classe c ON i.id_classe = c.id_classe
      WHERE e.id_utilisateur = ?
    `;

    db.query(q, [id_etudiant, id_etudiant, id_etudiant], (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Erreur lors de la récupération des informations",
          error: err.message
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Étudiant non trouvé"
        });
      }

      const studentInfo = {
        civilite: results[0].civilite || "",
        nom: results[0].nom || "",
        nomMarital: results[0].nom_marital || "",
        prenom: results[0].prenom || "",
        email: results[0].email || "",
        telephone: results[0].telephone || "",
        nationalite: results[0].nationalite || "",
        dateNaissance: results[0].date_naissance || "",
        regionNaissance: results[0].region_naissance || "",
        lieuNaissance: results[0].lieuNaissance || "",
        departementNaissance: results[0].departementNaissance || "",
        quartier: results[0].quartier || "",
        anneeAcademique: results[0].anneeAcademique || "",
        matricule: results[0].matricule || "",
        classe: results[0].classe || "",
        bac: results[0].bac || "",
        anneeObtentionBac: results[0].anneeObtentionBac || "",
        diplomeEntree: results[0].diplomeEntree || "",
        anneeObtentionDiplome: results[0].anneeObtentionDiplome || "",
        nomPere: results[0].nom_pere || "",
        telPere: results[0].tel_pere || "",
        emailPere: results[0].email_pere || "",
        professionPere: results[0].profession_pere || "",
        nomMere: results[0].nom_mere || "",
        telMere: results[0].tel_mere || "",
        emailMere: results[0].email_mere || "",
        professionMere: results[0].profession_mere || ""
      };

      res.status(200).json({
        success: true,
        data: studentInfo
      });
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Une erreur s'est produite",
      error: err.message
    });
  }
};
//fonction qui retourne le niveau de progression
const getProfileCompletionRate = async (req, res) => {
  try {
    const id_etudiant = req.params.id;
    
    // Requête pour vérifier l'inscription
    const inscriptionQuery = `
      SELECT COUNT(*) as hasInscription 
      FROM inscription 
      WHERE id_etudiant = ?
    `;

    // Requête pour vérifier le profil
    const profilQuery = `
      SELECT COUNT(*) as hasProfil 
      FROM profil_etudiant 
      WHERE id_etudiant = ?
    `;

    // Requête pour vérifier les documents
    const documentsQuery = `
      SELECT COUNT(*) as hasDocuments 
      FROM documents 
      WHERE id_etudiant = ?
    `;

    // Exécuter les requêtes en parallèle
    db.query(inscriptionQuery, [id_etudiant], (err, inscriptionResult) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Erreur lors de la vérification de l'inscription",
          error: err.message
        });
      }

      db.query(profilQuery, [id_etudiant], (err, profilResult) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Erreur lors de la vérification du profil",
            error: err.message
          });
        }

        db.query(documentsQuery, [id_etudiant], (err, documentsResult) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: "Erreur lors de la vérification des documents",
              error: err.message
            });
          }

          // Calculer le taux de complétion
          let completionRate = 20; // Taux par défaut après connexion

          // Ajouter 20% si l'inscription est complétée
          if (inscriptionResult[0].hasInscription > 0) {
            completionRate += 20;
          }

          // Ajouter 40% si le profil est complété
          if (profilResult[0].hasProfil > 0) {
            completionRate += 40;
          }

          // Ajouter 20% si des documents sont soumis
          if (documentsResult[0].hasDocuments > 0) {
            completionRate += 20;
          }

          // Préparer la réponse avec les détails
          const response = {
            success: true,
            data: {
              completionRate: completionRate,
              details: {
                hasInscription: inscriptionResult[0].hasInscription > 0,
                hasProfil: profilResult[0].hasProfil > 0,
                hasDocuments: documentsResult[0].hasDocuments > 0,
                breakdown: {
                  baseRate: 20,
                  inscriptionRate: inscriptionResult[0].hasInscription > 0 ? 20 : 0,
                  profilRate: profilResult[0].hasProfil > 0 ? 40 : 0,
                  documentsRate: documentsResult[0].hasDocuments > 0 ? 20 : 0
                }
              }
            }
          };

          res.status(200).json(response);
        });
      });
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Une erreur s'est produite",
      error: err.message
    });
  }
};


const authcontroller={
  ConnectUser,
  AddUser,
  AllStudent,
  Deleteusers,
  DeconnectUser,
  UpdateUserInfo,
  Welcome,
  getUser,
  getProfilInfos,
  getIncriptionInfos,
  AddIncription,
  AddProfil,
  getStudentByClass,
  getStudentCompleteInfo,
  getProfileCompletionRate
};
export default authcontroller;  
