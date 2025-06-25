const db = require('../config/db'); // ou ton fichier de connexion
const getFilteredBons = async (req, res) => {
  const { type_id, statut, dateDebut, dateFin } = req.query;
  const query = `
    SELECT 
      bp.id, 
      u.nom AS nom_utilisateur, 
      bt.nom AS type_bon, 
      bp.montant, 
      bp.description, 
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
module.exports = { getFilteredBons };