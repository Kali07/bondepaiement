const express = require('express');
const router = express.Router();
const registreurController = require('../controllers/registreur.controller');
router.post('/verifier', registreurController.verifierEtudiant);
router.post('/creer-mot-de-passe', registreurController.creerMotDePasse);
module.exports = router;