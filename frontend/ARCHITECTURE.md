# Bob's Paris — Architecture de l'expérience olfactive

Spécification technique de la couche immersive ajoutée au front Next.js.
Public : développeurs intervenant sur ce dépôt.

---

## 1. Principe directeur

Le thème de la maison est **clair** : cream `#faf9f8`, encre `#1a1a1a`, rose
`#c687a3`, or `#b38b59`, Cormorant Garamond + Montserrat. Il n'a pas changé.

La demande initiale appelait un *dark mode par défaut*. Il a été écarté : il
aurait remplacé l'identité existante au lieu de la servir. Arbitrage retenu :

| Surface | Où | Rôle |
|---|---|---|
| `cream` | boutique, collection, fiches, tunnel | **le site**, inchangé |
| `ink` `#0a0a0a` | `/signature` uniquement | la salle d'essai, scène immersive |

L'encre était déjà dans tes tokens (`--color-dark`). On l'utilise comme une
scénographie, pas comme un thème.

---

## 2. Carte des fichiers

```
src/
├── lib/
│   ├── olfactory.js          ★ SOURCE UNIQUE — familles, couleurs, échelle φ
│   ├── ingredients.js          16 matières premières + ambiances, vectorisées
│   ├── matchEngine.js          profil → classement (pur, testé)
│   ├── matchEngine.test.mjs    13 tests — `npm test`
│   ├── swipeMachine.js         FSM du parcours de swipe
│   └── money.js                devise + seuil de livraison
│
├── hooks/
│   └── useMediaQuery.js        useSyncExternalStore : reduced-motion, pointer
│
├── components/
│   ├── webgl/
│   │   ├── NoteParticles.jsx   3 strates GLSL = pyramide olfactive
│   │   └── OlfactoryStage.jsx  wrapper : lazy, fallback peint, vignettage
│   ├── match/
│   │   ├── SwipeCard.jsx       carte verre givré, transform hors React
│   │   ├── SwipeDeck.jsx       orchestrateur FSM + profil live
│   │   └── MatchResult.jsx     verdict, anneau d'affinité, échantillon offert
│   ├── cart/
│   │   └── SampleSelector.jsx  coffret découverte offert
│   └── ui/
│       └── CustomCursor.jsx    curseur magnétique + lecture de notes
│
└── app/
    ├── signature/page.js       /signature — l'épreuve olfactive
    ├── commande/page.js        /commande — tunnel FSM 4 étapes
    ├── collection/page.js      refonte à iso-thème : filtres, tri, AAA
    └── globals.css             tokens φ, variantes AAA, utilitaires GPU
```

★ = tout part d'ici. Aucune couleur de famille n'est écrite ailleurs.

---

## 3. Design tokens olfactifs — zéro hardcoding

### 3.1 Le contrat de couleur

`src/lib/olfactory.js` définit 6 familles, alignées sur l'enum du modèle
Mongoose (`api/models/Perfume.js`). Chacune porte **trois** valeurs de couleur,
et la distinction est contraignante :

| Token | Usage | Contraste sur cream |
|---|---|---|
| `accent` | **décor seul** : filets, lueurs, particules, bordures | ~2.5–3:1 |
| `accentInk` | **tout texte** sur surface claire | **≥ 7:1 — AAA** |
| `accentGlow` | texte et accents sur surface encre | **≥ 7:1 — AAA** |

> **Pourquoi.** Audit de la palette d'origine utilisée en texte sur `#faf9f8` :
> rose **2.70:1**, or **2.96:1**, teal **2.48:1**, purple **2.92:1**,
> `text-gray-400` **2.41:1**. Toutes échouaient, y compris au niveau AA (4.5:1).
> La page collection affichait ses notes de cœur en rose 9 px : illisible en
> plein jour. Les teintes sont **conservées** pour le décor ; les variantes
> `accentInk` reprennent la même teinte, assombrie jusqu'à franchir 7:1.
> Sur l'encre, aucun changement n'était nécessaire : `rose-light` est à 9.89:1.

`familyVars(key)` traduit une famille en variables CSS. Posées sur un
conteneur, elles scopent l'ambiance ; posées sur `<html>`, elles la rendent
globale. Chaque carte de la collection scope les siennes — survoler un boisé
change **sa** lumière, sans repeindre la grille.

### 3.2 Échelle typographique

`--step--2` … `--step-6`, exposées aussi en classes `.t--2` … `.t-6`.

Les paliers d'affichage sont en **φ pur** (1.618) : `step-2` = φ, `step-4` = φ²,
`step-6` = φ³. Les paliers intermédiaires utilisent **√φ** (1.272), strictement
dérivé de φ. Raison : φ seul saute de 16 px à 26 px à 42 px — inutilisable pour
du texte courant. L'échelle reste harmonique, sans trou.

`.measure` fixe l'interlignage du corps à φ et la largeur à 38 caractères.

---

## 4. Scène WebGL — la pyramide olfactive

`NoteParticles.jsx` rend **trois strates**, une par étage de la pyramide. Elles
ne diffèrent pas que par la couleur : leur physique traduit la volatilité réelle.

| Strate | Points | Taille | Mouvement | Lecture |
|---|---|---|---|---|
| Tête | 420 | 2.2 | monte vite, s'évapore | volatilité haute |
| Cœur | 300 | 4.0 | orbite, persiste | tenue |
| Fond | 180 | 7.5 | **sédimente** (`rise` < 0) | fixateur |

Budget : **1 draw call par strate** (`THREE.Points`), shader maison, **aucune
texture** — le disque à bord doux est un gradient radial analytique dans le
fragment shader.

Garde-fous, tous dans le composant :

- `dynamic(ssr:false)` + `requestIdleCallback` → Three.js hors du bundle
  initial, chargé après l'hydratation. Vérifié : le chunk de 474 Ko n'est
  **pas** référencé par `/collection`.
- `prefers-reduced-motion` → le canvas n'est **jamais monté**.
- `try/catch` sur `WebGLRenderer` → sans WebGL, on ne monte rien.
- `IntersectionObserver` + `visibilitychange` → la boucle rAF s'arrête hors
  écran et onglet caché.
- `devicePixelRatio` plafonné à **1.75**.
- `Math.min(getDelta(), 0.05)` → pas de saut après un onglet en veille.
- Changer de famille **ne remonte pas la scène** : seuls les uniforms de
  couleur transitent.

`OlfactoryStage.jsx` empile 5 couches : dégradé peint (le fallback, toujours
là), canvas, grain SVG anti-banding, vignettage, contenu. **Sans JS, sans
WebGL, ou pendant le chargement, la scène reste belle** — c'est le dégradé
qu'on voit, pas un trou noir.

---

## 5. Swipe olfactif

### 5.1 FSM — `src/lib/swipeMachine.js`

```
intro ─START─▶ idle ─DRAG_START─▶ dragging ─DRAG_END─▶ committing
                 ▲                    │ (sous seuil)        │ SETTLED
                 └────────────────────┘                     │
                 └───────────── deck restant ◀──────────────┤
                                                 deck vide ─┴─▶ revealing ─▶ result
```

Seuil de validation : **110 px** de distance **ou 0.55 px/ms** de vélocité — un
swipe court mais sec est validé comme un long geste.

> **Pourquoi une FSM et pas des booléens.** Pendant `committing`, la carte
> s'envole en 440 ms. Sans état explicite, un second geste pendant l'animation
> consomme deux cartes et désynchronise le compteur. Ici `DRAG_START` est
> ignoré partout sauf en `idle` : le verrou est structurel.

### 5.2 Performance du geste — `SwipeCard.jsx`

**Pendant le drag, aucun rendu React.** Le `pointermove` écrit directement dans
`element.style.transform` :

```js
translate3d(dx, dy*0.35, 0) rotateZ(clamp(dx*0.06, ±14°))
```

Les verdicts « J'aime » / « Passer » apparaissent en **opacité pure** — jamais
de propriété déclenchant un layout. `will-change` est posé au `pointerdown` et
retiré au relâchement : le laisser en permanence réserverait une couche GPU
pour rien.

La sortie de scène utilise un **double `requestAnimationFrame`** pour garantir
que la transition part de la position courante au lieu d'être avalée par le
frame du changement de style.

Clavier : `←` / `→` suivent exactement le même chemin que le geste
(action `CHOOSE`), plus deux boutons visibles. Le jeu est intégralement
praticable sans souris.

### 5.3 Moteur — `src/lib/matchEngine.js`

`accumulate(swipes)` → profil ; `rank(profile, catalogue)` → classement.
Pur, synchrone, sans React : réutilisable côté serveur.

- **Cosinus signé.** Un swipe à gauche pèse la moitié d'un swipe à droite
  (`LEFT_WEIGHT = 0.5`) : un rejet informe moins qu'une adhésion.
- **Vecteur produit enrichi par les notes.** Un boisé à la bergamote n'est pas
  un boisé sec : les notes de la pyramide ajoutent 0.7 par correspondance.
- **Seuil de signification** (`1.2`). Sous ce score, pas de famille dominante :
  `conclusive = false`, et `rank()` rend **une liste vide**. Mieux vaut dire
  « nous n'avons pas assez compris » que classer au hasard.
- **Pourcentage absolu** : `60 + raw × 37`, borné à `[60, 97]`. Plancher pour
  ne pas humilier le client, plafond parce qu'un 100 % n'est pas crédible pour
  un parfum.

> **Deux bugs rattrapés par les tests**, documentés car ils se reproduiraient :
>
> 1. Les composantes négatives du profil étaient écrêtées à 0 dans le produit
>    scalaire. Un visiteur qui **rejetait l'oud** se voyait proposer un oud —
>    le `-1.8` en boisé était simplement ignoré.
> 2. Le pourcentage était normalisé sur le meilleur score (`raw / top`), ce qui
>    affichait **mécaniquement 97 %** en tête, même quand le meilleur score réel
>    valait 0.04. Un profil contradictoire sortait « Bois Sauvage — 97 % ».
>
> `npm test` couvre les deux cas en régression.

L'ambiance de la page suit le goût : dès le 2ᵉ swipe, `SwipeDeck` remonte la
famille dominante, `/signature` la passe à la scène, les particules changent de
couleur. Avant le 2ᵉ swipe, le signal est du bruit — on ne le suit pas.

---

## 6. Curseur magnétique — `CustomCursor.jsx`

> Le composant existait dans le dépôt mais **n'était monté nulle part**. Il est
> désormais branché dans `app/layout.js`.

Trois comportements, pilotés par attributs — aucune prop à câbler :

| Attribut | Effet |
|---|---|
| `data-magnetic="card\|cta"` | l'anneau quitte le pointeur et se cale sur le centre de la cible |
| `data-magnetic-pull="0.35"` | intensité de l'aimantation, `0` → `1` |
| `data-cursor-label="Découvrir"` | le point devient un mot |
| `data-cursor-notes="Bergamote · Iris · Santal"` | lecture de la pyramide au survol d'un flacon |

Position **et** opacité sont écrites dans la boucle rAF ; les états React ne
portent que le contenu textuel, qui change rarement. `enabled` est dérivé au
rendu via `useSyncExternalStore` (`hooks/useMediaQuery.js`) : le curseur n'est
jamais monté puis éteint, et aucun `setState` ne s'exécute dans un effet.

Le curseur natif n'est masqué que si le composant a pu s'activer — il pose
`data-cursor="on"` sur `<html>`, et le CSS le lit. **Les champs de saisie
gardent leur caret.** Désactivé sur tactile et en mouvement réduit.

---

## 7. E-commerce

### 7.1 Coffret découverte — `store/cartStore.js`

L'API publique d'origine est **intacte** : le `CartDrawer` existant fonctionne
sans modification. Ajouts : `samples[]`, paliers, sélecteurs dérivés.

```js
SAMPLE_TIERS = [
  { min: 0,   allowance: 1 },
  { min: 60,  allowance: 2 },
  { min: 120, allowance: 3 },
]
```

**Règle produit.** Les échantillons restent dans le panier même si le sous-total
redescend sous le palier : on ne reprend pas un cadeau au client en cours de
route. On l'avertit (`overAllowance`) et on arbitre à la validation —
`grantedSamples()` tranche.

`persist` est en **version 2** avec `migrate` : les paniers v1 en localStorage
n'ont pas `samples` et ne cassent pas. `partialize` exclut `isOpen` — le tiroir
ne doit pas s'ouvrir tout seul au chargement.

### 7.2 Tunnel — `app/commande/page.js`

```
coffret ──▶ livraison ──▶ paiement ──▶ confirmé
```

Headless assumé : **`submitOrder()` est le seul point de contact avec le back.**
Brancher Stripe, Wave ou Orange Money se fait dans cette fonction, sans toucher
à l'UI. Elle est aujourd'hui simulée et marquée comme telle.

Micro-interactions de validation, toutes en `transform` / `opacity` / `stroke` :

- champ rempli → un filet se dessine sous lui (`scaleX`, origine gauche) ;
- ajout d'échantillon → onde de confirmation 420 ms + micro-recul du bouton ;
- commande confirmée → sceau SVG dont le cercle puis le trait se tracent
  (`stroke-dashoffset`, décalé de 650 ms).

> **Incohérence corrigée.** Le `CartDrawer` promettait la livraison offerte dès
> 200 € ; le tunnel appliquait un autre seuil. La promesse n'était pas tenue au
> moment de payer. Les deux lisent désormais `SHIPPING` dans `lib/money.js`.

### 7.3 Devise

`lib/money.js` centralise la devise, qui était écrite `€` en dur dans le JSX.
Passer la boutique en FCFA pour Abidjan est **une ligne** :

```js
export const CURRENCY = { code: 'XOF', locale: 'fr-CI', decimals: 0 };
```

---

## 8. Accessibilité — WCAG 2.2

| Critère | Traitement |
|---|---|
| 1.4.6 Contraste AAA | tokens `accentInk` / `accentGlow`, ≥ 7:1 — cf. §3.1 |
| 2.1.1 Clavier | swipe jouable aux flèches, boutons visibles, tunnel tabulable |
| 2.4.7 Focus visible | `:focus-visible` global, jamais supprimé, teinte adaptée à la surface |
| 2.5.8 Cible ≥ 24 px | `.target-safe` sur les filtres et le sélecteur d'échantillons |
| 2.3.3 Animation | `prefers-reduced-motion` coupe les animations, bloque le canvas et le curseur |
| 4.1.3 Messages d'état | `aria-live` sur le compteur, le nombre de résultats, les confirmations |

Les boutons de filtre portent `aria-pressed`, les étapes du tunnel
`aria-current="step"`, les champs invalides `aria-invalid`.

---

## 9. Vérification

```bash
npm test     # 13 tests du moteur olfactif — node:test, aucune dépendance
npm run lint
npm run build
```

État au moment de la livraison : build vert, 13/13 tests, 0 erreur de lint sur
les fichiers livrés.

**Dette préexistante non traitée** (hors périmètre, à faire un jour) :
`react/no-unescaped-entities` dans `app/a-propos/page.js` et `app/page.js`,
`@next/next/no-img-element` sur 7 occurrences, `set-state-in-effect` dans
`components/layout/Navbar.jsx`.

---

## 10. Étendre

**Ajouter une famille olfactive** → l'ajouter à `FAMILIES` dans `olfactory.js`
**et** à l'enum de `api/models/Perfume.js`. Rien d'autre : couleurs, particules,
filtres et scoring suivent.

**Ajouter une matière à swiper** → une entrée dans `CARDS` (`ingredients.js`).
Le vecteur `w` n'est pas normalisé volontairement : une matière franche comme
l'oud **doit** peser plus lourd qu'une bergamote consensuelle.

**Brancher le paiement** → `submitOrder()` dans `app/commande/page.js`.

**Passer une page en scène immersive** → l'envelopper dans `<OlfactoryStage
surface="ink" familyKey={...}>`. Garder le cream pour la boutique.
