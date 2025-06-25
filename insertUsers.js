const db = require('./config/db'); // Assure-toi que le chemin est correct
const bcrypt = require('bcrypt');
// Crée deux utilisateurs (admin et étudiant)
const users = [
  {
    matricule: 'ADM001',
    nom: 'Admin',
    prenom: 'Principal',
    email: 'admin@example.com',
    mot_de_passe: 'Admin@123', // mot de passe en clair à hasher
    role_id: 1, // Administrateur
    actif: 1,
    doit_changer_mot_de_passe: 0,
    id_facultés: null,
    id_promotions: null
  },
  {
    matricule: 'SI001122',
    nom: 'Etudiant',
    prenom: 'Test',
    email: 'etudiant@example.com',
    mot_de_passe: 'Etudiant@123', // mot de passe en clair à hasher
    role_id: 2, // Étudiant
    actif: 1,
    doit_changer_mot_de_passe: 1,
    id_facultés: null,
    id_promotions: null
  }
];
async function insertUsers() {
  for (const user of users) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.mot_de_passe, salt);
      const sql = `
        INSERT INTO users (
          matricule, nom, prenom, email, mot_de_passe, role_id, date_creation,
          actif, doit_changer_mot_de_passe, id_facultés, id_promotions
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)
      `;
      await new Promise((resolve, reject) => {
        db.query(sql, [
          user.matricule,
          user.nom,
          user.prenom,
          user.email,
          hashedPassword,
          user.role_id,
          user.actif,
          user.doit_changer_mot_de_passe,
          user.id_facultés,
          user.id_promotions
        ], (err, result) => {
          if (err) {
            console.error(`Erreur insertion utilisateur ${user.email}:`, err);
            return reject(err);
          }
          console.log(`✅ Utilisateur inséré : ${user.email}`);
          resolve();
        });
      });

    } catch (err) {
      console.error('Erreur générale :', err);
    }
  }
  db.end(); // Ferme la connexion après insertion
}
insertUsers();