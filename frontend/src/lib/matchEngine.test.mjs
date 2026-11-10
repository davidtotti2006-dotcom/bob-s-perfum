/**
 * ═══════════════════════════════════════════════════════════════
 *  TESTS DU MOTEUR OLFACTIF — `npm test`
 * ═══════════════════════════════════════════════════════════════
 *  Exécuteur natif de Node (node:test), aucune dépendance ajoutée.
 *
 *  Ces tests ont déjà rattrapé deux bugs réels :
 *    1. les rejets étaient écrêtés à 0 dans le cosinus → un visiteur qui
 *       rejetait l'oud se voyait proposer un oud en tête ;
 *    2. le pourcentage était normalisé sur le meilleur score → il affichait
 *       mécaniquement 97 % même pour un profil vide de sens.
 *  Garder ce fichier vert avant tout déploiement.
 * ═══════════════════════════════════════════════════════════════
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { CARDS, buildDeck } from './ingredients.js';
import { accumulate, rank, describeAxis } from './matchEngine.js';

const CATALOGUE = [
  {
    _id: '1', name: 'Bois Sauvage', slug: 'bois-sauvage', family: 'boisé', isFeatured: true,
    notes: { top: ['Bergamote'], heart: ['Cèdre'], base: ['Oud', 'Vétiver'] },
  },
  {
    _id: '2', name: 'Rose Éternelle', slug: 'rose-eternelle', family: 'floral',
    notes: { top: ['Litchi'], heart: ['Rose'], base: ['Musc'] },
  },
  {
    _id: '3', name: 'Océan Azur', slug: 'ocean-azur', family: 'frais',
    notes: { top: ['Bergamote', 'Citron'], heart: ['Marin'], base: ['Ambre gris'] },
  },
  {
    _id: '4', name: 'Ambre Royale', slug: 'ambre-royale', family: 'oriental',
    notes: { top: ['Épices'], heart: ['Encens'], base: ['Vanille', 'Ambre'] },
  },
];

const card = (id) => {
  const c = CARDS.find((x) => x.id === id);
  if (!c) throw new Error(`carte inconnue dans le test : ${id}`);
  return c;
};

const profileOf = (rightIds, leftIds = []) =>
  accumulate([
    ...rightIds.map((id) => ({ card: card(id), dir: 'right' })),
    ...leftIds.map((id) => ({ card: card(id), dir: 'left' })),
  ]);

/* ─────────── Profil ─────────── */

test('un profil boisé désigne la famille boisé', () => {
  const p = profileOf(['oud', 'vetiver', 'cuir'], ['bergamote', 'neroli']);
  assert.equal(p.dominant, 'boisé');
  assert.equal(p.conclusive, true);
});

test('un profil hespéridé désigne la famille frais', () => {
  const p = profileOf(['bergamote', 'neroli', 'figue'], ['oud', 'cuir']);
  assert.equal(p.dominant, 'frais');
});

test('un profil ambré désigne la famille oriental', () => {
  const p = profileOf(['vanille', 'ambre-gris', 'encens', 'amb-nuit'], ['lavande']);
  assert.equal(p.dominant, 'oriental');
});

test('tout rejeter ne produit pas de famille dominante', () => {
  const p = profileOf([], ['oud', 'bergamote', 'vanille']);
  assert.equal(p.dominant, 'neutral');
  assert.equal(p.conclusive, false);
});

test('un profil vide ne jette pas et reste médian', () => {
  const p = accumulate([]);
  assert.equal(p.dominant, 'neutral');
  assert.equal(p.axis.intensity, 0.5);
  assert.deepEqual(Object.keys(describeAxis(p.axis)), ['intensity', 'warmth', 'daylight']);
});

/* ─────────── Classement ─────────── */

test('le parfum de la famille dominante arrive en tête', () => {
  const p = profileOf(['oud', 'vetiver', 'cuir'], ['bergamote']);
  const r = rank(p, CATALOGUE);
  assert.equal(r[0].perfume.family, 'boisé');
});

test('un profil non concluant ne rend AUCUNE recommandation', () => {
  // Régression : le bonus éditorial seul désignait un gagnant arbitraire.
  const p = profileOf([], ['oud', 'bergamote', 'vanille']);
  assert.deepEqual(rank(p, CATALOGUE), []);
});

test('rejeter une matière interdit de la recommander en tête', () => {
  // Régression du cosinus écrêté : l'oud rejeté ressortait à 97 %.
  const p = profileOf(['bergamote', 'neroli', 'figue'], ['oud', 'cuir', 'vetiver']);
  const r = rank(p, CATALOGUE);
  assert.notEqual(r[0].perfume.family, 'boisé');
  const woody = r.find((x) => x.perfume.family === 'boisé');
  assert.ok(woody.match < r[0].match, 'le boisé rejeté doit scorer sous la tête de liste');
});

test('les pourcentages restent entre 60 et 97', () => {
  const p = profileOf(['oud', 'vetiver', 'cuir', 'encens']);
  for (const x of rank(p, CATALOGUE)) {
    assert.ok(x.match >= 60 && x.match <= 97, `hors bornes : ${x.match}`);
  }
});

test('le classement est décroissant', () => {
  const p = profileOf(['vanille', 'ambre-gris', 'encens']);
  const r = rank(p, CATALOGUE);
  for (let i = 1; i < r.length; i++) {
    assert.ok(r[i].raw <= r[i - 1].raw, 'ordre rompu');
  }
});

test('un catalogue vide rend une liste vide', () => {
  const p = profileOf(['oud', 'vetiver', 'cuir']);
  assert.deepEqual(rank(p, []), []);
  assert.deepEqual(rank(p, undefined), []);
});

/* ─────────── Deck ─────────── */

test('le deck a la bonne taille, sans doublon, avec des ambiances', () => {
  for (let i = 0; i < 40; i++) {
    const deck = buildDeck({ size: 12 });
    assert.equal(deck.length, 12);
    assert.equal(new Set(deck.map((c) => c.id)).size, 12, 'doublon détecté');
    assert.ok(
      deck.filter((c) => c.kind === 'ambiance').length >= 2,
      'moins de 2 ambiances dans le deck'
    );
  }
});

test('chaque carte porte un vecteur et des axes valides', () => {
  for (const c of CARDS) {
    assert.ok(Object.keys(c.w).length > 0, `${c.id} : vecteur vide`);
    for (const v of Object.values(c.axis)) {
      assert.ok(v >= 0 && v <= 1, `${c.id} : axe hors [0,1]`);
    }
  }
});
