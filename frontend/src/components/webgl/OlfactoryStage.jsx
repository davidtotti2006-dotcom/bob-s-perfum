'use client';

/**
 * ═══════════════════════════════════════════════════════════════
 *  OLFACTORY STAGE — la scénographie
 * ═══════════════════════════════════════════════════════════════
 *  Enveloppe la scène WebGL et garantit qu'elle ne soit jamais un risque :
 *
 *    · Three.js chargé en `dynamic(ssr:false)` → hors du bundle initial,
 *      pas d'erreur d'hydratation, pas de WebGL côté serveur.
 *    · Un dégradé CSS construit depuis les tokens est peint SOUS le canvas.
 *      Sans WebGL, sans JS ou pendant le chargement, la scène reste belle.
 *    · `prefers-reduced-motion` → le canvas n'est même pas chargé.
 *
 *  Deux surfaces, pour ne pas trahir le thème Bob's :
 *    surface="cream" → la boutique, fond clair, c'est le défaut du site.
 *    surface="ink"   → les scènes immersives seulement (hero, matchmaking),
 *                      fond encre #0a0a0a déjà présent dans tes tokens.
 * ═══════════════════════════════════════════════════════════════
 */

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { family, familyVars } from '@/lib/olfactory';

const NoteParticles = dynamic(() => import('./NoteParticles'), { ssr: false });

export default function OlfactoryStage({
  familyKey = 'neutral',
  surface = 'ink',
  /** Hauteur du bloc. Accepte toute valeur CSS. */
  height = '100%',
  /** Contenu posé par-dessus la scène. */
  children,
  className = '',
}) {
  const f = family(familyKey);
  const [mountCanvas, setMountCanvas] = useState(false);

  useEffect(() => {
    // On ne charge Three.js qu'après l'hydratation, et jamais en mouvement réduit.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    // requestIdleCallback : la scène ne dispute pas le CPU au premier rendu.
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 300));
    const id = idle(() => setMountCanvas(true));
    return () => window.cancelIdleCallback?.(id);
  }, []);

  const isInk = surface === 'ink';

  return (
    <section
      className={`relative overflow-hidden isolate ${className}`}
      style={{
        height,
        ...familyVars(familyKey),
        backgroundColor: isInk ? 'var(--color-dark)' : 'var(--color-cream)',
      }}
    >
      {/* ── Couche 1 : fallback peint. Toujours là, même sans WebGL. ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 transition-[background] duration-1000"
        style={{
          background: isInk
            ? `radial-gradient(ellipse 70% 50% at 50% 42%, ${f.accent}2e 0%, transparent 70%),
               radial-gradient(ellipse 40% 60% at 18% 78%, ${f.pyramid[2]}24 0%, transparent 72%),
               radial-gradient(circle at 82% 22%, ${f.accentGlow}1a 0%, transparent 60%)`
            : `radial-gradient(ellipse 75% 55% at 50% 38%, ${f.accent}1c 0%, transparent 72%),
               radial-gradient(circle at 15% 80%, ${f.pyramid[0]}30 0%, transparent 65%)`,
          opacity: f.lumen,
        }}
      />

      {/* ── Couche 2 : les particules WebGL ── */}
      {mountCanvas && (
        <NoteParticles
          familyKey={familyKey}
          surface={surface}
          className="absolute inset-0 z-[1]"
        />
      )}

      {/* ── Couche 3 : grain. Casse les bandes de dégradé sur grand écran. ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[2] opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* ── Couche 4 : vignettage. Ramène le regard au centre. ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[3]"
        style={{
          background: isInk
            ? 'radial-gradient(ellipse at center, transparent 42%, rgba(10,10,10,0.72) 100%)'
            : 'radial-gradient(ellipse at center, transparent 55%, rgba(250,249,248,0.6) 100%)',
        }}
      />

      {/* ── Couche 5 : le contenu ── */}
      {children != null && <div className="relative z-10 h-full">{children}</div>}
    </section>
  );
}
