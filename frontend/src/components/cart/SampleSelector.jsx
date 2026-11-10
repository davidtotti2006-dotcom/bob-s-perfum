'use client';

/**
 * ═══════════════════════════════════════════════════════════════
 *  SAMPLE SELECTOR — le coffret découverte offert
 * ═══════════════════════════════════════════════════════════════
 *  Trois rôles : afficher le droit acquis, inciter au palier suivant,
 *  laisser choisir les flacons 2 ml. Se pose dans le CartDrawer ou dans
 *  le tunnel de commande, sans modification.
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react';
import useCartStore from '@/store/cartStore';
import { getPerfumes } from '@/lib/api';
import { family } from '@/lib/olfactory';
import { formatPrice } from '@/lib/money';

export default function SampleSelector({ compact = false }) {
  const samples = useCartStore((s) => s.samples);
  const addSample = useCartStore((s) => s.addSample);
  const removeSample = useCartStore((s) => s.removeSample);
  const status = useCartStore((s) => s.sampleStatus());

  const [catalogue, setCatalogue] = useState([]);
  const [open, setOpen] = useState(!compact);
  const [flash, setFlash] = useState(null); // id du dernier ajout, pour le pulse

  useEffect(() => {
    if (!open || catalogue.length) return;
    getPerfumes({ limit: 100 })
      .then((d) => setCatalogue(d.perfumes || []))
      .catch(() => setCatalogue([]));
  }, [open, catalogue.length]);

  const toggle = (p) => {
    const picked = samples.some((s) => s._id === p._id);
    if (picked) {
      removeSample(p._id);
      return;
    }
    const res = addSample({ _id: p._id, name: p.name, slug: p.slug });
    if (res === 'added') {
      setFlash(p._id);
      // Retour haptique visuel : 420 ms, la durée d'un accusé de réception.
      setTimeout(() => setFlash(null), 420);
    }
  };

  return (
    <div className="border-t border-[#ebd5c1]/40 pt-5">
      {/* ── En-tête : le droit acquis ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-baseline justify-between text-left"
        aria-expanded={open}
      >
        <span>
          <span className="block text-[10px] font-medium uppercase tracking-[0.3em] text-ink-accent">
            Coffret découverte — offert
          </span>
          <span className="mt-1 block text-[9px] uppercase tracking-[0.2em] text-ink-muted">
            {status.taken} / {status.allowance} échantillon
            {status.allowance > 1 ? 's' : ''} 2 ml
          </span>
        </span>
        <span className="text-[9px] uppercase tracking-[0.25em] text-ink-muted">
          {open ? '—' : '+'}
        </span>
      </button>

      {/* ── Jauge du droit ── */}
      <div className="mt-3 flex gap-1.5" aria-hidden="true">
        {Array.from({ length: status.allowance }).map((_, i) => (
          <span
            key={i}
            className="h-[3px] flex-1 transition-colors duration-500"
            style={{
              background: i < status.taken ? 'var(--accent)' : 'rgba(235,213,193,0.5)',
            }}
          />
        ))}
      </div>

      {/* ── Incitation au palier suivant ── */}
      {status.next && (
        <p className="mt-3 font-serif text-[13px] italic text-ink-muted">
          Encore {formatPrice(status.missingForNext)} et nous ajoutons un{' '}
          {status.next.allowance}
          <sup>e</sup> échantillon.
        </p>
      )}

      {/* ── Dépassement : on avertit, on ne confisque pas ── */}
      {status.overAllowance > 0 && (
        <p className="mt-3 text-[10px] leading-relaxed text-ink-accent" role="status">
          {status.overAllowance} échantillon{status.overAllowance > 1 ? 's' : ''} au-delà
          de votre droit actuel. Retirez-en, ou complétez votre panier pour les conserver.
        </p>
      )}

      {/* ── Sélection ── */}
      {open && (
        <ul className="mt-5 grid grid-cols-2 gap-2">
          {catalogue.map((p) => {
            const picked = samples.some((s) => s._id === p._id);
            const f = family(p.family);
            const isFlashing = flash === p._id;
            return (
              <li key={p._id}>
                <button
                  onClick={() => toggle(p)}
                  data-magnetic="cta"
                  data-magnetic-pull="0.2"
                  aria-pressed={picked}
                  className="group relative w-full overflow-hidden border px-3 py-2.5
                    text-left transition-all duration-300 target-safe"
                  style={{
                    borderColor: picked ? f.accent : 'rgba(235,213,193,0.6)',
                    background: picked ? `${f.accent}14` : 'transparent',
                    transform: isFlashing ? 'scale(0.96)' : 'scale(1)',
                  }}
                >
                  <span
                    className="block truncate text-[10px] uppercase tracking-[0.15em]"
                    style={{ color: picked ? f.accentInk : 'var(--color-dark-2)' }}
                  >
                    {p.name}
                  </span>
                  <span className="mt-0.5 block text-[8px] uppercase tracking-[0.2em] text-ink-muted">
                    {picked ? '✓ dans le coffret' : f.label}
                  </span>

                  {/* Onde de validation : un seul élément, transform + opacity */}
                  {isFlashing && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 animate-ripple"
                      style={{ background: `radial-gradient(circle, ${f.accent}55, transparent 70%)` }}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
