//importer le fichier de connection
import  connection from "./../connection.js";
const newAdresse = (req, res) => {
  const emailAdresse = req.body.email;

    const query = "INSERT INTO newsletter (EMAIL) VALUES (?)";
    connection.query(query, [emailAdresse], (err, results) => {
      if (err) {
        res
          .status(500)
          .send("erreur lors de l'enregistrement de l'email : ", err);
      }

      console.log("insertion reussit");
      res.status(200).send("email enregistrer avec succes !");
    });
};
const newComment = (req, res) => {
  const nom = req.body.nom;
  const email = req.body.email;
  const message = req.body.message;
  const query =
    "INSERT INTO `sugestions`( `NOM`, `EMAIL`, `MESSAGE`) VALUES (?,?,?)";
  connection.query(query, [nom, email, message], (err, results) => {
    if (err) {
      res
        .status(500)
        .send("erreur lors de l'enregistrement de l'email : ", err);
    }
    console.log("sugestion inserer avec success !");
    res.status(200).send("sugestion enregistrer avec succes !");
  });
};
async function verifyGoogleEmail(email) {
  try {
    // Créer un transporter Nodemailer configuré pour Gmail
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "dimitribonsou26@gmail.com",
        pass: "magma2005",
      },
    });

    // Envoyer un message de test à l'adresse email
    const info = await transporter.sendMail({
      from: "dimitribonsou26@gmail.com",
      to: email,
      subject: "Vérification d'adresse email",
      text: "Ceci est un message de test pour vérifier la validité de votre adresse email.",
    });

    // Vérifier si le message a été envoyé avec succès
    if (info.rejected.length === 0) {
      console.log(`L'adresse email ${email} est valide.`);
      return true;
    } else {
      console.log(`L'adresse email ${email} n'est pas valide.`);
      return false;
    }
  } catch (error) {
    console.error("Erreur lors de la vérification de l'adresse email :", error);
    return false;
  }
}



export default {
  newAdresse,
  newComment
};
