'use client';

/**
 * ═══════════════════════════════════════════════════════════════
 *  /collection — LA COLLECTION
 * ═══════════════════════════════════════════════════════════════
 *  Refonte à iso-thème. Ce qui change :
 *
 *   · FAMILY_COLOR supprimé → les couleurs viennent de lib/olfactory.
 *   · Texte d'accent passé en `accentInk` (≥ 7:1). L'ancien rose en
 *     texte était à 2.70:1 : illisible au soleil, non conforme.
 *   · Chaque carte scope ses propres tokens : survoler une carte boisée
 *     change SA lumière, sans repeindre la grille (contain: paint).
 *   · Filtres famille + tri, branchés sur l'API qui les acceptait déjà.
 *   · `data-cursor-notes` → le curseur lit la pyramide au survol.
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getPerfumes } from '@/lib/api';
import { family, FAMILIES, familyVars } from '@/lib/olfactory';
import { formatPrice } from '@/lib/money';

const SORTS = [
  { key: 'curated', label: 'Sélection' },
  { key: 'price-asc', label: 'Prix croissant' },
  { key: 'price-desc', label: 'Prix décroissant' },
  { key: 'name', label: 'A → Z' },
];

/* ─── Skeleton ─── */
function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-sm bg-white">
      <div className="aspect-[3/4] bg-gradient-to-b from-gray-100 to-gray-50" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded bg-gray-100" />
        <div className="h-3 w-1/2 rounded bg-gray-100" />
        <div className="h-3 w-full rounded bg-gray-100" />
      </div>
    </div>
  );
}

/* ─── Carte parfum ─── */
function PerfumeCard({ product, index }) {
  const f = family(product.family);
  const minPrice = product.sizes?.length
    ? Math.min(...product.sizes.map((s) => s.price))
    : null;
  const image = product.images?.[0] || null;

  // Les notes lues par le curseur magnétique.
  const notes = [
    product.notes?.top?.[0],
    product.notes?.heart?.[0],
    product.notes?.base?.[0],
  ]
    .filter(Boolean)
    .join('  ·  ');

  return (
    <Link
      href={`/collection/${product.slug}`}
      data-magnetic="card"
      data-magnetic-pull="0.12"
      data-cursor-notes={notes || undefined}
      data-cursor-label="Découvrir"
      style={{ ...familyVars(product.family), animationDelay: `${(index % 6) * 0.08}s` }}
      className="card-fadein contain-card gpu group flex flex-col overflow-hidden
        bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      {/* Visuel */}
      <div
        className="relative aspect-[3/4] overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #faf9f8 0%, #f0ece6 100%)' }}
      >
        <span
          className="absolute left-3 top-3 z-10 bg-[#1a1a1a] px-3 py-1.5 text-[8px]
            uppercase tracking-[0.35em] text-[#ebd5c1]"
        >
          {product.status}
        </span>

        <span
          className="absolute right-3 top-3 z-10 text-[8px] font-semibold uppercase
            capitalize tracking-[0.25em]"
          style={{ color: 'var(--accent-ink)' }}
        >
          {f.label}
        </span>

        {image ? (
          <>
            <img
              src={image}
              alt={product.name}
              loading={index < 4 ? 'eager' : 'lazy'}
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700
                group-hover:scale-105"
            />
            <div
              className="absolute inset-0 opacity-0 transition-opacity duration-700
                group-hover:opacity-100"
              style={{
                background: `linear-gradient(to top, ${f.accent}40 0%, transparent 60%)`,
              }}
            />
          </>
        ) : (
          /* Flacon dessiné : le fallback d'origine, repris sur les tokens */
          <>
            <div
              className="absolute inset-0 opacity-0 transition-opacity duration-1000
                group-hover:opacity-100"
              style={{
                background: `radial-gradient(circle at 50% 65%, ${f.accent}22 0%, transparent 68%)`,
              }}
            />
            <div className="flex h-full w-full items-center justify-center">
              <div className="flex flex-col items-center transition-transform duration-700 group-hover:scale-110">
                <div className="h-5 w-9" style={{ backgroundColor: f.accent }} />
                <div
                  className="frost relative h-36 w-24"
                  style={{ borderWidth: 3, borderColor: `${f.accent}55` }}
                >
                  <div className="absolute inset-4 border border-white/50" />
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-center">
                    <div className="text-[5px] uppercase tracking-widest text-[#1a1a1a]/30">
                      {product.name.slice(0, 10)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Barre couleur famille */}
      <div className="h-[2px] w-full" style={{ backgroundColor: f.accent }} />

      {/* Infos */}
      <div className="flex flex-1 flex-col p-4">
        <h3
          className="mb-1 font-serif text-lg uppercase tracking-wider text-[#1a1a1a]
            transition-opacity duration-300 group-hover:opacity-70"
        >
          {product.name}
        </h3>
        <p
          className="mb-2 text-[9px] font-semibold uppercase tracking-[0.25em]"
          style={{ color: 'var(--accent-ink)' }}
        >
          {product.notes?.heart?.slice(0, 3).join('  ·  ')}
        </p>
        <p className="mb-4 line-clamp-2 flex-1 text-[11px] italic leading-relaxed text-ink-muted">
          {product.description}
        </p>
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          {minPrice !== null && (
            <span
              className="text-sm font-semibold tracking-wide tabular-nums"
              style={{ color: 'var(--accent-ink)' }}
            >
              dès {formatPrice(minPrice)}
            </span>
          )}
          <span
            className="border-b border-[#1a1a1a] pb-0.5 text-[8px] uppercase
              tracking-[0.35em] text-[#1a1a1a] transition-all duration-300
              group-hover:border-[color:var(--accent-ink)]"
          >
            Découvrir
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ══════════════════════════════════════
   PAGE
══════════════════════════════════════ */
export default function CollectionPage() {
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [activeFamily, setActiveFamily] = useState(null);
  const [sort, setSort] = useState('curated');

  useEffect(() => {
    setLoading(true);
    getPerfumes({ limit: 100 })
      .then((data) => {
        setPerfumes(data.perfumes || []);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /** Filtre + tri côté client : le catalogue tient en une requête. */
  const shown = useMemo(() => {
    let list = activeFamily ? perfumes.filter((p) => p.family === activeFamily) : perfumes;
    const price = (p) =>
      p.sizes?.length ? Math.min(...p.sizes.map((s) => s.price)) : Infinity;
    list = [...list];
    if (sort === 'price-asc') list.sort((a, b) => price(a) - price(b));
    if (sort === 'price-desc') list.sort((a, b) => price(b) - price(a));
    if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    return list;
  }, [perfumes, activeFamily, sort]);

  /** Familles réellement présentes : pas de filtre qui ne rend rien. */
  const availableFamilies = useMemo(() => {
    const present = new Set(perfumes.map((p) => p.family));
    return Object.values(FAMILIES).filter((f) => present.has(f.key));
  }, [perfumes]);

  return (
    <main className="min-h-screen bg-[#faf9f8] pt-28 text-[#1a1a1a]">
      {/* ── HERO ── */}
      <div className="w-full border-b border-[#ebd5c1]/40 px-6 py-12 md:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 t--2 font-semibold text-ink-accent">Haute Parfumerie</p>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h1 className="t-6 font-serif uppercase tracking-widest text-[#1a1a1a]">
              La Collection
            </h1>
            <div className="max-w-xs">
              <p className="t--1 leading-relaxed tracking-[0.2em] text-ink-muted">
                {total} fragrance{total > 1 ? 's' : ''} — chacune une œuvre d&apos;art olfactive.
              </p>
              {/* Passerelle vers l'épreuve : le vrai point d'entrée du site */}
              <Link
                href="/signature"
                data-magnetic="cta"
                data-cursor-label="12 matières"
                className="mt-4 inline-block border-b border-[color:var(--ink-rose)] pb-1
                  t--2 text-ink-accent transition-opacity hover:opacity-60"
              >
                Trouver ma signature →
              </Link>
            </div>
          </div>
          <div
            className="mt-8 h-[2px] w-24"
            style={{ background: 'linear-gradient(90deg, #c687a3, transparent)' }}
          />
        </div>
      </div>

      {/* ── FILTRES ── */}
      {!loading && perfumes.length > 0 && (
        <div className="sticky top-[4.5rem] z-30 border-b border-[#ebd5c1]/40 bg-[#faf9f8]/88 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-6 py-4 md:px-16">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2" role="group" aria-label="Filtrer par famille">
              <button
                onClick={() => setActiveFamily(null)}
                aria-pressed={activeFamily === null}
                className="target-safe t--2 transition-opacity hover:opacity-100"
                style={{
                  color: activeFamily === null ? 'var(--color-dark-2)' : 'var(--ink-muted)',
                  opacity: activeFamily === null ? 1 : 0.65,
                  borderBottom: activeFamily === null ? '1px solid currentColor' : 'none',
                  paddingBottom: 2,
                }}
              >
                Toutes
              </button>
              {availableFamilies.map((f) => {
                const on = activeFamily === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setActiveFamily(on ? null : f.key)}
                    aria-pressed={on}
                    data-magnetic="cta"
                    data-magnetic-pull="0.2"
                    className="target-safe t--2 transition-opacity hover:opacity-100"
                    style={{
                      color: on ? f.accentInk : 'var(--ink-muted)',
                      opacity: on ? 1 : 0.65,
                      borderBottom: on ? `1px solid ${f.accentInk}` : 'none',
                      paddingBottom: 2,
                    }}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            <div className="ml-auto flex items-center gap-3">
              <label htmlFor="tri" className="t--2 text-ink-muted">
                Trier
              </label>
              <select
                id="tri"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="border-b border-[#ebd5c1] bg-transparent pb-1 t--2
                  text-[#1a1a1a] outline-none"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ── GRILLE ── */}
      <div className="w-full px-6 py-10 pb-24 md:px-16">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : shown.length > 0 ? (
            <>
              <p className="sr-only" aria-live="polite">
                {shown.length} parfums affichés
              </p>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
                {shown.map((p, i) => (
                  <PerfumeCard key={p._id} product={p} index={i} />
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-6 py-36 text-center">
              <div className="font-serif text-5xl text-[#c687a3]/30">◎</div>
              <p className="t--2 text-ink-muted">
                {activeFamily
                  ? 'Aucun parfum dans cette famille.'
                  : 'Aucun parfum disponible pour le moment.'}
              </p>
              {activeFamily && (
                <button
                  onClick={() => setActiveFamily(null)}
                  className="t--2 text-ink-accent underline-offset-4 hover:underline"
                >
                  Voir toute la collection
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
