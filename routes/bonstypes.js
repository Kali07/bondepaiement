const express = require('express');
const router = express.Router();
const bonsTypesController = require('../controllers/bonsTypes.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, bonsTypesController.getAll);
router.post('/', authMiddleware, bonsTypesController.create);
router.put('/:id', authMiddleware, bonsTypesController.update);
router.delete('/:id', authMiddleware, bonsTypesController.delete);

router.get('/montant', authMiddleware, bonsTypesController.getMontantParMotif);

module.exports = router;
