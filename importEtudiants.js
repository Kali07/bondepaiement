// importEtudiants.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const bcrypt = require('bcrypt');
const pool = require('./config/db'); // adapte ce chemin selon ton projet
const fichierCSV = path.join(__dirname, 'data', 'etudiants_valides.csv');
const importerEtudiants = async () => {
  const etudiants = [];
  fs.createReadStream(fichierCSV)
    .pipe(csv()) // séparateur par défaut : virgule
    .on('data', (row) => {
      // Vérification que les champs requis existent
      if (
        row.matricule &&
        row.nom &&
        row.postnom &&
        row.prenom &&
        row.mot_de_passe_temporaire
      ) {
        etudiants.push(row);
      } else {
        console.warn(' Ligne ignorée (incomplète) :', row);
      }
    })
    .on('end', async () => {
      console.log(`Étudiants à importer : ${etudiants.length}`);
      for (const etudiant of etudiants) {
        try {
          const hash = await bcrypt.hash(etudiant.mot_de_passe_temporaire, 10);

          await pool.query(
            `INSERT INTO etudiants_valides (matricule, nom, postnom, prenom, mot_de_passe_temporaire)
             VALUES (?, ?, ?, ?, ?)`,
            [
              etudiant.matricule.trim(),
              etudiant.nom.trim(),
              etudiant.postnom.trim(),
              etudiant.prenom.trim(),
              hash,
            ]
          );
          console.log(`Importé : ${etudiant.matricule}`);
        } catch (err) {
          console.error(`Erreur pour ${etudiant.matricule} :`, err.message);
        }
      }

      console.log('Importation terminée.');
    });
};
importerEtudiants();