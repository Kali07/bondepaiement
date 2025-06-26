console.log("bons.routes.js chargé !");
const express = require('express');
const router = express.Router();
const bonsController = require('../controllers/bons.controller');
const authMiddleware = require('../middlewares/auth.middleware');

//router.get('/', bonsController.getFilteredBons);
router.post('/', authMiddleware, bonsController.creerBon);
router.get('/', authMiddleware, bonsController.getFilteredBons);


module.exports = router;

