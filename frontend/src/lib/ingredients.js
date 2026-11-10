/**
 * ═══════════════════════════════════════════════════════════════
 *  LE JEU DU SWIPE OLFACTIF — matières premières & ambiances
 * ═══════════════════════════════════════════════════════════════
 *  Chaque carte porte un vecteur de poids vers les 6 familles du modèle
 *  Perfume. Un swipe à droite ajoute le vecteur, à gauche le soustrait
 *  à demi-poids (un rejet informe moins qu'une adhésion).
 *
 *  Les poids sont volontairement non normalisés : une matière franche
 *  comme l'oud doit peser plus lourd qu'une bergamote consensuelle.
 *
 *  `axis` sert au profil de caractère affiché dans le résultat :
 *    intensity  0 → discret, 1 → signature affirmée
 *    warmth     0 → glacé, 1 → brûlant
 *    daylight   0 → créature du soir, 1 → plein jour
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * @typedef {Object} Card
 * @property {string} id
 * @property {string} name      Nom de la matière, en capitales dans l'UI
 * @property {string} origin    Provenance : l'ancrage documentaire du luxe
 * @property {'matière'|'ambiance'} kind
 * @property {string} prose     Une ligne sensorielle, pas une fiche technique
 * @property {Record<string, number>} w  Vecteur familles
 * @property {{intensity:number, warmth:number, daylight:number}} axis
 */

/** @type {Card[]} */
export const CARDS = [
  {
    id: 'oud',
    name: 'Bois de Oud',
    origin: 'Assam, Inde',
    kind: 'matière',
    prose: "Une fumée animale et sacrée, qui s'accroche à la peau des heures durant.",
    w: { boisé: 3.0, oriental: 2.2, musqué: 0.8, frais: -1.4, floral: -0.6 },
    axis: { intensity: 0.98, warmth: 0.85, daylight: 0.12 },
  },
  {
    id: 'bergamote',
    name: 'Bergamote de Calabre',
    origin: 'Reggio de Calabre, Italie',
    kind: 'matière',
    prose: "L'écorce éclate, acidulée et verte. Une aube au bord de la Méditerranée.",
    w: { frais: 3.0, aromatique: 1.2, floral: 0.4, oriental: -0.8 },
    axis: { intensity: 0.3, warmth: 0.15, daylight: 0.95 },
  },
  {
    id: 'vanille',
    name: 'Vanille Bourbon',
    origin: 'Sava, Madagascar',
    kind: 'matière',
    prose: 'Une gousse grasse et fumée, douce sans jamais devenir sucrerie.',
    w: { oriental: 2.8, musqué: 1.1, boisé: 0.6, frais: -1.2 },
    axis: { intensity: 0.72, warmth: 0.95, daylight: 0.3 },
  },
  {
    id: 'rose-taif',
    name: 'Rose de Taïf',
    origin: 'Montagnes du Hedjaz',
    kind: 'matière',
    prose: 'Cueillie avant le jour. Miellée, épicée, une rose qui a du sang.',
    w: { floral: 3.2, oriental: 1.0, musqué: 0.5, aromatique: -0.4 },
    axis: { intensity: 0.68, warmth: 0.6, daylight: 0.55 },
  },
  {
    id: 'iris',
    name: 'Beurre d’Iris Pallida',
    origin: 'Toscane, Italie',
    kind: 'matière',
    prose: 'Trois ans de patience sous terre pour une poudre froide et aristocratique.',
    w: { floral: 2.2, musqué: 2.0, boisé: 0.8, oriental: -0.3 },
    axis: { intensity: 0.5, warmth: 0.3, daylight: 0.5 },
  },
  {
    id: 'vetiver',
    name: 'Vétiver de Haïti',
    origin: 'Les Cayes, Haïti',
    kind: 'matière',
    prose: 'La racine, pas la fleur. Terre humide, pamplemousse et fumée sèche.',
    w: { boisé: 2.6, aromatique: 1.4, frais: 0.6, floral: -0.8 },
    axis: { intensity: 0.7, warmth: 0.4, daylight: 0.6 },
  },
  {
    id: 'ambre-gris',
    name: 'Ambre Gris',
    origin: 'Côtes atlantiques',
    kind: 'matière',
    prose: 'Minéral, salé, presque vivant. Il ne sent rien et transforme tout.',
    w: { oriental: 2.4, musqué: 2.2, boisé: 0.7, frais: 0.5 },
    axis: { intensity: 0.8, warmth: 0.7, daylight: 0.35 },
  },
  {
    id: 'neroli',
    name: 'Néroli du Maghreb',
    origin: 'Nabeul, Tunisie',
    kind: 'matière',
    prose: "Fleur d'oranger distillée à l'eau. Blanche, miellée, vertigineuse.",
    w: { floral: 2.4, frais: 1.8, aromatique: 0.6 },
    axis: { intensity: 0.45, warmth: 0.45, daylight: 0.9 },
  },
  {
    id: 'lavande',
    name: 'Lavande de Haute-Provence',
    origin: 'Plateau de Valensole',
    kind: 'matière',
    prose: 'Camphrée, nette, un peu austère. Le linge frais et la pierre chaude.',
    w: { aromatique: 3.0, frais: 1.2, boisé: 0.5, oriental: -0.6 },
    axis: { intensity: 0.42, warmth: 0.38, daylight: 0.8 },
  },
  {
    id: 'cuir',
    name: 'Cuir Suédé',
    origin: 'Tannerie de Grasse',
    kind: 'matière',
    prose: "Un gant retourné, du bouleau fumé, l'intérieur d'une voiture ancienne.",
    w: { boisé: 2.0, musqué: 1.8, oriental: 1.2, frais: -1.5 },
    axis: { intensity: 0.9, warmth: 0.65, daylight: 0.2 },
  },
  {
    id: 'figue',
    name: 'Feuille de Figuier',
    origin: 'Côte dalmate',
    kind: 'matière',
    prose: 'Lactée et verte à la fois. Un verger à midi, à l’ombre.',
    w: { frais: 2.2, aromatique: 1.6, floral: 0.4 },
    axis: { intensity: 0.38, warmth: 0.35, daylight: 0.88 },
  },
  {
    id: 'encens',
    name: 'Oliban d’Oman',
    origin: 'Dhofar, Oman',
    kind: 'matière',
    prose: 'La résine qui pleure du tronc. Froide, citronnée, liturgique.',
    w: { oriental: 2.6, boisé: 1.4, frais: 0.8, musqué: 0.4 },
    axis: { intensity: 0.75, warmth: 0.55, daylight: 0.4 },
  },
  /* ── Ambiances : on ne swipe plus une matière, mais un souvenir ── */
  {
    id: 'amb-orage',
    name: 'L’orage qui arrive',
    origin: 'Ambiance',
    kind: 'ambiance',
    prose: "L'air se charge, la poussière monte du sol, rien n'est encore tombé.",
    w: { aromatique: 1.6, frais: 1.8, boisé: 1.0, musqué: 0.6 },
    axis: { intensity: 0.6, warmth: 0.35, daylight: 0.5 },
  },
  {
    id: 'amb-velours',
    name: 'Un théâtre vide',
    origin: 'Ambiance',
    kind: 'ambiance',
    prose: 'Velours rouge, poussière chaude, bois verni et parfum d’hier soir.',
    w: { musqué: 2.0, oriental: 1.8, boisé: 1.2, frais: -1.0 },
    axis: { intensity: 0.78, warmth: 0.75, daylight: 0.15 },
  },
  {
    id: 'amb-lin',
    name: 'Du linge au soleil',
    origin: 'Ambiance',
    kind: 'ambiance',
    prose: 'Coton sec, savon, un vent tiède. La propreté comme un luxe.',
    w: { musqué: 2.2, frais: 1.6, floral: 0.8, oriental: -0.8 },
    axis: { intensity: 0.28, warmth: 0.5, daylight: 0.92 },
  },
  {
    id: 'amb-nuit',
    name: 'Abidjan, 2 h du matin',
    origin: 'Ambiance',
    kind: 'ambiance',
    prose: 'Chaleur qui ne retombe pas, fleurs lourdes, bitume et lagune.',
    w: { oriental: 2.0, floral: 1.6, musqué: 1.2, frais: -0.6 },
    axis: { intensity: 0.85, warmth: 0.9, daylight: 0.08 },
  },
];

/** Deck de la session : ordre fixe par défaut, mélangé si `shuffle`. */
export function buildDeck({ shuffle = true, size = 12 } = {}) {
  const pool = [...CARDS];
  if (shuffle) {
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
  }
  // On garantit au moins 3 ambiances dans le deck : elles font respirer le jeu.
  const amb = pool.filter((c) => c.kind === 'ambiance').slice(0, 3);
  const mat = pool.filter((c) => c.kind === 'matière').slice(0, Math.max(size - amb.length, 1));
  const deck = [...mat];
  // Insertion des ambiances en positions 3, 7, 11 : rythme de la session.
  amb.forEach((c, i) => deck.splice(Math.min(3 + i * 4, deck.length), 0, c));
  return deck.slice(0, size);
}
