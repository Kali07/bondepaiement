const db = require('../config/db');

// ============================
// GET : Récupération des bons avec filtres
// ============================

const getFilteredBons = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(`
      SELECT id, description, montant, reference, statut, date_creation
      FROM bons_paiement
      WHERE user_id = ?
      ORDER BY date_creation DESC
    `, [userId]);

    res.json(rows);
  } catch (error) {
    console.error("Erreur récupération bons :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


// ============================
// POST : Création d'un bon par un étudiant
// ============================

const creerBon = async (req, res) => {
  const { motif, montant, reference } = req.body;
  const userId = req.user.id;

  try {
    // Récupérer l'id du type de bon à partir du motif
    const [types] = await db.query('SELECT id FROM bons_types WHERE nom = ?', [motif]);

    if (types.length === 0) {
      return res.status(400).json({ message: "Type de bon invalide" });
    }

    const type_id = types[0].id;

    // Génération du contenu QR (même contenu que côté front)
    const qrText = `
Nom: ${req.user.nom}
Prénom: ${req.user.prenom}
Matricule: ${req.user.matricule}
Motif: ${motif}
Montant: ${montant}$
Réf: ${reference}
Banque: Rawbank UPC
Compte: 00011-55101-12345678900-55
Agence: 55101-Kinshasa UPC
    `.trim();

    // Insertion avec le champ code_qr
    await db.query(`
      INSERT INTO bons_paiement 
      (user_id, type_id, montant, description, reference, statut, nom_etudiant, prenom_etudiant, matricule_etudiant, promotion_etudiant, code_qr)
      VALUES (?, ?, ?, ?, ?, 'en attente', ?, ?, ?, ?, ?)
    `, [
      userId,
      type_id,
      montant,
      motif,
      reference,
      req.user.nom,
      req.user.prenom,
      req.user.matricule,
      req.user.promotion || "NC",
      qrText
    ]);

    res.status(201).json({ message: "Bon enregistré avec succès" });
  } catch (error) {
    console.error("Erreur lors de la création du bon :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = {
  getFilteredBons,
  creerBon
};
