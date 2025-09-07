import mysql from 'mysql';
import dotenv from 'dotenv'

// Configurer l'acces aux variables d'environnement
dotenv.config();

const db = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10 // Limite le nombre de connexions simultanées
});

// Vérifier la connexion
db.getConnection((err, connection) => {
    if (err) {
        console.error("Erreur lors de la connexion à la base de données:", err);
        return;
    }
    console.log("Connexion à la base de données établie avec succès");
    connection.release(); // Libère la connexion du pool
});

export default db;