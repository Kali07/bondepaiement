const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// ============================
// Connexion étudiant
// ============================
exports.login = async (req, res) => {
  const { matricule, motDePasse } = req.body;

  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE matricule = ?', [matricule]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Matricule incorrect" });
    }

    const utilisateur = rows[0];

    if (utilisateur.doit_changer_mot_de_passe === 1) {
      return res.status(403).json({ message: "Veuillez d’abord activer votre compte avec le mot de passe temporaire." });
    }

    const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.mot_de_passe);
    if (!motDePasseValide) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    const token = jwt.sign(
      { id: utilisateur.id, matricule: utilisateur.matricule, role: utilisateur.role_id },
      process.env.JWT_SECRET || 'vraimentsecret',
      { expiresIn: '6h' }
    );
    console.log("Token généré:", token);
    res.json({
      message: "Connexion réussie",
      token,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
       id: utilisateur.id,
      matricule: utilisateur.matricule
    });

  } catch (error) {
    console.error("Erreur lors de la connexion étudiant :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ============================
// API pour récupérer les infos de l'étudiant connecté
// ============================
exports.getInfosEtudiant = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: "Token manquant" });

  try {
  const id = req.user.id;  // récupéré directement depuis le middleware

  const [rows] = await db.execute(`
    SELECT u.id, u.nom, u.prenom, u.matricule, u.email,
           p.nom AS promotion
    FROM users u
    LEFT JOIN promotions p ON u.id_promotions = p.id
    WHERE u.id = ?
  `, [id]);

  if (rows.length === 0) return res.status(404).json({ message: "Utilisateur introuvable" });

  res.json(rows[0]);

} catch (err) {
  console.error("Erreur récupération étudiant :", err);
  res.status(500).json({ message: "Erreur serveur" });
}
};