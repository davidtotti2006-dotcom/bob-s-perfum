/**
 * ═══════════════════════════════════════════════════════════════
 *  MATCH ENGINE — du swipe au pourcentage de compatibilité
 * ═══════════════════════════════════════════════════════════════
 *  Pur, synchrone, sans dépendance React : testable et réutilisable
 *  côté serveur si tu veux un jour pré-calculer des recommandations.
 *
 *  1. accumulate()  — les swipes deviennent un profil (vecteur familles + axes)
 *  2. scorePerfume()— similarité cosinus profil × parfum, pondérée
 *  3. rank()        — classe le catalogue et rend un pourcentage honnête
 *
 *  Pourquoi cosinus : l'utilisateur qui swipe 12 cartes et celui qui en
 *  swipe 4 doivent obtenir des pourcentages comparables. Le cosinus ignore
 *  la magnitude du profil et ne compare que sa DIRECTION.
 * ═══════════════════════════════════════════════════════════════
 */

import { FAMILY_KEYS } from './olfactory.js';

/** Un swipe à gauche informe moins qu'un swipe à droite. */
const LEFT_WEIGHT = 0.5;

/** @typedef {{ card: import('./ingredients').Card, dir: 'right'|'left' }} Swipe */

/**
 * Transforme la suite de swipes en profil olfactif.
 * @param {Swipe[]} swipes
 */
export function accumulate(swipes) {
  const vector = Object.fromEntries(FAMILY_KEYS.map((k) => [k, 0]));
  const axis = { intensity: 0, warmth: 0, daylight: 0 };
  let axisWeight = 0;

  for (const { card, dir } of swipes) {
    const sign = dir === 'right' ? 1 : -LEFT_WEIGHT;
    for (const [fam, w] of Object.entries(card.w)) {
      if (fam in vector) vector[fam] += w * sign;
    }
    // Seules les adhésions construisent le caractère : on n'est pas défini
    // par ce qu'on rejette.
    if (dir === 'right') {
      axis.intensity += card.axis.intensity;
      axis.warmth += card.axis.warmth;
      axis.daylight += card.axis.daylight;
      axisWeight += 1;
    }
  }

  if (axisWeight > 0) {
    axis.intensity /= axisWeight;
    axis.warmth /= axisWeight;
    axis.daylight /= axisWeight;
  } else {
    // Tout rejeté : profil médian plutôt qu'un résultat absurde.
    axis.intensity = 0.5;
    axis.warmth = 0.5;
    axis.daylight = 0.5;
  }

  const ranked = FAMILY_KEYS
    .map((k) => ({ key: k, score: vector[k] }))
    .sort((a, b) => b.score - a.score);

  /**
   * Seuil de signification. Une adhésion franche pèse 2 à 3 points ; un
   * score de +0.1 n'est que le résidu arithmétique de quelques rejets.
   * Sous ce seuil on ne prétend pas avoir trouvé une famille dominante.
   */
  const SIGNIFICANT = 1.2;
  const top = ranked[0]?.score ?? 0;
  const conclusive = top >= SIGNIFICANT;

  return {
    vector,
    axis,
    /** Famille dominante : pilote l'ambiance de l'UI en temps réel. */
    dominant: conclusive ? ranked[0].key : 'neutral',
    runnerUp: ranked[1]?.score >= SIGNIFICANT ? ranked[1].key : null,
    /** false → le profil ne permet aucune recommandation honnête. */
    conclusive,
    ranked,
    answered: swipes.length,
    liked: swipes.filter((s) => s.dir === 'right').length,
  };
}

/** Vecteur one-hot de la famille d'un parfum, enrichi par ses notes. */
function perfumeVector(perfume) {
  const v = Object.fromEntries(FAMILY_KEYS.map((k) => [k, 0]));
  if (perfume.family && perfume.family in v) v[perfume.family] = 3;

  // Les notes affinent : un boisé à la bergamote n'est pas un boisé sec.
  const notes = [
    ...(perfume.notes?.top || []),
    ...(perfume.notes?.heart || []),
    ...(perfume.notes?.base || []),
  ]
    .join(' ')
    .toLowerCase();

  const HINTS = {
    floral: ['rose', 'jasmin', 'fleur', 'iris', 'violette', 'tubéreuse', 'néroli', 'pivoine'],
    boisé: ['bois', 'cèdre', 'santal', 'vétiver', 'oud', 'patchouli', 'cuir'],
    oriental: ['ambre', 'vanille', 'encens', 'benjoin', 'myrrhe', 'tonka', 'épice', 'cannelle'],
    frais: ['agrume', 'bergamote', 'citron', 'marin', 'menthe', 'pamplemousse', 'aqua', 'figue'],
    musqué: ['musc', 'ambrette', 'poudré', 'coton', 'peau'],
    aromatique: ['lavande', 'romarin', 'sauge', 'basilic', 'thym', 'herbe'],
  };

  for (const [fam, words] of Object.entries(HINTS)) {
    for (const w of words) if (notes.includes(w)) v[fam] += 0.7;
  }
  return v;
}

/**
 * Cosinus SIGNÉ, dans [-1, 1].
 *
 * Écrêter les composantes négatives du profil (première version) était un
 * bug : un visiteur qui rejette l'oud se voyait proposer un oud à 97 %,
 * puisque le -1.8 en « boisé » était simplement ignoré. Le rejet doit
 * pénaliser, pas être neutre. On garde donc le produit scalaire complet.
 */
function cosine(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const k of FAMILY_KEYS) {
    const av = a[k] || 0;
    const bv = b[k] || 0;
    dot += av * bv;
    na += av * av;
    nb += bv * bv;
  }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/**
 * Score 0 → 1 d'un parfum pour un profil.
 * @param {ReturnType<typeof accumulate>} profile
 */
export function scorePerfume(profile, perfume) {
  // Signé : un parfum opposé au goût exprimé tombe à 0, pas à « moyen ».
  const sim = cosine(profile.vector, perfumeVector(perfume));

  // Confiance : un profil bâti sur 2 swipes n'est pas un profil.
  const confidence = Math.min(profile.answered / 8, 1);

  // Léger appui éditorial : la maison assume ses choix.
  const editorial = perfume.isFeatured ? 0.03 : 0;

  return Math.max(0, Math.min(1, Math.max(sim, 0) * (0.72 + 0.28 * confidence) + editorial));
}

/**
 * Classe un catalogue et rend un pourcentage AFFICHABLE et ABSOLU.
 *
 * La première version normalisait sur le meilleur score (`raw / top`), ce qui
 * affichait mécaniquement 97 % en tête — même pour un profil contradictoire
 * dont le meilleur score réel valait 0.04. Le pourcentage est désormais ancré
 * sur la valeur absolue : un profil faible donne des chiffres faibles.
 *
 * @param {ReturnType<typeof accumulate>} profile
 * @param {Array} perfumes
 */
export function rank(profile, perfumes = []) {
  // Contrat : pas de recommandation sans profil exploitable. Mieux vaut dire
  // « nous n'avons pas assez compris » que de classer au hasard — sur un
  // profil contradictoire, seul le bonus éditorial décidait du gagnant.
  if (!profile?.conclusive) return [];

  const scored = perfumes
    .map((p) => ({ perfume: p, raw: scorePerfume(profile, p) }))
    .sort((a, b) => b.raw - a.raw);

  if (!scored.length) return [];

  return scored.map((s, i) => ({
    ...s,
    // 60 % plancher (on n'humilie pas le client), 97 % plafond (un 100 %
    // ne serait pas crédible pour un parfum). Entre les deux : la vérité.
    match: Math.max(60, Math.min(97, Math.round(60 + s.raw * 37))),
    rank: i + 1,
  }));
}

/** Phrase de caractère dérivée des axes. Pas de hasard : table déterministe. */
export function describeAxis(axis) {
  const t = (v, lo, mid, hi) => (v < 0.4 ? lo : v < 0.7 ? mid : hi);
  return {
    intensity: t(axis.intensity, 'Discrète', 'Assumée', 'Magistrale'),
    warmth: t(axis.warmth, 'Glacée', 'Tempérée', 'Brûlante'),
    daylight: t(axis.daylight, 'Créature du soir', 'Sans heure', 'Pleine lumière'),
  };
}
