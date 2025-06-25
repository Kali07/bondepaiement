const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const path = require('path');
const app = express();
const cors = require('cors');
const authRoutes = require('./routes/auth');
const registreurRoutes = require('./routes/registreur');
const bonsTypesRoutes = require('./routes/bonsTypes');
const importRoutes = require('./routes/import');
const bonsRoutes = require('./routes/bons.routes');
const adminRoutes = require('./routes/admin.routes');
const etudiantRoutes = require('./routes/etudiant.routes');
app.use(express.json());
app.use(express.static(path.join(__dirname,'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});
app.get('/new-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'new-password.html'));
});
app.use(cors());
app.use('/api/registreur', registreurRoutes);
app.use('/api/bons-types', bonsTypesRoutes);
app.use('/api/bons',bonsRoutes);
app.use('/api/import',importRoutes,);
app.use('/api/auth', authRoutes); 
app.use('/api/admin',adminRoutes);
app.use('/api/etudiants', etudiantRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});