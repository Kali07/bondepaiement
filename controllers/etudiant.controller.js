const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// ============================
// Connexion étudiant
// ============================
exports.login = async (req, res) => {
  const { matricule, motDePasse } = req.body;

  try {
    const [rows] = await db.execute(`
      SELECT u.*, p.nom AS promotion 
      FROM users u
      LEFT JOIN promotions p ON u.id_promotions = p.id
      WHERE u.matricule = ?
    `, [matricule]);

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
      { 
        id: utilisateur.id,
        matricule: utilisateur.matricule,
        role: utilisateur.role_id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        promotion: utilisateur.promotion || "NC"
      },
      process.env.JWT_SECRET || 'vraimentsecret',
      { expiresIn: '6h' }
    );

    res.json({
      message: "Connexion réussie",
      token
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vraimentsecret');

    const [rows] = await db.execute(`
      SELECT u.id, u.nom, u.prenom, u.matricule, u.email, p.nom AS promotion
      FROM users u
      LEFT JOIN promotions p ON u.id_promotions = p.id
      WHERE u.id = ?
    `, [decoded.id]);

    if (rows.length === 0) return res.status(404).json({ message: "Utilisateur introuvable" });

    res.json(rows[0]);

  } catch (err) {
    console.error("Erreur récupération étudiant :", err);
    res.status(403).json({ message: "Token invalide ou expiré" });
  }
};
