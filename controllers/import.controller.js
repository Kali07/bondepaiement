const xlsx = require('xlsx');
const db = require('../config/db');
const path = require('path');
const importEtudiants = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier n'a été envoyé." });
  }
  const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
  const insertQuery = `
    INSERT INTO etudiants_valides (matricule, nom, prenom, email, mot_de_passe_temporaire)
    VALUES (?, ?, ?, ?, ?)
  `;
  data.forEach(row => {
    const { matricule, nom, prenom, email, mot_de_passe_temporaire } = row;
    // Tu peux ajouter ici le hachage SHA256 du mot de passe si nécessaire
    db.query(insertQuery, [matricule, nom, prenom, email, mot_de_passe_temporaire], (err) => {
      if (err) console.error('Erreur lors de l\'insertion :', err);
    });
  });
  res.json({ message: "Importation terminée." });
};
module.exports = { importEtudiants };