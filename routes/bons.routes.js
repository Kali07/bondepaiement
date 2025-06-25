const express = require('express');
const router = express.Router();
const bonsController = require('../controllers/bons.controller');
// Route : GET /api/bons → avec filtres en query string
router.get('/', bonsController.getFilteredBons);
module.exports = router;