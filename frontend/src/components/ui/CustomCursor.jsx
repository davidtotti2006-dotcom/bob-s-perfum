'use client';

/**
 * ═══════════════════════════════════════════════════════════════
 *  CURSEUR MAGNÉTIQUE
 * ═══════════════════════════════════════════════════════════════
 *  Reprend l'anneau + point d'origine, et ajoute trois comportements :
 *
 *   1. AIMANTATION — au-dessus d'un `[data-magnetic]`, l'anneau quitte le
 *      pointeur et se cale sur le centre de la cible. Le lien « attrape »
 *      le curseur. Intensité réglable par `data-magnetic-pull`.
 *   2. LECTURE OLFACTIVE — `data-cursor-notes="Bergamote · Iris · Santal"`
 *      affiche les notes près du curseur au survol d'un flacon.
 *   3. ÉTAT — `data-cursor-label` remplace le point par un mot (Découvrir,
 *      Ajouter…). L'anneau s'épaissit, le point disparaît.
 *
 *  Tout est écrit en `transform` + `opacity` dans la boucle rAF. Les states
 *  React ne servent qu'au contenu textuel, qui change rarement.
 *
 *  Désactivé si : pointeur grossier (tactile) ou `prefers-reduced-motion`.
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect, useRef, useState } from 'react';
import { usePointerFine, useReducedMotion } from '@/hooks/useMediaQuery';

const LERP = { ring: 0.14, label: 0.22 };

export default function CustomCursor() {
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const labelRef = useRef(null);

  const pos = useRef({ x: -200, y: -200 });
  const ring = useRef({ x: -200, y: -200 });
  const label = useRef({ x: -200, y: -200 });
  const magnet = useRef(null); // { x, y, w, h, pull }
  const raf = useRef(null);

  // L'opacité d'apparition est écrite directement dans le DOM : en faire un
  // state forcerait l'effet à se remonter au premier mouvement de souris,
  // et à réinstaller tous les écouteurs pour rien.
  const seen = useRef(false);
  /** Miroir de `text` lisible depuis la boucle rAF sans dépendance de rendu. */
  const hasText = useRef(false);

  const [variant, setVariant] = useState('default'); // default | link | magnetic | press
  const [text, setText] = useState({ label: '', notes: '' });

  // Décidé au rendu : le curseur n'est jamais monté puis éteint.
  const fine = usePointerFine();
  const reduced = useReducedMotion();
  const enabled = fine && !reduced;

  useEffect(() => {
    if (!enabled) return;

    // Signal au CSS : il masque alors le curseur natif (sauf champs de saisie).
    document.documentElement.dataset.cursor = 'on';

    /* ── Suivi du pointeur ── */
    const onMove = (e) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
      if (!seen.current) {
        seen.current = true;
        // Premier mouvement : on révèle les trois calques, sans rendu React.
        for (const el of [ringRef.current, dotRef.current, labelRef.current]) {
          if (el) el.dataset.seen = 'true';
        }
      }
    };

    /* ── Détection de cible : un seul listener délégué ── */
    const onOver = (e) => {
      const t = e.target instanceof Element ? e.target : null;
      if (!t) return;

      const mag = t.closest('[data-magnetic]');
      const interactive = t.closest('a, button, [role="button"], input, textarea, select');
      const noteHost = t.closest('[data-cursor-notes]');

      const nextLabel =
        mag?.getAttribute('data-cursor-label') ||
        interactive?.getAttribute('data-cursor-label') ||
        '';
      const nextNotes = noteHost?.getAttribute('data-cursor-notes') || '';

      hasText.current = Boolean(nextLabel || nextNotes);
      setText((prev) =>
        prev.label === nextLabel && prev.notes === nextNotes
          ? prev
          : { label: nextLabel, notes: nextNotes }
      );

      if (mag) {
        const r = mag.getBoundingClientRect();
        const pull = parseFloat(mag.getAttribute('data-magnetic-pull') || '0.35');
        magnet.current = {
          x: r.left + r.width / 2,
          y: r.top + r.height / 2,
          w: r.width,
          h: r.height,
          pull: Math.max(0, Math.min(pull, 1)),
        };
        setVariant('magnetic');
      } else {
        magnet.current = null;
        setVariant(interactive ? 'link' : 'default');
      }
    };

    const onOut = (e) => {
      // Ne réinitialise que si on quitte vraiment la cible, pas en passant
      // sur un enfant (sinon le curseur clignote).
      const to = e.relatedTarget;
      if (to instanceof Element && to.closest('[data-magnetic], a, button')) return;
      magnet.current = null;
      hasText.current = false;
      setVariant('default');
      setText((p) => (p.label === '' && p.notes === '' ? p : { label: '', notes: '' }));
    };

    const onDown = () => setVariant((v) => (v === 'press' ? v : 'press'));
    const onUp = () => setVariant(magnet.current ? 'magnetic' : 'default');

    // Le scroll invalide les rectangles mémorisés.
    const onScroll = () => {
      magnet.current = null;
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });
    document.addEventListener('mouseout', onOut, { passive: true });
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ── Boucle de rendu ── */
    const tick = () => {
      const m = magnet.current;

      // Cible de l'anneau : le centre de l'élément aimanté, pondéré par `pull`.
      let tx = pos.current.x;
      let ty = pos.current.y;
      if (m) {
        tx = pos.current.x + (m.x - pos.current.x) * m.pull;
        ty = pos.current.y + (m.y - pos.current.y) * m.pull;
      }

      ring.current.x += (tx - ring.current.x) * LERP.ring;
      ring.current.y += (ty - ring.current.y) * LERP.ring;
      label.current.x += (pos.current.x - label.current.x) * LERP.label;
      label.current.y += (pos.current.y - label.current.y) * LERP.label;

      // Position ET opacité écrites ici : zéro rendu React pendant le mouvement.
      const on = seen.current;
      const withText = on && hasText.current;

      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate3d(${pos.current.x - 3}px, ${pos.current.y - 3}px, 0)`;
        dotRef.current.style.opacity = on && !hasText.current ? '1' : '0';
      }
      if (ringRef.current) {
        // La taille est gérée en CSS ; le transform ne porte que la position.
        ringRef.current.style.transform =
          `translate3d(${ring.current.x - 20}px, ${ring.current.y - 20}px, 0)`;
        ringRef.current.style.opacity = on ? '1' : '0';
      }
      if (labelRef.current) {
        labelRef.current.style.transform =
          `translate3d(${label.current.x + 18}px, ${label.current.y + 16}px, 0)`;
        labelRef.current.style.opacity = withText ? '1' : '0';
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    return () => {
      delete document.documentElement.dataset.cursor;
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  const ringSize =
    variant === 'magnetic' ? 64 : variant === 'link' ? 56 : variant === 'press' ? 28 : 40;

  return (
    <>
      {/* Anneau */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: ringSize,
          height: ringSize,
          marginTop: (40 - ringSize) / 2,
          marginLeft: (40 - ringSize) / 2,
          borderRadius: '50%',
          border: `1px solid ${variant === 'default' ? 'rgba(198,135,163,0.55)' : 'var(--color-rose, #c687a3)'}`,
          backgroundColor: variant === 'magnetic' ? 'rgba(198,135,163,0.07)' : 'transparent',
          pointerEvents: 'none',
          zIndex: 99999,
          opacity: 0, // pilotée par la boucle rAF
          willChange: 'transform',
          transition:
            'width .35s cubic-bezier(.16,1,.3,1), height .35s cubic-bezier(.16,1,.3,1), margin .35s cubic-bezier(.16,1,.3,1), opacity .3s ease, background-color .35s ease, border-color .35s ease',
        }}
      />

      {/* Point central, effacé quand un libellé prend sa place */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: 'var(--color-rose, #c687a3)',
          pointerEvents: 'none',
          zIndex: 99999,
          opacity: 0, // pilotée par la boucle rAF
          willChange: 'transform',
          transition: 'opacity .25s ease, width .2s ease, height .2s ease',
        }}
      />

      {/* Libellé + lecture des notes */}
      <div
        ref={labelRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 99999,
          opacity: 0, // pilotée par la boucle rAF
          transform: 'translate3d(-200px,-200px,0)',
          willChange: 'transform',
          transition: 'opacity .35s ease',
          maxWidth: 220,
        }}
      >
        {text.label && (
          <span
            style={{
              display: 'block',
              fontSize: 9,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'var(--color-dark-2, #1a1a1a)',
              background: 'rgba(253,251,247,0.82)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(235,213,193,0.6)',
              padding: '6px 12px',
              whiteSpace: 'nowrap',
            }}
          >
            {text.label}
          </span>
        )}
        {text.notes && (
          <span
            style={{
              display: 'block',
              marginTop: text.label ? 6 : 0,
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontStyle: 'italic',
              fontSize: 13,
              lineHeight: 1.4,
              color: 'var(--color-dark-2, #1a1a1a)',
              background: 'rgba(253,251,247,0.82)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(235,213,193,0.6)',
              padding: '8px 12px',
            }}
          >
            {text.notes}
          </span>
        )}
      </div>
    </>
  );
}
