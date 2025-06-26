const jwt = require('jsonwebtoken');
const db = require('../config/db');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Token manquant" });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vraimentsecret');

    const [rows] = await db.query(
      `SELECT u.id, u.nom, u.prenom, u.role_id, r.nom AS role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [decoded.id]
    );

    if (rows.length === 0 || rows[0].role !== 'admin') {
      return res.status(403).json({ message: "Accès réservé aux administrateurs" });
    }

    req.user = {
      id: rows[0].id,
      nom: rows[0].nom,
      prenom: rows[0].prenom,
      role: rows[0].role
    };

    next();
  } catch (err) {
    console.error(err);
    return res.status(403).json({ message: "Token invalide ou expiré" });
  }
};
