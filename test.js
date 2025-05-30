import  mysql from 'mysql';
import dotenv from 'dotenv'
// Configurer l'acces aux variables d'environnement
dotenv.config();
const db=mysql.createConnection({
    host:process.env.HOST,
    user:process.env.USER,
    password:process.env.PASSWORD,
    database:process.env.DB_NAME
})
db.connect((err)=>
{
    if(err) console.log("erreur lors de la connection a la base de donne")
        console.log("connection bien etablie")
})

export default db;