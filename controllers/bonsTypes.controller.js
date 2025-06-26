const db = require('../config/db'); 
const validator = require('validator');

exports.getAll = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM bons_types');
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.create = async (req, res) => {
  const { nom, montant } = req.body;

  if (!nom || nom.length < 3) return res.status(400).json({ message: 'Nom requis' });
  if (isNaN(montant) || montant <= 0) return res.status(400).json({ message: 'Montant invalide' });

  try {
    await db.query('INSERT INTO bons_types (nom, montant) VALUES (?, ?)', [nom, montant]);
    res.json({ message: 'Type de bon ajouté' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { nom, montant } = req.body;

  if (!nom || nom.length < 3) return res.status(400).json({ message: 'Nom requis' });
  if (isNaN(montant) || montant <= 0) return res.status(400).json({ message: 'Montant invalide' });

  try {
    await db.query('UPDATE bons_types SET nom = ?, montant = ? WHERE id = ?', [nom, montant, id]);
    res.json({ message: 'Type modifié' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM bons_types WHERE id = ?', [id]);
    res.json({ message: 'Type supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getMontantParMotif = async (req, res) => {
  const motif = req.query.motif;

  try {
    const [rows] = await db.query('SELECT montant FROM bons_types WHERE nom = ?', [motif]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Type de bon introuvable" });
    }

    res.json({ montant: rows[0].montant });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
