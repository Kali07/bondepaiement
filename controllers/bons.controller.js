const db = require('../config/db');

// ============================
// GET : Récupération des bons avec filtres
// ============================

const getFilteredBons = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(`
      SELECT b.id, t.nom AS description, b.montant, b.reference, b.statut, b.date_creation
      FROM bons_paiement b
      JOIN bons_types t ON b.type_id = t.id
      WHERE b.user_id = ?
      ORDER BY b.date_creation DESC
    `, [userId]);

    res.json(rows);
  } catch (error) {
    console.error("Erreur récupération bons :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getAllBonsAdmin = async (req, res) => {
  const { type_id, statut, dateDebut } = req.query;
  const params = [];
  let where = "WHERE 1=1";  

  if (type_id) {
    where += " AND b.type_id = ?";
    params.push(type_id);
  }
  if (statut) {
    where += " AND b.statut = ?";
    params.push(statut);
  }
  if (dateDebut) {
    where += " AND DATE(b.date_creation) = ?";
    params.push(dateDebut);
  }

  try {
    const [rows] = await db.query(`
      SELECT 
        b.id, t.nom AS type_bon, b.description, b.montant, b.reference, 
        b.statut, b.date_creation,
        b.nom_etudiant, b.prenom_etudiant, b.matricule_etudiant, b.promotion_etudiant
      FROM bons_paiement b
      JOIN bons_types t ON b.type_id = t.id
      ${where}
      ORDER BY b.date_creation DESC
    `, params);

    res.json(rows);
  } catch (error) {
    console.error("Erreur récupération bons admin :", error);
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

// Modification du statut par l'admin
const updateStatutBonAdmin = async (req, res) => {
  const { id } = req.params;
  const { statut } = req.body;

  if (!["en attente", "validé", "annulé"].includes(statut)) {
    return res.status(400).json({ message: "Statut invalide" });
  }

  try {
    await db.query(`UPDATE bons_paiement SET statut = ? WHERE id = ?`, [statut, id]);
    res.json({ message: "Statut mis à jour" });
  } catch (error) {
    console.error("Erreur update statut :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Suppression d'un bon par l'admin
const deleteBonAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query(`DELETE FROM bons_paiement WHERE id = ?`, [id]);
    res.json({ message: "Bon supprimé" });
  } catch (error) {
    console.error("Erreur suppression bon :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getStatsBons = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN statut = 'validé' THEN 1 ELSE 0 END) AS valides,
        SUM(CASE WHEN statut = 'en attente' THEN 1 ELSE 0 END) AS en_attente,
        SUM(CASE WHEN statut = 'annulé' THEN 1 ELSE 0 END) AS annules,
        SUM(montant) AS montant_total
      FROM bons_paiement
    `);

    res.json(rows[0]);
  } catch (err) {
    console.error("Erreur stats :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = {
  getFilteredBons,
  creerBon,
  getAllBonsAdmin,
  updateStatutBonAdmin,
  deleteBonAdmin,
  getStatsBons
};


// ============================
// CRUD : ADMIN
// ============================


// exports.getAll = (req, res) => {
//   db.query('SELECT * FROM bons_types', (err, results) => {
//     if (err) return res.status(500).json({ message: 'Erreur serveur' });
//     res.json(results);
//   });
// };

// exports.create = (req, res) => {
//   const { nom } = req.body;
//   if (!nom) return res.status(400).json({ message: 'Nom requis' });
  
//   db.query('INSERT INTO bons_types (nom) VALUES (?)', [nom], (err) => {
//     if (err) return res.status(500).json({ message: 'Erreur serveur' });
//     res.json({ message: 'Type de bon ajouté' });
//   });
// };

// exports.delete = (req, res) => {
//   const { id } = req.params;
//   db.query('DELETE FROM bons_types WHERE id = ?', [id], (err) => {
//     if (err) return res.status(500).json({ message: 'Erreur serveur' });
//     res.json({ message: 'Type supprimé' });
//   });
// };

// exports.update = (req, res) => {
//   const { id } = req.params;
//   const { nom } = req.body;
//   if (!nom) return res.status(400).json({ message: 'Nom requis' });

//   db.query('UPDATE bons_types SET nom = ? WHERE id = ?', [nom, id], (err) => {
//     if (err) return res.status(500).json({ message: 'Erreur serveur' });
//     res.json({ message: 'Type modifié' });
//   });
// };