'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getPerfumes } from '@/lib/api';

const FAMILY_COLOR = {
  floral: '#c687a3', boisé: '#b38b59', oriental: '#c4944a',
  frais: '#6aabb0',  musqué: '#9b8ea8', aromatique: '#7a8c6e',
};

/* ─── Skeleton ─── */
function SkeletonCard() {
  return (
    <div className="bg-white animate-pulse overflow-hidden rounded-sm">
      <div className="aspect-[3/4] bg-gradient-to-b from-gray-100 to-gray-50" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-full" />
      </div>
    </div>
  );
}

/* ─── Carte parfum ─── */
function PerfumeCard({ product, index }) {
  const color    = FAMILY_COLOR[product.family] || '#c687a3';
  const minPrice = product.sizes?.length
    ? Math.min(...product.sizes.map((s) => s.price)) : null;
  const image    = product.images?.[0] || null;

  return (
    <Link
      href={`/collection/${product.slug}`}
      style={{ animationDelay: `${(index % 6) * 0.08}s` }}
      className="group flex flex-col bg-white shadow-sm hover:shadow-xl
        hover:-translate-y-1 transition-all duration-500 overflow-hidden card-fadein"
    >
      {/* Visuel */}
      <div className="aspect-[3/4] relative overflow-hidden"
        style={{ background: `linear-gradient(160deg, #faf9f8 0%, #f0ece6 100%)` }}>

        <span className="absolute top-3 left-3 z-10 text-[8px] tracking-[0.35em] uppercase
          bg-[#1a1a1a] text-[#ebd5c1] px-3 py-1.5">
          {product.status}
        </span>

        <span className="absolute top-3 right-3 z-10 text-[8px] tracking-[0.25em] uppercase capitalize font-medium"
          style={{ color }}>
          {product.family}
        </span>

        {image ? (
          <>
            <img
              src={image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{ background: `linear-gradient(to top, ${color}40 0%, transparent 60%)` }} />
          </>
        ) : (
          <>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
              style={{ background: `radial-gradient(circle at 50% 65%, ${color}22 0%, transparent 68%)` }} />
            <div className="w-full h-full flex items-center justify-center">
              <div className="flex flex-col items-center group-hover:scale-110 transition-transform duration-700">
                <div className="w-9 h-5" style={{ backgroundColor: color }} />
                <div className="w-24 h-36 relative bg-white/50 backdrop-blur-sm shadow-2xl"
                  style={{ border: `3px solid ${color}55` }}>
                  <div className="absolute inset-4 border border-white/50" />
                  <div className="absolute top-5 left-4 w-2 h-10 bg-white/30 rounded-full" />
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-center">
                    <div className="text-[5px] tracking-widest text-[#1a1a1a]/30 uppercase">
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
      <div className="h-[2px] w-full" style={{ backgroundColor: color }} />

      {/* Infos */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-serif uppercase tracking-wider text-[#1a1a1a] mb-1
          group-hover:opacity-70 transition-opacity duration-300">
          {product.name}
        </h3>
        <p className="text-[9px] tracking-[0.25em] uppercase mb-2 font-medium" style={{ color }}>
          {product.notes?.heart?.slice(0, 3).join('  ·  ')}
        </p>
        <p className="text-[11px] leading-relaxed text-gray-400 mb-4 line-clamp-2 flex-1 italic">
          {product.description}
        </p>
        <div className="flex justify-between items-center border-t border-gray-100 pt-3">
          {minPrice !== null && (
            <span className="text-sm font-semibold tracking-wide" style={{ color }}>
              dès {minPrice} €
            </span>
          )}
          <span className="text-[8px] tracking-[0.35em] uppercase border-b pb-0.5
            border-[#1a1a1a] text-[#1a1a1a] group-hover:border-[#c687a3] group-hover:text-[#c687a3]
            transition-all duration-300">
            Découvrir
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ══════════════════════════════════════
   PAGE COLLECTION
══════════════════════════════════════ */
export default function CollectionPage() {
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [total, setTotal]       = useState(0);

  useEffect(() => {
    setLoading(true);
    getPerfumes({ limit: 100 })
      .then((data) => {
        setPerfumes((data.perfumes || []).filter(p => p.images?.length > 0));
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#faf9f8] text-[#1a1a1a] pt-28">

      {/* ── HERO ── */}
      <div className="w-full px-6 md:px-16 py-12 border-b border-[#ebd5c1]/40">
        <div className="max-w-7xl mx-auto">
          <p className="text-[9px] tracking-[0.55em] uppercase font-medium mb-3 text-[#c687a3]">
            Haute Parfumerie
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h1 className="text-5xl md:text-7xl font-serif uppercase tracking-widest text-[#1a1a1a]">
              La Collection
            </h1>
            <p className="text-xs tracking-[0.2em] text-gray-400 max-w-xs leading-relaxed">
              {total} fragrance{total > 1 ? 's' : ''} — chacune une œuvre d'art olfactive.
            </p>
          </div>
          <div className="w-24 h-[2px] mt-8"
            style={{ background: 'linear-gradient(90deg, #c687a3, transparent)' }} />
        </div>
      </div>

      {/* ── GRILLE ── */}
      <div className="w-full px-6 md:px-16 py-10 pb-24">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[1,2,3,4,5,6,7,8].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : perfumes.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {perfumes.map((p, i) => <PerfumeCard key={p._id} product={p} index={i} />)}
            </div>
          ) : (
            <div className="text-center py-36 space-y-6">
              <div className="font-serif text-5xl text-[#c687a3]/30">◎</div>
              <p className="text-xs tracking-[0.3em] uppercase text-gray-400">
                Aucun parfum disponible pour le moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
