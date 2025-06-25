const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { importEtudiants } = require('../controllers/import.controller');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });
router.post('/import-etudiants', upload.single('fichier'), importEtudiants);
module.exports = router;