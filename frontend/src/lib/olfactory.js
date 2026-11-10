/**
 * ═══════════════════════════════════════════════════════════════
 *  DESIGN TOKENS OLFACTIFS — source unique de vérité
 * ═══════════════════════════════════════════════════════════════
 *  Chaque famille olfactive pilote l'ambiance de l'interface.
 *  Rien n'est hardcodé ailleurs : composants, WebGL et CSS lisent ici.
 *
 *  Contrat de couleur (audité) :
 *    · accent      → DÉCORATIF uniquement (filets, lueurs, particules,
 *                    barres, bordures). Ratio ~2.5-3:1 sur le cream.
 *    · accentInk   → TEXTE sur surface claire. ≥ 7:1 → WCAG 2.2 AAA.
 *    · accentGlow  → TEXTE + accents sur surface encre. ≥ 7:1 → AAA.
 *  Utiliser `accent` pour du texte casse l'accessibilité : ne pas faire.
 * ═══════════════════════════════════════════════════════════════
 */

/** Surfaces du thème Bob's — inchangées. */
export const SURFACE = {
  cream: '#faf9f8',
  creamWarm: '#fdfbf7',
  ink: '#0a0a0a',
  inkSoft: '#1a1a1a',
  border: '#ebd5c1',
};

/**
 * Les 6 familles du modèle Perfume (api/models/Perfume.js).
 * `pyramid` = couleur des 3 strates de particules (tête / cœur / fond).
 * `weight`  = densité visuelle de la scène (0 → aérien, 1 → dense).
 */
export const FAMILIES = {
  floral: {
    key: 'floral',
    label: 'Floral',
    accent: '#c687a3',
    accentInk: '#833e5d',
    accentGlow: '#e8b5ce',
    pyramid: ['#f2d8e4', '#c687a3', '#8d5570'],
    weight: 0.45,
    lumen: 0.92,
    signature: 'Poudré, lumineux, féminin',
  },
  boisé: {
    key: 'boisé',
    label: 'Boisé',
    accent: '#b38b59',
    accentInk: '#6b5131',
    accentGlow: '#e0b97a',
    pyramid: ['#e8d2b0', '#b38b59', '#6b4f2e'],
    weight: 0.78,
    lumen: 0.74,
    signature: 'Sec, noble, structurant',
  },
  oriental: {
    key: 'oriental',
    label: 'Oriental',
    accent: '#c4944a',
    accentInk: '#6d5222',
    accentGlow: '#e8c27a',
    pyramid: ['#f0d9a8', '#c4944a', '#7a5520'],
    weight: 0.88,
    lumen: 0.68,
    signature: 'Ambré, résineux, enveloppant',
  },
  frais: {
    key: 'frais',
    label: 'Frais',
    accent: '#6aabb0',
    accentInk: '#325c5f',
    accentGlow: '#a8dade',
    pyramid: ['#d4f0f2', '#6aabb0', '#2f5e62'],
    weight: 0.28,
    lumen: 1.0,
    signature: 'Hespéridé, cristallin, vif',
  },
  musqué: {
    key: 'musqué',
    label: 'Musqué',
    accent: '#9b8ea8',
    accentInk: '#5d5169',
    accentGlow: '#cfc3dc',
    pyramid: ['#e4dcec', '#9b8ea8', '#5d5169'],
    weight: 0.62,
    lumen: 0.8,
    signature: 'Velouté, intime, cotonneux',
  },
  aromatique: {
    key: 'aromatique',
    label: 'Aromatique',
    accent: '#7a8c6e',
    accentInk: '#3f4b37',
    accentGlow: '#b9cbab',
    pyramid: ['#dcead2', '#7a8c6e', '#404d36'],
    weight: 0.52,
    lumen: 0.86,
    signature: 'Herbacé, lavandé, tonique',
  },
};

/** Famille neutre : avant tout choix, ou famille inconnue venue de l'API. */
export const NEUTRAL = {
  key: 'neutral',
  label: 'Signature',
  accent: '#c687a3',
  accentInk: '#833e5d',
  accentGlow: '#e8b5ce',
  pyramid: ['#efe4da', '#c9b6a4', '#8a7a6b'],
  weight: 0.5,
  lumen: 0.9,
  signature: 'À révéler',
};

export const FAMILY_KEYS = Object.keys(FAMILIES);

/** Accès tolérant : jamais d'undefined qui casserait un rendu. */
export function family(key) {
  if (!key) return NEUTRAL;
  return FAMILIES[key] || FAMILIES[String(key).toLowerCase()] || NEUTRAL;
}

/**
 * Traduit une famille en variables CSS.
 * Appliqué sur un conteneur (scope local) ou sur <html> (ambiance globale).
 */
export function familyVars(key) {
  const f = family(key);
  return {
    '--accent': f.accent,
    '--accent-ink': f.accentInk,
    '--accent-glow': f.accentGlow,
    '--note-top': f.pyramid[0],
    '--note-heart': f.pyramid[1],
    '--note-base': f.pyramid[2],
    '--olf-weight': String(f.weight),
    '--olf-lumen': String(f.lumen),
  };
}

/* ═══════════════════════════════════════════════════════════════
   ÉCHELLE TYPOGRAPHIQUE — nombre d'or
   ═══════════════════════════════════════════════════════════════
   φ = 1.618 pur entre les paliers d'affichage (display).
   Pour le texte courant, φ seul saute de 13px à 21px à 34px : illisible
   en UI. On interpole avec √φ = 1.272 — strictement dérivé de φ, donc
   l'échelle reste harmonique sans trous.
   ═══════════════════════════════════════════════════════════════ */
export const PHI = 1.618;
export const PHI_HALF = Math.sqrt(PHI); // 1.272

/** Base 16px, exprimée en rem. */
export function phiScale(base = 1) {
  const s = (n) => +(base * Math.pow(PHI_HALF, n)).toFixed(4);
  return {
    '--step--2': `${s(-2)}rem`, // 0.618  → 9.9px  micro-capitales
    '--step--1': `${s(-1)}rem`, // 0.786  → 12.6px légendes
    '--step-0': `${s(0)}rem`, //  1.000  → 16px   corps
    '--step-1': `${s(1)}rem`, //  1.272  → 20.4px intertitre
    '--step-2': `${s(2)}rem`, //  1.618  → 25.9px h3  (= φ exact)
    '--step-3': `${s(3)}rem`, //  2.058  → 32.9px h2
    '--step-4': `${s(4)}rem`, //  2.618  → 41.9px h1  (= φ² exact)
    '--step-5': `${s(5)}rem`, //  3.330  → 53.3px display
    '--step-6': `${s(6)}rem`, //  4.236  → 67.8px hero (= φ³ exact)
  };
}
