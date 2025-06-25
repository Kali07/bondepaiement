const express = require('express');
const router = express.Router();
const etudiantController = require('../controllers/etudiant.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/login', etudiantController.login);
router.get('/me', authMiddleware, etudiantController.getInfosEtudiant);

module.exports = router;