require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app'); // On importe les rouages qu'on vient de créer

// 1. Connexion au coffre-fort (MongoDB)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✨ L'Élixir est actif : La base de données M. B. est en ligne."))
  .catch((err) => console.error("Erreur de connexion aux archives :", err));

// 2. Allumage du cœur du site
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Le cœur de M. B. bat avec élégance sur le port ${PORT}`);
});