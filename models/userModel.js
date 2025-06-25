const db = require('../config/db');
const getUserByMatriculeOrEmail = (identifier, callback) => {
  const query = 'SELECT * FROM users WHERE email = ? OR matricule = ?';
  db.query(query, [identifier, identifier], callback);
};
module.exports = { getUserByMatriculeOrEmail };