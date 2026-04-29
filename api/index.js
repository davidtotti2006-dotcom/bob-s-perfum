require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
};

connectDB().catch((err) => console.error('Erreur de connexion MongoDB:', err));

module.exports = app;
