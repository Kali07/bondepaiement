const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
// Route POST pour la connexion admin
router.post('/login', adminController.loginAdmin);
module.exports = router;