require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

mongoose.connect(process.env.MONGO_URI)
  .catch((err) => console.error('Erreur de connexion MongoDB:', err));

module.exports = app;
