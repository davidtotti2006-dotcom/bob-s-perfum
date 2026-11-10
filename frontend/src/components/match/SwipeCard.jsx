'use client';

/**
 * ═══════════════════════════════════════════════════════════════
 *  SWIPE CARD — la carte matière
 * ═══════════════════════════════════════════════════════════════
 *  Contrainte de perf : pendant le geste, AUCUN rendu React.
 *  Le pointeur écrit directement dans `element.style.transform`, lu par
 *  le compositeur. React ne reprend la main qu'au relâchement, via
 *  `onCommit`. C'est ce qui tient le 60 fps sur mobile.
 *
 *  Transform : translate3d + rotateZ proportionnel à dx, plafonné à 14°.
 *  `will-change` est posé au pointerdown et retiré ensuite — le laisser en
 *  permanence réserve une couche GPU pour rien et pénalise la page.
 * ═══════════════════════════════════════════════════════════════
 */

import { useCallback, useEffect, useRef } from 'react';
import { family } from '@/lib/olfactory';
import { THRESHOLD } from '@/lib/swipeMachine';

/** Famille dominante d'une carte : pilote son accent. */
function cardFamily(card) {
  const best = Object.entries(card.w).sort((a, b) => b[1] - a[1])[0];
  return best ? best[0] : 'neutral';
}

export default function SwipeCard({
  card,
  /** 'active' pilotable, 'next' en profondeur, 'flying-left' | 'flying-right'. */
  mode = 'active',
  onDragStart,
  onDragMove,
  onDragEnd,
  onSettled,
}) {
  const ref = useRef(null);
  const state = useRef({ dragging: false, startX: 0, startY: 0, lastX: 0, lastT: 0, v: 0 });
  const f = family(cardFamily(card));

  /* ── Écriture directe dans le style : hors cycle React ── */
  const paint = useCallback((dx, dy, instant = true) => {
    const el = ref.current;
    if (!el) return;
    const rot = Math.max(-14, Math.min(14, dx * 0.06));
    el.style.transition = instant ? 'none' : 'transform 520ms cubic-bezier(0.16,1,0.3,1)';
    el.style.transform = `translate3d(${dx}px, ${dy * 0.35}px, 0) rotateZ(${rot}deg)`;

    // Les verdicts OUI / NON apparaissent en opacité pure (pas de layout).
    const yes = el.querySelector('[data-verdict="yes"]');
    const no = el.querySelector('[data-verdict="no"]');
    const t = Math.min(Math.abs(dx) / THRESHOLD.distance, 1);
    if (yes) yes.style.opacity = dx > 12 ? String(t) : '0';
    if (no) no.style.opacity = dx < -12 ? String(t) : '0';
  }, []);

  const onPointerDown = useCallback(
    (e) => {
      if (mode !== 'active') return;
      const el = ref.current;
      if (!el) return;
      el.setPointerCapture?.(e.pointerId);
      el.style.willChange = 'transform';
      state.current = {
        dragging: true,
        startX: e.clientX,
        startY: e.clientY,
        lastX: e.clientX,
        lastT: performance.now(),
        v: 0,
      };
      onDragStart?.();
    },
    [mode, onDragStart]
  );

  const onPointerMove = useCallback(
    (e) => {
      const s = state.current;
      if (!s.dragging) return;
      const dx = e.clientX - s.startX;
      const dy = e.clientY - s.startY;

      // Vélocité instantanée lissée : décide d'un swipe court mais sec.
      const now = performance.now();
      const dt = now - s.lastT;
      if (dt > 8) {
        s.v = s.v * 0.6 + ((e.clientX - s.lastX) / dt) * 0.4;
        s.lastX = e.clientX;
        s.lastT = now;
      }

      paint(dx, dy);
      onDragMove?.(dx, dy);
    },
    [paint, onDragMove]
  );

  const onPointerUp = useCallback(
    (e) => {
      const s = state.current;
      if (!s.dragging) return;
      s.dragging = false;
      const el = ref.current;
      const dx = e.clientX - s.startX;

      const passed = Math.abs(dx) > THRESHOLD.distance || Math.abs(s.v) > THRESHOLD.velocity;
      if (!passed && el) {
        // Retour élastique immédiat, piloté en CSS.
        paint(0, 0, false);
        el.style.willChange = 'auto';
      }
      onDragEnd?.(dx, s.v);
    },
    [paint, onDragEnd]
  );

  /* ── Sortie de scène : la carte s'envole, puis signale SETTLED ── */
  useEffect(() => {
    if (mode !== 'flying-left' && mode !== 'flying-right') return;
    const el = ref.current;
    if (!el) return;
    const dir = mode === 'flying-right' ? 1 : -1;
    const w = window.innerWidth;

    el.style.willChange = 'transform, opacity';
    // Double rAF : garantit que la transition part de la position courante
    // et n'est pas avalée par le même frame que le changement de style.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition =
          'transform 440ms cubic-bezier(0.32,0,0.67,0), opacity 440ms ease-out';
        el.style.transform = `translate3d(${dir * (w * 0.9)}px, -40px, 0) rotateZ(${dir * 22}deg)`;
        el.style.opacity = '0';
      });
    });

    const t = setTimeout(() => onSettled?.(), 450);
    return () => clearTimeout(t);
  }, [mode, onSettled]);

  const isActive = mode === 'active';

  return (
    <article
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      data-magnetic={isActive ? 'card' : undefined}
      className={`absolute inset-0 select-none overflow-hidden rounded-sm
        ${isActive ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
      style={{
        touchAction: 'none',
        transform: mode === 'next' ? 'translate3d(0,14px,0) scale(0.94)' : undefined,
        opacity: mode === 'next' ? 0.45 : 1,
        transition: mode === 'next' ? 'transform 520ms cubic-bezier(0.16,1,0.3,1)' : undefined,
        zIndex: mode === 'next' ? 1 : 2,
        backfaceVisibility: 'hidden',
        // Le verre givré : c'est ici que le glassmorphism opère.
        background: `linear-gradient(155deg,
          rgba(253,251,247,0.94) 0%,
          rgba(253,251,247,0.80) 45%,
          ${f.accent}1f 100%)`,
        backdropFilter: 'blur(14px) saturate(1.15)',
        WebkitBackdropFilter: 'blur(14px) saturate(1.15)',
        border: `1px solid ${f.accent}55`,
        boxShadow: `0 28px 70px -24px ${f.pyramid[2]}66,
                    0 2px 10px -4px rgba(26,26,26,0.12),
                    inset 0 1px 0 rgba(255,255,255,0.85)`,
      }}
    >
      {/* Reflet de verre : la bande lumineuse qui fait le flacon */}
      <div
        aria-hidden="true"
        className="absolute -left-1/4 top-0 h-full w-1/3 -skew-x-12 opacity-50"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent)',
        }}
      />

      {/* Verdicts, révélés par le geste */}
      <div
        data-verdict="yes"
        aria-hidden="true"
        className="absolute left-6 top-6 z-20 rotate-[-10deg] border px-3 py-1.5
          text-[10px] uppercase tracking-[0.3em]"
        style={{ opacity: 0, color: f.accentInk, borderColor: f.accentInk }}
      >
        J&apos;aime
      </div>
      <div
        data-verdict="no"
        aria-hidden="true"
        className="absolute right-6 top-6 z-20 rotate-[10deg] border border-[#1a1a1a]/50
          px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] text-[#1a1a1a]/60"
        style={{ opacity: 0 }}
      >
        Passer
      </div>

      {/* Contenu */}
      <div className="relative z-10 flex h-full flex-col justify-between p-8 md:p-10">
        <header>
          <p
            className="mb-5 text-[9px] font-medium uppercase tracking-[0.45em]"
            style={{ color: f.accentInk }}
          >
            {card.kind === 'ambiance' ? 'Ambiance' : 'Matière première'}
          </p>

          {/* Sceau : initiale de la matière, dessinée au trait */}
          <div
            className="mb-7 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ border: `1px solid ${f.accent}66`, background: `${f.accent}14` }}
          >
            <span
              className="font-serif text-2xl"
              style={{ color: f.accentInk }}
            >
              {card.name.replace(/^(Le |La |L’|Un |Une |Du )/, '').charAt(0)}
            </span>
          </div>

          <h2 className="font-serif text-[clamp(1.75rem,5vw,2.618rem)] uppercase leading-[1.05] tracking-wider text-[#1a1a1a]">
            {card.name}
          </h2>
          <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-[#1a1a1a]/45">
            {card.origin}
          </p>
        </header>

        <footer>
          <div
            className="mb-5 h-[1px] w-16"
            style={{ background: `linear-gradient(90deg, ${f.accent}, transparent)` }}
          />
          <p className="font-serif text-[clamp(1rem,2.4vw,1.272rem)] italic leading-relaxed text-[#1a1a1a]/75">
            {card.prose}
          </p>
        </footer>
      </div>
    </article>
  );
}
