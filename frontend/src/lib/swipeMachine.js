/**
 * ═══════════════════════════════════════════════════════════════
 *  SWIPE MACHINE — FSM explicite du parcours olfactif
 * ═══════════════════════════════════════════════════════════════
 *
 *   intro ──START──▶ idle ──DRAG_START──▶ dragging
 *                     ▲                      │
 *                     │                 DRAG_END
 *                     │                      │
 *                     │              ┌───────┴───────┐
 *                     │        sous seuil        au-delà
 *                     │              │               │
 *                     └──────────────┘          committing
 *                                                    │
 *                                              SETTLED (fin anim)
 *                                                    │
 *                                      ┌─────────────┴────┐
 *                                 deck restant        deck vide
 *                                      │                  │
 *                                    idle            revealing
 *                                                         │
 *                                                      REVEALED
 *                                                         │
 *                                                      result
 *
 *  Pourquoi une FSM et pas des booléens : pendant `committing` la carte
 *  s'envole en 420 ms. Sans état explicite, un second swipe pendant
 *  l'animation consomme deux cartes et désynchronise le compteur. Ici,
 *  DRAG_START est simplement ignoré hors de `idle`.
 * ═══════════════════════════════════════════════════════════════
 */

export const STATES = {
  INTRO: 'intro',
  IDLE: 'idle',
  DRAGGING: 'dragging',
  COMMITTING: 'committing',
  REVEALING: 'revealing',
  RESULT: 'result',
};

/** Distance (px) ou vélocité (px/ms) au-delà de laquelle le swipe est validé. */
export const THRESHOLD = { distance: 110, velocity: 0.55 };

export function initialState(deck) {
  return {
    status: STATES.INTRO,
    deck,
    index: 0,
    swipes: [],
    /** Geste en cours. `null` hors de `dragging`/`committing`. */
    drag: null,
    /** Direction validée, le temps de l'animation de sortie. */
    flying: null,
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case 'START':
      if (state.status !== STATES.INTRO) return state;
      return { ...state, status: STATES.IDLE };

    case 'DRAG_START':
      // Verrou : seul `idle` accepte un nouveau geste.
      if (state.status !== STATES.IDLE) return state;
      return { ...state, status: STATES.DRAGGING, drag: { dx: 0, dy: 0 } };

    case 'DRAG_MOVE':
      if (state.status !== STATES.DRAGGING) return state;
      return { ...state, drag: { dx: action.dx, dy: action.dy } };

    case 'DRAG_END': {
      if (state.status !== STATES.DRAGGING) return state;
      const { dx, velocity } = action;
      const passed =
        Math.abs(dx) > THRESHOLD.distance || Math.abs(velocity) > THRESHOLD.velocity;
      if (!passed) {
        // Retour élastique : on repasse en idle, la carte se recentre en CSS.
        return { ...state, status: STATES.IDLE, drag: null };
      }
      return commit(state, dx > 0 ? 'right' : 'left');
    }

    // Choix au clavier ou par les boutons : même chemin que le geste.
    case 'CHOOSE':
      if (state.status !== STATES.IDLE) return state;
      return commit(state, action.dir);

    case 'SETTLED': {
      if (state.status !== STATES.COMMITTING) return state;
      const nextIndex = state.index + 1;
      const done = nextIndex >= state.deck.length;
      return {
        ...state,
        status: done ? STATES.REVEALING : STATES.IDLE,
        index: nextIndex,
        drag: null,
        flying: null,
      };
    }

    case 'REVEALED':
      if (state.status !== STATES.REVEALING) return state;
      return { ...state, status: STATES.RESULT };

    case 'RESTART':
      return initialState(action.deck ?? state.deck);

    default:
      return state;
  }
}

function commit(state, dir) {
  const card = state.deck[state.index];
  if (!card) return state;
  return {
    ...state,
    status: STATES.COMMITTING,
    flying: dir,
    swipes: [...state.swipes, { card, dir }],
  };
}

/* ── Sélecteurs : l'UI ne recalcule rien ── */
export const selectCurrent = (s) => s.deck[s.index] ?? null;
export const selectNext = (s) => s.deck[s.index + 1] ?? null;
export const selectProgress = (s) => (s.deck.length ? s.index / s.deck.length : 0);
export const selectIsBusy = (s) =>
  s.status === STATES.COMMITTING || s.status === STATES.REVEALING;
