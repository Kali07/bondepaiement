const db = require('../config/db');
const validator = require('validator');
// Récupérer tous les types de bons
const getBonsTypes = (req, res) => {
  const query = 'SELECT * FROM bons_types';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Erreur serveur" });
    return res.status(200).json(results);
  });
};
//Créer un nouveau type de bon
const createBonType = (req, res) => {
  const { nom } = req.body;
  if (!nom || !validator.isLength(nom.trim(), { min: 3 })) {
    return res.status(400).json({ error: "Le nom du bon est invalide (min 3 caractères)." });
  }
  const query = 'INSERT INTO bons_types (nom) VALUES (?)';
  db.query(query, [nom.trim()], (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur lors de l'ajout du bon" });
    return res.status(201).json({ message: "Type de bon ajouté", id: result.insertId });
  });
};
// Modifier un type de bon existant
const updateBonType = (req, res) => {
  const { id } = req.params;
  const { nom } = req.body;
  if (!validator.isInt(id.toString()) || !nom || !validator.isLength(nom.trim(), { min: 3 })) {
    return res.status(400).json({ error: "Entrées invalides." });
  }
  const query = 'UPDATE bons_types SET nom = ? WHERE id = ?';
  db.query(query, [nom.trim(), id], (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur de modification" });
    return res.status(200).json({ message: "Type de bon modifié" });
  });
};
// Supprimer un type de bon
const deleteBonType = (req, res) => {
  const { id } = req.params;
  if (!validator.isInt(id)) {
    return res.status(400).json({ error: "ID invalide" });
  }
  const query = 'DELETE FROM bons_types WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Erreur de suppression" });
    return res.status(200).json({ message: "Type de bon supprimé" });
  });
};
// Export de toutes les fonctions
module.exports = {
  getBonsTypes,
  createBonType,
  updateBonType,
  deleteBonType
};