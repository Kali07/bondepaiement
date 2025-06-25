const jwt = require('jsonwebtoken');
const validator = require('validator');
const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.loginAdmin = async (req, res) => {
    const { email, mot_de_passe } = req.body;
    console.log("[BACK] Reçu :", { email, mot_de_passe });

    if (!email || !mot_de_passe) {
        console.log("[BACK] Champs manquants");
        return res.status(400).json({ message: 'Veuillez remplir tous les champs.' });
    }

    const sql = `
        SELECT u.id, u.nom, u.email, u.mot_de_passe, r.nom AS role
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.email = ? AND r.nom = 'admin'
    `;

    console.log("[BACK] Exécution de la requête SQL...");

    try {
        const [results] = await db.query(sql, [email]);

        console.log("[BACK] Résultats SQL :", results);

        if (results.length === 0) {
            console.log("[BACK] Aucun administrateur trouvé ou mauvais rôle");
            return res.status(401).json({ message: 'Administrateur non trouvé ou accès refusé.' });
        }

        const admin = results[0];
        console.log("[BACK] Utilisateur trouvé :", admin);

        // Comparaison en clair (temporaire)
        if (mot_de_passe !== admin.mot_de_passe) {
            console.log("[BACK] Mot de passe incorrect");
            return res.status(401).json({ message: 'Mot de passe incorrect' });
        }

        const token = jwt.sign(
            { id: admin.id, email: admin.email, role: admin.role },
            process.env.JWT_SECRET || 'vraimentsecret',
            { expiresIn: '2h' }
        );

        console.log("[BACK] Token généré :", token);

        return res.status(200).json({
            message: 'Connexion réussie',
            token,
            user: {
                id: admin.id,
                nom: admin.nom,
                email: admin.email,
                role: admin.role
            }
        });

        // Version sécurisée avec bcrypt à activer plus tard
        /*
        const isMatch = await bcrypt.compare(mot_de_passe, admin.mot_de_passe);
        if (!isMatch) {
            console.log("[BACK] Mot de passe incorrect (bcrypt)");
            return res.status(401).json({ message: 'Mot de passe incorrect' });
        }
        */
        
    } catch (err) {
        console.error("[BACK] Erreur SQL ou serveur :", err);
        return res.status(500).json({ message: "Erreur serveur" });
    }
};


        // Version sécurisée avec bcrypt (à activer quand les mots de passe sont hashés)
        /*
        bcrypt.compare(mot_de_passe, admin.mot_de_passe, (err, isMatch) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Erreur serveur" });
            }

            if (!isMatch) {
                return res.status(401).json({ message: "Mot de passe incorrect" });
            }

            const token = jwt.sign(
                { id: admin.id, email: admin.email, role: admin.role },
                process.env.JWT_SECRET || 'vraimentsecret',
                { expiresIn: '2h' }
            );

            return res.status(200).json({
                message: 'Connexion réussie',
                token,
                user: {
                    id: admin.id,
                    nom: admin.nom,
                    email: admin.email,
                    role: admin.role
                }
            });
        });
        */