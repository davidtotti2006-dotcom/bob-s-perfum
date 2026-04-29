const express = require('express');
const cors = require('cors');
const Perfume = require('./models/Perfume');

const app = express();

app.use(cors());
app.use(express.json());

// Accueil
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue dans le sanctuaire privé de M. B.' });
});

// GET /api/perfumes — avec filtres et pagination
app.get('/api/perfumes', async (req, res) => {
  try {
    const { family, status, featured, page = 1, limit = 12 } = req.query;
    const filter = { isActive: true };
    if (family) filter.family = family;
    if (status) filter.status = status;
    if (featured === 'true') filter.isFeatured = true;

    const perfumes = await Perfume.find(filter)
      .sort({ isFeatured: -1, createdAt: 1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Perfume.countDocuments(filter);

    res.json({ perfumes, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la lecture des archives.' });
  }
});

// GET /api/perfumes/:slug
app.get('/api/perfumes/:slug', async (req, res) => {
  try {
    const perfume = await Perfume.findOne({ slug: req.params.slug, isActive: true });
    if (!perfume) {
      return res.status(404).json({ message: "Ce flacon n'existe pas dans nos archives." });
    }
    res.json(perfume);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la lecture.' });
  }
});

// POST /api/seed — Initialisation des archives
app.post('/api/seed', async (req, res) => {
  try {
    await Perfume.deleteMany({});

    const seedData = [
      {
        name: 'Moonlight',
        slug: 'moonlight',
        description: "La douceur de la nuit made in Bob's — un voile lumineux qui enveloppe la peau comme la lumière de la lune sur l'océan. Sensuel, mystérieux, inoubliable.",
        story: "Né d'une nuit sans étoiles à Abidjan, au bord du Golfe de Guinée, Moonlight capture l'instant suspendu entre le coucher du soleil et l'obscurité totale — ce moment magique où tout devient possible.",
        family: 'musqué',
        notes: {
          top: ['Bergamote lunaire', 'Magnolia blanc', 'Poivre blanc'],
          heart: ['Musc de nuit', 'Jasmin étoilé', 'Iris nacré'],
          base: ['Santal blanc', 'Ambre lunaire', 'Vanille de Madagascar'],
        },
        images: ['/images/moonlight-bobs.jpeg'],
        sizes: [
          { ml: 30, price: 175, stock: 22 },
          { ml: 50, price: 235, stock: 16 },
          { ml: 100, price: 360, stock: 10 },
        ],
        status: 'Nouveau',
        isFeatured: true,
      },
      {
        name: 'Heure Sauvage',
        slug: 'heure-sauvage',
        description: "L'heure où la nature reprend ses droits — une fragrance brute, animale et libre. Heure Sauvage est un appel à l'instinct, une ode à la liberté sans compromis.",
        story: "Composée en hommage aux savanes d'Afrique de l'Ouest, cette fragrance capture l'air chaud du crépuscule, les herbes sèches sous le vent et la terre rouge après la pluie. Une invitation à l'essentiel.",
        family: 'boisé',
        notes: {
          top: ['Baies sauvages', 'Poivre noir fumé', 'Citron vert'],
          heart: ['Vétiver sauvage', 'Cèdre brûlé', 'Cuir animal'],
          base: ['Oud boisé', 'Mousse de forêt', 'Musc sauvage'],
        },
        images: ['/images/l-heure-sauvage-bobs.jpeg'],
        sizes: [
          { ml: 30, price: 195, stock: 15 },
          { ml: 50, price: 260, stock: 10 },
          { ml: 100, price: 400, stock: 6 },
        ],
        status: 'Exclusif',
        isFeatured: true,
      },
    ];

    const newPerfumes = [
      {
        name: 'Vanille Dorée',
        slug: 'vanille-doree',
        description: "Un gourmand d'une douceur envoûtante — la vanille la plus opulente, réchauffée par des épices dorées et une base crémeuse. Sensuel, réconfortant, irrésistible.",
        story: "Née d'une quête de la vanille parfaite à travers Madagascar et Tahiti, Vanille Dorée est un hommage à la richesse des îles — sucrée sans excès, dorée comme le soleil couchant.",
        family: 'oriental',
        notes: {
          top: ['Vanille de Madagascar', 'Fève tonka', 'Caramel soyeux'],
          heart: ['Benjoin', 'Iris poudré', 'Cannelle dorée'],
          base: ['Musc crémeux', 'Santal vanillé', 'Ambre chaud'],
        },
        images: ['/images/vanille-doree-gourmand.png'],
        sizes: [
          { ml: 30, price: 165, stock: 20 },
          { ml: 50, price: 220, stock: 15 },
          { ml: 100, price: 345, stock: 10 },
        ],
        status: 'Nouveau',
        isFeatured: true,
      },
      {
        name: 'Rose Éternelle',
        slug: 'rose-eternelle',
        description: "Une rose florale-poudrée d'une féminité absolue. Délicate et sophistiquée, elle capture l'essence de la rose dans sa forme la plus romantique et intemporelle.",
        story: "Inspirée des jardins de roses de Grasse au petit matin, quand la rosée amplifie chaque pétale. Rose Éternelle est une lettre d'amour à la fleur la plus noble de la parfumerie.",
        family: 'floral',
        notes: {
          top: ['Rose de mai', 'Pêche blanche', 'Bergamote rose'],
          heart: ['Rose absolue', 'Iris poudré', 'Muguet'],
          base: ['Musc satiné', 'Bois de rose', 'Ambre blanc'],
        },
        images: ['/images/rose-eternelle-floral-poudre.png'],
        sizes: [
          { ml: 30, price: 175, stock: 18 },
          { ml: 50, price: 235, stock: 14 },
          { ml: 100, price: 365, stock: 8 },
        ],
        status: 'Exclusif',
        isFeatured: true,
      },
      {
        name: 'Cèdre Vert',
        slug: 'cedre-vert',
        description: "La forêt après la pluie — un boisé vert et vivant qui respire la sève fraîche, les fougères humides et la terre noire. Naturel, noble, profondément apaisant.",
        story: "Né d'une promenade dans les forêts de cèdres de l'Atlas, au lever du soleil. Cèdre Vert capture la majesté des grands arbres anciens et la pureté de l'air montagnard.",
        family: 'boisé',
        notes: {
          top: ['Cèdre vert', 'Fougère fraîche', 'Poivre vert'],
          heart: ["Vétiver d'Haïti", 'Bois de gaïac', 'Cyprès'],
          base: ['Mousse de chêne', 'Encens vert', 'Musc boisé'],
        },
        images: ['/images/cedre-vert-boise.png'],
        sizes: [
          { ml: 30, price: 170, stock: 22 },
          { ml: 50, price: 230, stock: 16 },
          { ml: 100, price: 355, stock: 9 },
        ],
        status: 'Nouveau',
        isFeatured: false,
      },
      {
        name: "Océan d'Azur",
        slug: 'ocean-d-azur',
        description: "L'air iodé de la Méditerranée, la lumière aveuglante sur l'eau bleue, le sel sur la peau. Un hespéridié marin d'une fraîcheur absolue qui libère instantanément l'esprit.",
        story: "Composé au bord des falaises d'Eze, les yeux tournés vers la Corse. Chaque vaporisation est une invitation au voyage, une plongée dans l'azur infini de la Grande Bleue.",
        family: 'frais',
        notes: {
          top: ['Bergamote côtière', 'Citron de Sicile', 'Embruns marins'],
          heart: ['Algue bleue', 'Fleur de sel', 'Calone marine'],
          base: ['Ambre aquatique', 'Musc frais', 'Cèdre blanc'],
        },
        images: ['/images/ocean-azur-marin.png'],
        sizes: [
          { ml: 30, price: 155, stock: 28 },
          { ml: 50, price: 210, stock: 20 },
          { ml: 100, price: 330, stock: 14 },
        ],
        status: 'Nouveau',
        isFeatured: false,
      },
      {
        name: 'Bois Sauvage',
        slug: 'bois-sauvage',
        description: "Un boisé fumé d'une intensité rare — brut, animal, mystérieux. Il évoque les feux de camp en forêt profonde, la résine brûlée et le cuir patiné par les années.",
        story: "Né d'une nuit passée autour d'un feu de bois au cœur de la forêt équatoriale. Bois Sauvage célèbre la beauté sombre et instinctive de la nature à l'état pur.",
        family: 'boisé',
        notes: {
          top: ['Fumée de bois', 'Poivre noir', 'Baies sauvages'],
          heart: ['Oud fumé', 'Cuir tanné', 'Résine de pin'],
          base: ['Cèdre brûlé', 'Musc animal', 'Labdanum'],
        },
        images: ['/images/bois-sauvage-boise-fume.png'],
        sizes: [
          { ml: 30, price: 185, stock: 16 },
          { ml: 50, price: 250, stock: 11 },
          { ml: 100, price: 390, stock: 7 },
        ],
        status: 'Best-seller',
        isFeatured: true,
      },
      {
        name: 'Ambre Royale',
        slug: 'ambre-royale',
        description: "L'orient dans toute sa splendeur — un ambré royal d'une richesse hypnotique. Chaud, opulent, majestueux. Un parfum qui habille comme un bijou et marque les mémoires.",
        story: "Inspiré des encensoirs des palais omanais et des bazars de Bagdad, Ambre Royale est une ode à la générosité des grandes civilisations orientales et à leurs traditions parfumées.",
        family: 'oriental',
        notes: {
          top: ['Safran', 'Rose de Damas', 'Cardamome'],
          heart: ['Ambre gris', 'Encens', 'Myrrhe'],
          base: ['Oud', 'Musc oriental', 'Résine de benjoin'],
        },
        images: ['/images/ambre-royale-oriental-ambre.png'],
        sizes: [
          { ml: 30, price: 195, stock: 14 },
          { ml: 50, price: 265, stock: 9 },
          { ml: 100, price: 415, stock: 5 },
        ],
        status: 'Exclusif',
        isFeatured: true,
      },
    ];

    await Perfume.insertMany([...seedData, ...newPerfumes]);
    res.json({ message: `${seedData.length + newPerfumes.length} flacons ont été scellés dans les archives de la Maison.` });
  } catch (error) {
    res.status(500).json({ message: 'Erreur de création.', error: error.message });
  }
});

module.exports = app;
