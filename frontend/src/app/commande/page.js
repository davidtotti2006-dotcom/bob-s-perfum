'use client';

/**
 * ═══════════════════════════════════════════════════════════════
 *  /commande — TUNNEL DE COMMANDE
 * ═══════════════════════════════════════════════════════════════
 *  FSM à 4 états, une seule vue montée à la fois :
 *
 *    coffret ──▶ livraison ──▶ paiement ──▶ confirmé
 *        ◀───────────┴─────────────┘
 *
 *  Architecture headless assumée : `submitOrder()` est le SEUL point de
 *  contact avec le back. Brancher Stripe, Wave ou Orange Money se fait
 *  dans cette fonction, sans toucher à l'UI.
 *
 *  Micro-interactions : le sceau de confirmation dessine son trait (SVG
 *  stroke-dashoffset, composable), chaque champ validé émet un pulse.
 * ═══════════════════════════════════════════════════════════════
 */

import { useCallback, useReducer, useState } from 'react';
import Link from 'next/link';
import useCartStore from '@/store/cartStore';
import SampleSelector from '@/components/cart/SampleSelector';
import { formatPrice, shippingFor } from '@/lib/money';

const STEPS = ['coffret', 'livraison', 'paiement', 'confirmé'];

function reducer(state, action) {
  switch (action.type) {
    case 'NEXT': {
      const i = STEPS.indexOf(state.step);
      return { ...state, step: STEPS[Math.min(i + 1, STEPS.length - 1)], error: null };
    }
    case 'BACK': {
      const i = STEPS.indexOf(state.step);
      return { ...state, step: STEPS[Math.max(i - 1, 0)], error: null };
    }
    case 'FIELD':
      return { ...state, form: { ...state.form, [action.name]: action.value } };
    case 'ERROR':
      return { ...state, error: action.message, pending: false };
    case 'PENDING':
      return { ...state, pending: true, error: null };
    case 'DONE':
      return { ...state, step: 'confirmé', pending: false, reference: action.reference };
    default:
      return state;
  }
}

const INITIAL = {
  step: 'coffret',
  form: { nom: '', email: '', adresse: '', ville: '', pays: 'France' },
  error: null,
  pending: false,
  reference: null,
};

/** Validation par étape. Rend la liste des champs manquants. */
function missingFields(step, form) {
  if (step !== 'livraison') return [];
  return ['nom', 'email', 'adresse', 'ville'].filter((k) => !form[k]?.trim());
}

export default function CommandePage() {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const items = useCartStore((s) => s.items);
  const granted = useCartStore((s) => s.grantedSamples());
  const subtotal = useCartStore((s) => s.subtotal());
  const clearCart = useCartStore((s) => s.clearCart);

  const [touched, setTouched] = useState({});
  const missing = missingFields(state.step, state.form);

  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  /** Point de branchement unique du paiement. */
  const submitOrder = useCallback(async () => {
    dispatch({ type: 'PENDING' });
    try {
      // ── À brancher ici : Stripe PaymentIntent, Wave, Orange Money… ──
      // const res = await fetch(`${API}/api/orders`, { method:'POST', body: ... });
      // if (!res.ok) throw new Error('Paiement refusé');
      await new Promise((r) => setTimeout(r, 900)); // simulation
      const reference = `BP-${Date.now().toString(36).toUpperCase().slice(-6)}`;
      clearCart();
      dispatch({ type: 'DONE', reference });
    } catch (e) {
      dispatch({ type: 'ERROR', message: e.message || 'Le paiement n’a pas abouti.' });
    }
  }, [clearCart]);

  const stepIndex = STEPS.indexOf(state.step);

  /* ── Panier vide, hors confirmation ── */
  if (!items.length && state.step !== 'confirmé') {
    return (
      <main className="min-h-screen bg-[#faf9f8] pt-32 text-center">
        <p className="font-serif text-3xl uppercase tracking-widest">Panier vide</p>
        <Link
          href="/collection"
          className="mt-8 inline-block border border-[#1a1a1a] px-8 py-3 text-[10px]
            uppercase tracking-[0.35em] transition-colors hover:bg-[#1a1a1a] hover:text-[#faf9f8]"
        >
          La collection
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf9f8] pt-28 pb-24 text-[#1a1a1a]">
      <div className="mx-auto max-w-5xl px-6 md:px-10">
        {/* ── Fil d'étapes ── */}
        <ol className="mb-14 flex items-center gap-3" aria-label="Étapes de commande">
          {STEPS.map((s, i) => (
            <li key={s} className="flex flex-1 items-center gap-3">
              <span
                className="t--2 whitespace-nowrap transition-colors duration-500"
                style={{
                  color: i <= stepIndex ? 'var(--accent-ink)' : 'var(--ink-muted)',
                  opacity: i <= stepIndex ? 1 : 0.5,
                }}
                aria-current={i === stepIndex ? 'step' : undefined}
              >
                {String(i + 1).padStart(2, '0')} {s}
              </span>
              {i < STEPS.length - 1 && (
                <span className="h-[1px] flex-1 bg-[#ebd5c1]">
                  <span
                    className="block h-full transition-[width] duration-700"
                    style={{
                      width: i < stepIndex ? '100%' : '0%',
                      background: 'var(--accent)',
                    }}
                  />
                </span>
              )}
            </li>
          ))}
        </ol>

        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr]">
          {/* ═══ COLONNE ÉTAPE ═══ */}
          <section>
            {state.step === 'coffret' && (
              <div className="card-fadein">
                <h1 className="t-3 font-serif uppercase tracking-widest">Votre coffret</h1>
                <p className="measure mt-4 t--1 text-ink-muted">
                  Chaque commande ouvre droit à des échantillons 2 ml, offerts.
                  Choisissez-les : c’est ainsi qu’on trouve son prochain parfum.
                </p>
                <div className="mt-8">
                  <SampleSelector />
                </div>
              </div>
            )}

            {state.step === 'livraison' && (
              <div className="card-fadein">
                <h1 className="t-3 font-serif uppercase tracking-widest">Livraison</h1>
                <div className="mt-8 grid gap-7 sm:grid-cols-2">
                  {[
                    ['nom', 'Nom complet', 'text', 'name'],
                    ['email', 'Adresse e-mail', 'email', 'email'],
                    ['adresse', 'Adresse', 'text', 'street-address'],
                    ['ville', 'Ville', 'text', 'address-level2'],
                    ['pays', 'Pays', 'text', 'country-name'],
                  ].map(([name, label, type, autoComplete]) => {
                    const invalid = touched[name] && !state.form[name]?.trim();
                    const filled = Boolean(state.form[name]?.trim());
                    return (
                      <label
                        key={name}
                        className={name === 'adresse' ? 'sm:col-span-2' : undefined}
                      >
                        <span className="t--2 block text-ink-muted">{label}</span>
                        <input
                          type={type}
                          name={name}
                          autoComplete={autoComplete}
                          value={state.form[name]}
                          onChange={(e) =>
                            dispatch({ type: 'FIELD', name, value: e.target.value })
                          }
                          onBlur={() => setTouched((t) => ({ ...t, [name]: true }))}
                          aria-invalid={invalid || undefined}
                          className="mt-2 w-full border-b bg-transparent pb-2 pt-1
                            text-[13px] tracking-wide outline-none transition-colors duration-300"
                          style={{
                            borderColor: invalid
                              ? '#9b2c3f'
                              : filled
                                ? 'var(--accent)'
                                : 'rgba(235,213,193,0.9)',
                          }}
                        />
                        {/* Pulse de validation : le trait confirme, sans texte */}
                        <span
                          aria-hidden="true"
                          className="mt-1 block h-[1px] origin-left transition-transform duration-500"
                          style={{
                            background: 'var(--accent)',
                            transform: filled ? 'scaleX(1)' : 'scaleX(0)',
                          }}
                        />
                        {invalid && (
                          <span className="mt-1 block t--2 text-[#9b2c3f]">Champ requis</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {state.step === 'paiement' && (
              <div className="card-fadein">
                <h1 className="t-3 font-serif uppercase tracking-widest">Paiement</h1>
                <p className="measure mt-4 t--1 text-ink-muted">
                  Aucune donnée bancaire ne transite par nos serveurs.
                </p>
                <div className="frost mt-8 p-8">
                  <p className="t--2 text-ink-accent">Module de paiement</p>
                  <p className="mt-3 font-serif text-[1.272rem] italic text-ink-muted">
                    Emplacement réservé à l’intégration (Stripe Elements, Wave,
                    Orange Money). La logique est isolée dans{' '}
                    <code className="not-italic">submitOrder()</code>.
                  </p>
                </div>
                {state.error && (
                  <p role="alert" className="mt-5 t--1 text-[#9b2c3f]">
                    {state.error}
                  </p>
                )}
              </div>
            )}

            {state.step === 'confirmé' && (
              <div className="py-10 text-center lg:col-span-2 lg:text-left">
                {/* Sceau : le trait se dessine, puis le cercle respire */}
                <svg viewBox="0 0 80 80" className="mx-auto h-24 w-24 lg:mx-0" aria-hidden="true">
                  <circle
                    cx="40"
                    cy="40"
                    r="37"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="1"
                    strokeDasharray="233"
                    className="animate-draw-ring"
                  />
                  <path
                    d="M25 41 L36 52 L56 30"
                    fill="none"
                    stroke="var(--accent-ink)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="52"
                    className="animate-draw-check"
                  />
                </svg>
                <h1 className="t-3 mt-8 font-serif uppercase tracking-widest">
                  Commande confirmée
                </h1>
                <p className="measure mx-auto mt-4 t--1 text-ink-muted lg:mx-0">
                  Référence {state.reference}. Un e-mail de confirmation vous
                  attend. Vos échantillons voyagent avec le flacon.
                </p>
                <Link
                  href="/collection"
                  className="mt-10 inline-block border border-[#1a1a1a] px-9 py-3.5
                    t--2 transition-colors hover:bg-[#1a1a1a] hover:text-[#faf9f8]"
                >
                  Retour à la collection
                </Link>
              </div>
            )}

            {/* ── Navigation ── */}
            {state.step !== 'confirmé' && (
              <div className="mt-12 flex items-center gap-6">
                {stepIndex > 0 && (
                  <button
                    onClick={() => dispatch({ type: 'BACK' })}
                    className="t--2 text-ink-muted transition-colors hover:text-[#1a1a1a]"
                  >
                    ← Retour
                  </button>
                )}
                <button
                  onClick={() => {
                    if (missing.length) {
                      setTouched(Object.fromEntries(missing.map((m) => [m, true])));
                      return;
                    }
                    if (state.step === 'paiement') submitOrder();
                    else dispatch({ type: 'NEXT' });
                  }}
                  disabled={state.pending}
                  data-magnetic="cta"
                  data-cursor-label={state.step === 'paiement' ? 'Régler' : 'Continuer'}
                  className="relative overflow-hidden border border-[#1a1a1a] px-10 py-4
                    t--2 transition-colors duration-500 hover:bg-[#1a1a1a]
                    hover:text-[#faf9f8] disabled:opacity-40"
                >
                  {state.pending
                    ? 'Traitement…'
                    : state.step === 'paiement'
                      ? `Régler ${formatPrice(total)}`
                      : 'Continuer'}
                </button>
              </div>
            )}
          </section>

          {/* ═══ COLONNE RÉCAPITULATIF ═══ */}
          {state.step !== 'confirmé' && (
            <aside className="frost h-fit p-7 lg:sticky lg:top-32">
              <h2 className="t--2 text-ink-accent">Récapitulatif</h2>

              <ul className="mt-6 space-y-4">
                {items.map((i) => {
                  return (
                    <li key={`${i._id}-${i.ml}`} className="flex justify-between gap-4">
                      <span>
                        <span className="block font-serif text-[15px] uppercase tracking-wider">
                          {i.name}
                        </span>
                        <span className="t--2 text-ink-muted">
                          {i.ml} ml × {i.quantity}
                        </span>
                      </span>
                      <span className="whitespace-nowrap text-[13px] tabular-nums">
                        {formatPrice(i.price * i.quantity)}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {/* Échantillons offerts : visibles, à 0 € assumé */}
              {granted.length > 0 && (
                <ul className="mt-5 space-y-2 border-t border-[#ebd5c1]/50 pt-5">
                  {granted.map((s) => (
                    <li key={s._id} className="flex justify-between gap-4">
                      <span className="t--2 text-ink-accent">
                        {s.name} · 2 ml
                      </span>
                      <span className="t--2 text-ink-accent">Offert</span>
                    </li>
                  ))}
                </ul>
              )}

              <dl className="mt-6 space-y-2 border-t border-[#ebd5c1]/50 pt-5 text-[12px]">
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Sous-total</dt>
                  <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Livraison</dt>
                  <dd className="tabular-nums">
                    {shipping === 0 ? 'Offerte' : formatPrice(shipping)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-[#ebd5c1]/50 pt-3">
                  <dt className="font-serif text-[1.272rem] uppercase tracking-wider">Total</dt>
                  <dd className="font-serif text-[1.272rem] tabular-nums">
                    {formatPrice(total)}
                  </dd>
                </div>
              </dl>
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}
