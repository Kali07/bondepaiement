// controllers/registreur.controller.js
const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.verifierEtudiant = async (req, res) => {
  const { matricule, mot_de_passe_temporaire } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM etudiants_valides WHERE matricule = ?', [matricule]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Matricule introuvable." });
    }

    const etudiant = rows[0];
    // const match = await bcrypt.compare(mot_de_passe_temporaire, etudiant.mot_de_passe_temporaire);

    // if (!match) {
    //   return res.status(401).json({ error: "Mot de passe temporaire incorrect." });
    // }

    //pour le test (à supprimer)
if (mot_de_passe_temporaire !== etudiant.mot_de_passe_temporaire) {
  return res.status(401).json({ error: "Mot de passe temporaire incorrect." });
}

    res.status(200).json({ message: "OK", matricule });
  } catch (error) {
    console.error("Erreur serveur :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.creerMotDePasse = async (req, res) => {
  const { matricule, nouveau_mot_de_passe } = req.body;

  try {
    const hash = await bcrypt.hash(nouveau_mot_de_passe, 10);

    // 1. Récupérer les infos de l'étudiant
    const [rows] = await db.query('SELECT * FROM etudiants_valides WHERE matricule = ?', [matricule]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Matricule introuvable." });
    }

    const etu = rows[0];

    // Valeurs par défaut pour faculté et promotion
    const id_facultés = etu.id_facultés || null;
    const id_promotions = etu.id_promotions || 1;
    const role_id = etu.role_id || 2; // 2 = étudiant par défaut

    // 2. Insérer dans la table users
    await db.query(
      `INSERT INTO users 
        (matricule, nom, prenom, email, mot_de_passe, role_id, date_creation, actif, doit_changer_mot_de_passe, id_facultés, id_promotions) 
      VALUES (?, ?, ?, ?, ?, ?, NOW(), 1, 0, ?, ?)`,
      [
        etu.matricule,
        etu.nom,
        etu.prenom,
        etu.email,
        hash,
        role_id,
        id_facultés,
        id_promotions
      ]
    );

    // 3. Supprimer l'étudiant de la table temporaire
    await db.query('DELETE FROM etudiants_valides WHERE matricule = ?', [matricule]);

    // 4. Répondre au frontend
    res.status(200).json({ message: "Mot de passe enregistré avec succès." });
  } catch (error) {
    console.error("Erreur serveur :", error);
    res.status(500).json({ error: "Erreur lors de la mise à jour du mot de passe." });
  }
};
