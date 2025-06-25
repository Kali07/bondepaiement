const validator = require('validator');
const db = require('../config/db'); // Connexion MySQL
const bcrypt = require('bcrypt');
exports.loginAdmin = (req, res) => {
  const { email, mot_de_passe } = req.body;
  if (!email || !mot_de_passe) {
    return res.status(400).json({ message: 'Veuillez remplir tous les champs.' });
  }
  //validation email
  if(!validator.isEmail(email)) {
    return res.status(400).json({message: 'Email invalide.' });
  }
  //validation longueur password
  if(!validator.isLength(mot_de_passe, { min:8 })) {
    return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caracteres.' });
  }
  // Récupérer l'utilisateur admin par email
  const sql = `
    SELECT u.id, u.nom, u.email, u.mot_de_passe, r.nom AS role
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.email = ? AND r.nom = 'administrateur'
  `;
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Erreur MySQL :', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Administrateur non trouvé ou accès refusé.' });
    }
    const admin = results[0];
    // Comparer les mots de passe avec bcrypt
    bcrypt.compare(mot_de_passe, admin.mot_de_passe, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(401).json({ message: 'Mot de passe incorrect' });
      }

      return res.status(200).json({
        message: 'Connexion réussie',
        user: {
          id: admin.id,
          nom: admin.nom,
          email: admin.email,
          role: admin.role
        }
      });
    });
  });
};