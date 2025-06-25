const express = require('express');
const router = express.Router();
const { updatePassword } = require('../controllers/password.controller');
const passwordController = require('../controllers/password.controller');
// Route POST pour la mise à jour du mot de passe
router.post('/update-password', passwordController.updatePassword);
module.exports = router;