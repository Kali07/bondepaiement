// const jwt = require('jsonwebtoken');
// module.exports = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) return res.status(401).json({ message: "Token manquant" });
//   const token = authHeader.split(' ')[1];
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vraimentsecret');
//     req.user = decoded; // On stocke les infos du token dans la requête
//     next(); // On continue
//   } catch (err) {
//     return res.status(403).json({ message: "Token invalide ou expiré" });
//   }
// };
const jwt = require('jsonwebtoken');
const db = require('../config/db');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Token manquant" });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vraimentsecret');

    // Jointure pour récupérer la promotion depuis la table promotions
    const [rows] = await db.query(
      `SELECT u.id, u.nom, u.prenom, u.matricule, p.nom AS promotion
       FROM users u
       LEFT JOIN promotions p ON u.id_promotions = p.id
       WHERE u.id = ?`,
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    req.user = {
      id: rows[0].id,
      nom: rows[0].nom,
      prenom: rows[0].prenom,
      matricule: rows[0].matricule,
      promotion: rows[0].promotion || "NC"
    };

    next();
  } catch (err) {
    console.error(err);
    return res.status(403).json({ message: "Token invalide ou expiré" });
  }
};
