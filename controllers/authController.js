const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getUserByMatriculeOrEmail } = require('../models/userModel');
  const login = (req, res) => {
  const { identifier, password } = req.body;
  // Vérification que les champs existent
  if (!identifier || !password) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires." });
  }
  // Vérifie que l'identifiant est un email ou un matricule valide (ex : SI000123)
  const isEmail = validator.isEmail(identifier);
  const isMatricule = /^SI0\d{4,}$/.test(identifier);
  if (!isEmail && !isMatricule) {
    return res.status(400).json({ error: "Identifiant invalide. Entrez un email ou un matricule valide." });
  }
  // Vérifie que le mot de passe a une longueur minimale
  if (!validator.isLength(password, { min: 8 })) {
    return res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères." });
  }
  getUserByMatriculeOrEmail(identifier, (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    if (results.length === 0) return res.status(401).json({ error: 'Utilisateur non trouvé' });
    const user = results[0];
    // Comparer le mot de passe avec bcrypt
    bcrypt.compare(password, user.mot_de_passe, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(401).json({ error: 'Mot de passe incorrect' });
      }
      const token = jwt.sign(
        { id: user.id, role: user.role_id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      return res.status(200).json({
        message: 'Connexion réussie',
        token,
        role: user.role_id
      });
    });
  });
};
module.exports = { login };