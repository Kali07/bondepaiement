const express = require('express');
const router = express.Router();
const bonsTypesController = require('../controllers/bonsTypes.controller');
// Récupérer tous les types de bons
router.get('/', bonsTypesController.getBonsTypes);
// Ajouter un nouveau type de bon
router.post('/', bonsTypesController.createBonType);
// Mettre à jour un type de bon existant
router.put('/:id', bonsTypesController.updateBonType);
// Supprimer un type de bon
router.delete('/:id', bonsTypesController.deleteBonType);
module.exports = router;