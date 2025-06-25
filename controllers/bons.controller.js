const db = require('../config/db');

// ============================
// GET : Récupération des bons avec filtres
// ============================

const getFilteredBons = async (req, res) => {
  const { type_id, statut, dateDebut, dateFin } = req.query;

  const query = `
    SELECT 
      bp.id, 
      u.nom AS nom_utilisateur, 
      bt.nom AS type_bon, 
      bp.montant, 
      bp.description, 
      bp.reference,
      bp.code_qr, 
      bp.statut, 
      bp.date_creation
    FROM bons_paiement bp
    JOIN users u ON bp.user_id = u.id
    JOIN bons_types bt ON bp.type_id = bt.id
    WHERE 
      (? IS NULL OR bp.type_id = ?) AND
      (? IS NULL OR bp.statut = ?) AND
      (
        (? IS NULL OR ? IS NULL) OR 
        bp.date_creation BETWEEN ? AND ?
      )
    ORDER BY bp.date_creation DESC;
  `;

  const values = [
    type_id || null, type_id || null,
    statut || null, statut || null,
    dateDebut || null, dateFin || null,
    dateDebut || null, dateFin || null
  ];

  try {
    const [rows] = await db.query(query, values);
    res.json(rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des bons :", error);
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
