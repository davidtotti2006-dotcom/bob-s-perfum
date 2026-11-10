'use client';

/**
 * ═══════════════════════════════════════════════════════════════
 *  MATCH RESULT — le verdict
 * ═══════════════════════════════════════════════════════════════
 *  Le pourcentage compte jusqu'à sa valeur (rAF, pas de setInterval) et
 *  l'anneau se remplit en strokeDashoffset : deux propriétés composables,
 *  zéro reflow. Le résultat propose l'échantillon offert plutôt que
 *  l'achat sec : c'est le bon geste commercial après un test.
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { family } from '@/lib/olfactory';
import { describeAxis } from '@/lib/matchEngine';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import useCartStore from '@/store/cartStore';

/**
 * Compteur animé en rAF.
 * `active` est décidé au rendu (cf. useReducedMotion) : quand il est faux,
 * l'effet ne s'exécute pas du tout et la valeur finale est affichée telle
 * quelle — aucun setState au montage, aucun rendu en cascade.
 */
function useCountUp(target, active, duration = 1400) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      // easeOutExpo : part vite, se pose en douceur. Le luxe ne freine pas sec.
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setV(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, active]);
  return v;
}

function MatchRing({ value, color }) {
  const R = 54;
  const C = 2 * Math.PI * R;
  const reduced = useReducedMotion();
  const counted = useCountUp(value, !reduced);
  const shown = reduced ? value : counted;
  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(253,251,247,0.12)" strokeWidth="1" />
        <circle
          cx="60"
          cy="60"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C - (C * shown) / 100}
          style={{ transition: 'stroke-dashoffset 120ms linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-3xl tabular-nums text-[#fdfbf7]">{shown}%</span>
        <span className="text-[7px] uppercase tracking-[0.3em] text-[#fdfbf7]/40">affinité</span>
      </div>
    </div>
  );
}

export default function MatchResult({ profile, results, onRestart }) {
  const f = family(profile.dominant);
  const axis = describeAxis(profile.axis);
  const addSample = useCartStore((s) => s.addSample);
  const [claimed, setClaimed] = useState(false);
  const liveRef = useRef(null);

  const hero = results[0];
  const others = results.slice(1, 4);

  const claim = () => {
    if (!hero || claimed) return;
    addSample({
      _id: hero.perfume._id,
      name: hero.perfume.name,
      slug: hero.perfume.slug,
      reason: `Affinité ${hero.match}%`,
    });
    setClaimed(true);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      {/* ── Verdict ── */}
      <div className="mb-14 text-center">
        <p
          className="mb-4 text-[9px] font-medium uppercase tracking-[0.55em]"
          style={{ color: f.accentGlow }}
        >
          Votre famille dominante — {f.label}
        </p>
        <h1 className="font-serif text-[clamp(2.2rem,6vw,3.33rem)] uppercase leading-[1] tracking-widest text-[#fdfbf7]">
          {hero ? hero.perfume.name : 'Profil établi'}
        </h1>
        <p className="mx-auto mt-5 max-w-md font-serif text-[1.272rem] italic text-[#ebd5c1]/75">
          {f.signature}.
        </p>
      </div>

      {/* ── Le parfum signature ── */}
      {hero && (
        <div
          className="mb-12 flex flex-col items-center gap-10 p-8 md:flex-row md:p-12"
          style={{
            background: 'rgba(253,251,247,0.04)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: `1px solid ${f.accent}33`,
          }}
        >
          <MatchRing value={hero.match} color={f.accentGlow} />

          <div className="flex-1 text-center md:text-left">
            <p className="text-[9px] uppercase tracking-[0.35em] text-[#fdfbf7]/40">
              Votre signature
            </p>
            <h2 className="mt-2 font-serif text-3xl uppercase tracking-wider text-[#fdfbf7]">
              {hero.perfume.name}
            </h2>
            <p className="mt-4 max-w-md text-[12px] leading-relaxed text-[#fdfbf7]/55">
              {hero.perfume.description}
            </p>

            {/* Profil de caractère */}
            <dl className="mt-7 grid grid-cols-3 gap-3 border-t border-[#fdfbf7]/10 pt-5">
              {[
                ['Intensité', axis.intensity],
                ['Climat', axis.warmth],
                ['Heure', axis.daylight],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[8px] uppercase tracking-[0.25em] text-[#fdfbf7]/35">{k}</dt>
                  <dd
                    className="mt-1 font-serif text-sm"
                    style={{ color: f.accentGlow }}
                  >
                    {v}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-wrap justify-center gap-4 md:justify-start">
              <button
                onClick={claim}
                disabled={claimed}
                data-magnetic="cta"
                className="relative overflow-hidden border px-8 py-3.5 text-[10px]
                  uppercase tracking-[0.35em] transition-colors duration-500
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
                style={{
                  borderColor: f.accentGlow,
                  color: claimed ? '#0a0a0a' : f.accentGlow,
                  background: claimed ? f.accentGlow : 'transparent',
                  outlineColor: f.accentGlow,
                }}
              >
                {claimed ? '✓ Échantillon réservé' : 'Recevoir l’échantillon offert'}
              </button>
              <Link
                href={`/collection/${hero.perfume.slug}`}
                data-magnetic="cta"
                className="border-b border-[#fdfbf7]/40 pb-1 text-[10px] uppercase
                  tracking-[0.35em] text-[#fdfbf7]/70 transition-colors
                  hover:border-[#fdfbf7] hover:text-[#fdfbf7]"
              >
                Voir la fiche
              </Link>
            </div>
            <p ref={liveRef} aria-live="polite" className="sr-only">
              {claimed ? `Échantillon de ${hero.perfume.name} ajouté à votre coffret.` : ''}
            </p>
          </div>
        </div>
      )}

      {/* ── Les suivants ── */}
      {others.length > 0 && (
        <>
          <p className="mb-5 text-center text-[9px] uppercase tracking-[0.4em] text-[#fdfbf7]/35">
            Également accordés à votre profil
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {others.map(({ perfume, match }) => {
              const pf = family(perfume.family);
              return (
                <Link
                  key={perfume._id}
                  href={`/collection/${perfume.slug}`}
                  data-magnetic="card"
                  className="group border border-[#fdfbf7]/10 p-6 transition-all duration-500
                    hover:border-[#fdfbf7]/30 hover:-translate-y-1"
                >
                  <div className="mb-3 flex items-baseline justify-between">
                    <span
                      className="font-serif text-xl tabular-nums"
                      style={{ color: pf.accentGlow }}
                    >
                      {match}%
                    </span>
                    <span className="text-[8px] uppercase tracking-[0.25em] text-[#fdfbf7]/30">
                      {pf.label}
                    </span>
                  </div>
                  <h3 className="font-serif text-base uppercase tracking-wider text-[#fdfbf7]/85">
                    {perfume.name}
                  </h3>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {/* ── Reprendre ── */}
      <div className="mt-16 text-center">
        <button
          onClick={onRestart}
          className="text-[9px] uppercase tracking-[0.35em] text-[#fdfbf7]/40
            transition-colors hover:text-[#fdfbf7]/80"
        >
          Refaire l’épreuve
        </button>
      </div>
    </div>
  );
}
