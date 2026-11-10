'use client';

/**
 * ═══════════════════════════════════════════════════════════════
 *  SWIPE DECK — l'orchestrateur
 * ═══════════════════════════════════════════════════════════════
 *  Tient la FSM, calcule le profil à chaque swipe et remonte la famille
 *  dominante au parent — qui la passe à la scène WebGL. Résultat : la
 *  lumière de la page dérive à mesure que le goût se précise.
 * ═══════════════════════════════════════════════════════════════
 */

import { useCallback, useEffect, useMemo, useReducer } from 'react';
import {
  STATES,
  initialState,
  reducer,
  selectCurrent,
  selectNext,
  selectProgress,
  selectIsBusy,
} from '@/lib/swipeMachine';
import { accumulate } from '@/lib/matchEngine';
import { family } from '@/lib/olfactory';
import SwipeCard from './SwipeCard';

export default function SwipeDeck({ deck, onFamilyChange, onComplete }) {
  const [state, dispatch] = useReducer(reducer, deck, initialState);

  const current = selectCurrent(state);
  const next = selectNext(state);
  const busy = selectIsBusy(state);
  const progress = selectProgress(state);

  // Le profil se recalcule à chaque swipe : c'est peu coûteux et toujours juste.
  const profile = useMemo(() => accumulate(state.swipes), [state.swipes]);

  // L'ambiance suit le goût, dès le 2e swipe (avant, le signal est du bruit).
  useEffect(() => {
    if (state.swipes.length >= 2) onFamilyChange?.(profile.dominant);
  }, [profile.dominant, state.swipes.length, onFamilyChange]);

  // Fin du deck : on laisse respirer, puis on révèle.
  useEffect(() => {
    if (state.status !== STATES.REVEALING) return;
    onComplete?.(profile);
    const t = setTimeout(() => dispatch({ type: 'REVEALED' }), 1500);
    return () => clearTimeout(t);
  }, [state.status, profile, onComplete]);

  // Clavier : ← passer, → j'aime, Entrée démarrer. Accessibilité non négociable.
  useEffect(() => {
    const onKey = (e) => {
      if (state.status === STATES.INTRO && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        dispatch({ type: 'START' });
        return;
      }
      if (e.key === 'ArrowRight') dispatch({ type: 'CHOOSE', dir: 'right' });
      if (e.key === 'ArrowLeft') dispatch({ type: 'CHOOSE', dir: 'left' });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.status]);

  const handleDragEnd = useCallback((dx, velocity) => {
    dispatch({ type: 'DRAG_END', dx, velocity });
  }, []);
  const handleSettled = useCallback(() => dispatch({ type: 'SETTLED' }), []);

  const f = family(profile.dominant);

  /* ── INTRO ── */
  if (state.status === STATES.INTRO) {
    return (
      <div className="mx-auto max-w-xl px-6 text-center">
        <p className="mb-4 text-[9px] font-medium uppercase tracking-[0.55em] text-[#ebd5c1]">
          Épreuve olfactive
        </p>
        <h1 className="font-serif text-[clamp(2.5rem,7vw,4.236rem)] uppercase leading-[0.95] tracking-widest text-[#fdfbf7]">
          Votre
          <br />
          Signature
        </h1>
        <p className="mx-auto mt-7 max-w-sm font-serif text-[1.272rem] italic leading-relaxed text-[#ebd5c1]/80">
          {deck.length} matières premières. Gardez celles qui vous troublent,
          écartez les autres. Nous en déduirons la fragrance qui vous ressemble.
        </p>
        <button
          onClick={() => dispatch({ type: 'START' })}
          data-magnetic="cta"
          data-cursor-label="Commencer"
          className="mt-12 border border-[#ebd5c1] px-10 py-4 text-[10px] uppercase
            tracking-[0.4em] text-[#fdfbf7] transition-colors duration-500
            hover:bg-[#ebd5c1] hover:text-[#0a0a0a]
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
            focus-visible:outline-[#ebd5c1]"
        >
          Commencer
        </button>
        <p className="mt-6 text-[9px] uppercase tracking-[0.25em] text-[#fdfbf7]/35">
          Flèches ← → au clavier
        </p>
      </div>
    );
  }

  /* ── RÉVÉLATION : le temps suspendu avant le verdict ── */
  if (state.status === STATES.REVEALING) {
    return (
      <div className="flex flex-col items-center gap-8 px-6 text-center">
        <div
          className="h-20 w-20 animate-spin-slow rounded-full"
          style={{ border: `1px solid ${f.accentGlow}55`, borderTopColor: f.accentGlow }}
        />
        <p
          className="text-[10px] uppercase tracking-[0.5em]"
          style={{ color: f.accentGlow }}
        >
          Composition de votre profil
        </p>
      </div>
    );
  }

  /* ── RÉSULTAT : rendu par le parent ── */
  if (state.status === STATES.RESULT) return null;

  /* ── JEU ── */
  return (
    <div className="mx-auto w-full max-w-md px-5">
      {/* Progression : filet d'or, pas de barre de téléchargement */}
      <div className="mb-6 flex items-center gap-4">
        <div className="h-[1px] flex-1 bg-[#fdfbf7]/15">
          <div
            className="h-full transition-[width] duration-700 ease-out"
            style={{
              width: `${progress * 100}%`,
              background: `linear-gradient(90deg, ${f.accentGlow}, ${f.accent})`,
            }}
          />
        </div>
        <span
          className="font-serif text-sm tabular-nums"
          style={{ color: f.accentGlow }}
          aria-live="polite"
        >
          {String(state.index + 1).padStart(2, '0')}
          <span className="text-[#fdfbf7]/30"> / {String(deck.length).padStart(2, '0')}</span>
        </span>
      </div>

      {/* Pile de cartes */}
      <div className="relative aspect-[3/4.2] w-full">
        {next && <SwipeCard key={next.id} card={next} mode="next" />}
        {current && (
          <SwipeCard
            key={current.id}
            card={current}
            mode={
              state.status === STATES.COMMITTING
                ? state.flying === 'right'
                  ? 'flying-right'
                  : 'flying-left'
                : 'active'
            }
            onDragStart={() => dispatch({ type: 'DRAG_START' })}
            onDragMove={(dx, dy) => dispatch({ type: 'DRAG_MOVE', dx, dy })}
            onDragEnd={handleDragEnd}
            onSettled={handleSettled}
          />
        )}
      </div>

      {/* Commandes : indispensables au clavier et au trackpad */}
      <div className="mt-8 flex items-center justify-center gap-5">
        <button
          onClick={() => dispatch({ type: 'CHOOSE', dir: 'left' })}
          disabled={busy}
          data-magnetic="cta"
          aria-label="Passer cette matière"
          className="h-14 w-14 rounded-full border border-[#fdfbf7]/25 text-[#fdfbf7]/70
            transition-all duration-300 hover:scale-110 hover:border-[#fdfbf7]/60
            disabled:opacity-30 focus-visible:outline focus-visible:outline-2
            focus-visible:outline-offset-4 focus-visible:outline-[#ebd5c1]"
        >
          ✕
        </button>
        <span className="text-[9px] uppercase tracking-[0.3em] text-[#fdfbf7]/30">
          glissez
        </span>
        <button
          onClick={() => dispatch({ type: 'CHOOSE', dir: 'right' })}
          disabled={busy}
          data-magnetic="cta"
          aria-label="Garder cette matière"
          className="h-14 w-14 rounded-full transition-all duration-300
            hover:scale-110 disabled:opacity-30 focus-visible:outline
            focus-visible:outline-2 focus-visible:outline-offset-4"
          style={{
            border: `1px solid ${f.accentGlow}`,
            color: f.accentGlow,
            outlineColor: f.accentGlow,
          }}
        >
          ♥
        </button>
      </div>
    </div>
  );
}
