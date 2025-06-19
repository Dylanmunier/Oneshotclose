// Backend Node.js Express pour NumaTwin/OneShotClose
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'API NumaTwin opérationnelle' });
});

// Importation et branchement des routes API
const routes = require('./routes');
app.use('/api', routes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Serveur backend lancé sur le port ${PORT}`);
});
