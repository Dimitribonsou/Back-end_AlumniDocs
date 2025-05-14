import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "./../connection.js";
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Configurer l'acces aux variables d'environnement
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Fonction pour générer un OTP sécurisé à 6 chiffres
const generateOTP = () => {
  // Utiliser crypto pour une meilleure sécurité
  const buffer = crypto.randomBytes(3); // 3 bytes = 24 bits
  const number = buffer.readUIntBE(0, 3); // Lire 3 bytes comme un nombre
  const otp = (number % 1000000).toString().padStart(6, '0'); // Assurer 6 chiffres
  return otp;
}

// Fonction pour envoyer l'email avec le code OTP
const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Code de vérification AlumniDocs',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Code de vérification AlumniDocs</h2>
        <p>Votre code de vérification est :</p>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
          <strong>${otp}</strong>
        </div>
        <p>Ce code expirera dans 10 minutes.</p>
        <p style="color: #666; font-size: 12px;">Si vous n'avez pas demandé ce code, veuillez ignorer cet email.</p>
      </div>
    `
  };

  try {
    // envoie du code OTP
    await transporter.sendMail(mailOptions);
    console.log("mail envoyer !")
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return false;
  }
};

// Fonction pour générer un jeton JWT
function generateToken(userId, username, role) {
  const token = jwt.sign({ userId, username, role }, JWT_SECRET, {
    expiresIn: "1h",
  });
  return token;
}

// Middleware de vérification du jeton JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Jeton d'authentification manquant" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.username = decoded.username;
    req.role = decoded.role;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Jeton d'authentification invalide" });
  }
};

// Middleware pour vérifier le rôle
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.role)) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }
    next();
  };
};

// Première étape de connexion
const initiateLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = null;
    let userRole = null;

    // Vérifier dans la table etudiant
    const queryEtudiant = "SELECT `id_utilisateur`, `nom`, `prenom`, `email`, `password` FROM `etudiant` WHERE `email`=?";
    const queryAdmin = "SELECT `id_utilisateur`, `nom`, `prenom`, `email`, `password` FROM `admin` WHERE `email`=?";
    const querySuperAdmin = "SELECT `id_utilisateur`, `nom`, `prenom`, `email`, `password` FROM `super_admin` WHERE `email`=?";

    // Fonction pour vérifier le mot de passe
    const checkPassword = async (hashedPassword) => {
      return await bcrypt.compare(password, hashedPassword);
    };

    // Vérifier dans chaque table
    const checkTable = async (query, role) => {
      return new Promise((resolve, reject) => {
        db.query(query, [email], async (err, results) => {
          if (err) {
            reject(err);
            return;
          }
          if (results.length > 0) {
            const passwordMatch = await checkPassword(results[0].password);
            if (passwordMatch) {
              resolve({ user: results[0], role });
            }
          }
          resolve(null);
        });
      });
    };

    // Vérifier dans toutes les tables
    const etudiantResult = await checkTable(queryEtudiant, 'etudiant');
    const adminResult = await checkTable(queryAdmin, 'admin');
    const superAdminResult = await checkTable(querySuperAdmin, 'super-admin');

    // Déterminer l'utilisateur et son rôle
    if (etudiantResult) {
      user = etudiantResult.user;
      userRole = etudiantResult.role;
    } else if (adminResult) {
      user = adminResult.user;
      userRole = adminResult.role;
    } else if (superAdminResult) {
      user = superAdminResult.user;
      userRole = superAdminResult.role;
    }

    if (!user) {
      return res.json({
        islogin: false,
        message: "Email ou mot de passe incorrect"
      });
    }

    // Générer et stocker le code OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  console.log(otp)
    // Vérifier si l'utilisateur existe déjà dans la table session_utilisateur
    const checkSessionQuery = "SELECT * FROM `session_utilisateur` WHERE `id_utilisateur`=?";
    
    db.query(checkSessionQuery, [user.id_utilisateur], async (err, sessionResults) => {
      if (err) {
        return res.status(500).json({
          islogin: false,
          message: "Erreur lors de la vérification de la session"
        });
      }

      if (sessionResults.length > 0) {
        // Mettre à jour la session existante
        const updateSessionQuery = `
          UPDATE session_utilisateur 
          SET otp = ?, 
              otp_expiry = ?, 
              date_modification = NOW() 
          WHERE id_utilisateur = ?
        `;
        
        db.query(updateSessionQuery, [otp, otpExpiry, user.id_utilisateur], async (err) => {
          if (err) {
            return res.status(500).json({
              islogin: false,
              message: "Erreur lors de la mise à jour de la session"
            });
          }
         const resultMail= await sendOTPEmail(user.email, otp);
         if(resultMail)
         {
            res.status(200).json({
              islogin:true,
              iduser: user.id_utilisateur,
              nom: user.nom,
              prenom: user.prenom,
              telephone: user.telephone,
              email: user.email,
              message: "Code de vérification envoyé",
            });
         }
         else
         {
          res.status(200).json({
            islogin:false,
            iduser: user.id_utilisateur,
            nom: user.nom,
            prenom: user.prenom,
            telephone: user.telephone,
            email: user.email,
            message: "Erreur lors de l'envoi du code de verification",
          });
         }
          // res.status(200).json({
          //   success: true,
          //   message: "Code de vérification envoyé",
          //   userId: user.id_utilisateur,
          //   email: user.email
          // });
        });
      } else {
        // Créer une nouvelle session
        const insertSessionQuery = `
          INSERT INTO session_utilisateur 
          (id_utilisateur, role, otp, otp_expiry, date_creation, date_modification) 
          VALUES (?, ?, ?, ?, NOW(), NOW())
        `;
        
        db.query(insertSessionQuery, [user.id_utilisateur, userRole, otp, otpExpiry], async (err) => {
          if (err) {
            return res.status(500).json({
              islogin: false,
              message: "Erreur lors de la création de la session"
            });
          }
         const resultMail= await sendOTPEmail(user.email, otp);
         if(resultMail)
          {
             res.status(200).json({
               islogin:true,
               iduser: user.id_utilisateur,
               nom: user.nom,
               prenom: user.prenom,
               telephone: user.telephone,
               email: user.email,
               message: "Code de vérification envoyé",
             });
          }
          else
          {
           res.status(200).json({
             islogin:false,
             iduser: user.id_utilisateur,
             nom: user.nom,
             prenom: user.prenom,
             telephone: user.telephone,
             email: user.email,
             message: "Erreur lors de l'envoi du code de verification",
           });
          }
         
          // res.status(200).json({
          //   success: true,
          //   message: "Code de vérification envoyé",
          //   userId: user.id_utilisateur,
          //   email: user.email
          // });
        });
      }
    });
  } catch (err) {
    console.error("Erreur lors de l'initiation de la connexion:", err);
    res.status(200).json({
      islogin:false,
      error:err.message,
      message: "Une erreur s'est produite",
    });
    // res.status(500).json({
    //   success: false,
    //   message: "Une erreur s'est produite",
    //   error: err.message
    // });
  }
};

// Deuxième étape de connexion (vérification OTP)
const verifyOTP = async (req, res) => {
    const { id_utilisateur, otp } = req.body;

    try {
        // 1. Vérifier si une session existe pour cet email
        const checkSessionQuery = `
            SELECT * FROM session_utilisateur 
            WHERE id_utilisateur = ? 
            AND otp = ? 
            AND otp_expiry > NOW()
        `;

        db.query(checkSessionQuery, [id_utilisateur, otp], async (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Erreur lors de la vérification de l'OTP",
                    error: err.message
                });
            }

            // 2. Vérifier si une session valide a été trouvée
            if (results.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "OTP invalide ou expiré"
                });
            }

            const session = results[0];

            // 3. Générer le token JWT final
            const token = jwt.sign(
                { 
                    id: session.id_utilisateur,
                    email: session.email,
                    role: session.role
                },
                process.env.JWT_SECRET,
                { expiresIn: '4h' }
            );

            // 4. Mettre à jour la session (marquer l'OTP comme utilisé)
            const updateSessionQuery = `
                UPDATE session_utilisateur 
                SET otp = NULL, 
                    otp_expiry = NULL,
                    date_modification = NOW()
                WHERE id_utilisateur = ?
            `;

            db.query(updateSessionQuery, [session.id_utilisateur], (updateErr) => {
                if (updateErr) {
                    return res.status(500).json({
                        success: false,
                        message: "Erreur lors de la mise à jour de la session",
                        error: updateErr.message
                    });
                }

                // 5. Retourner la réponse avec le token
                return res.status(200).json({
                    success: true,
                    message: "Authentification réussie",
                    data: {
                        token,
                         user: {
                             iduser: session.id_utilisateur,
                             role: session.role
                        }
                    }
                });
            });
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Erreur serveur",
            error: error.message
        });
    }
};
// Méthode pour la connexion de l'utilisateur
const ConnectUser = async (req, res, next) => {
  try {
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
const authjwtcontroller = {
  initiateLogin,
  verifyOTP,
  verifyToken,
  checkRole,
  ConnectUser
};

export default authjwtcontroller;

