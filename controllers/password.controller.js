const db = require('../config/db');
const bcrypt = require('bcrypt');
const validator = require('validator');
const updatePassword = (req, res) => {
  const { matricule, nouveau_mot_de_passe, confirmer_mot_de_passe } = req.body;
  if (!matricule || !nouveau_mot_de_passe || !confirmer_mot_de_passe) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  if (!validator.isLength(nouveau_mot_de_passe, { min: 8 })) {
    return res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères." });
  }

  if (nouveau_mot_de_passe !== confirmer_mot_de_passe) {
    return res.status(400).json({ error: "Les mots de passe ne correspondent pas." });
  }

  // Vérifie si l'utilisateur existe
  const checkQuery = 'SELECT * FROM users WHERE matricule = ?';
  db.query(checkQuery, [matricule], (err, results) => {
    if (err) return res.status(500).json({ error: "Erreur serveur" });
    if (results.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    // Hash du nouveau mot de passe
    bcrypt.hash(nouveau_mot_de_passe, 10, (err, hashedPassword) => {
      if (err) return res.status(500).json({ error: "Erreur de hachage." });

      const updateQuery = 'UPDATE users SET mot_de_passe = ?, doit_changer_mot_de_passe = 0 WHERE matricule = ?';
      db.query(updateQuery, [hashedPassword, matricule], (err) => {
        if (err) return res.status(500).json({ error: "Erreur lors de la mise à jour." });
        return res.status(200).json({ message: "Mot de passe mis à jour avec succès." });
      });
    });
  });
};
module.exports = { updatePassword };