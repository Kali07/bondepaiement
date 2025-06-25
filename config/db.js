const mysql = require('mysql2/promise');  // <- changement ici
require('dotenv').config();
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,   // nombre max de connexions simultanées dans le pool
  queueLimit: 0
});

(async () => {
  try {
    const connection = await db.getConnection();
    console.log('Connexion à la base de données réussie.');
    connection.release();
  } catch (err) {
    console.error('Erreur de connexion à la BDD :', err.message);
  }
})();
module.exports = db;