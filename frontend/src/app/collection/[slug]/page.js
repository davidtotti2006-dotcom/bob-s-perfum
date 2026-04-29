'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getPerfume } from '@/lib/api';
import useCartStore from '@/store/cartStore';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const FAMILY_COLOR = {
  floral:     '#c687a3',
  boisé:      '#b38b59',
  oriental:   '#c4944a',
  frais:      '#6aabb0',
  musqué:     '#9b8ea8',
  aromatique: '#7a8c6e',
};

/* ─── Pyramide olfactive améliorée ─── */
function OlfactivePyramid({ notes, color }) {
  const layers = [
    {
      label: 'Tête', sublabel: 'Notes de tête · volatiles',
      items: notes?.top,
      color: color,
      width: '58%',
      opacity: '55',
    },
    {
      label: 'Cœur', sublabel: 'Notes de cœur · caractère',
      items: notes?.heart,
      color: color,
      width: '80%',
      opacity: '88',
    },
    {
      label: 'Fond', sublabel: 'Notes de fond · persistance',
      items: notes?.base,
      color: color,
      width: '100%',
      opacity: 'ff',
    },
  ];

  return (
    <div className="space-y-3">
      {layers.map(({ label, sublabel, items, color: c, width, opacity }) => (
        <div key={label} className="flex items-stretch gap-5 group">
          {/* Label */}
          <div className="w-14 flex-shrink-0 flex flex-col justify-center">
            <p className="text-[9px] tracking-[0.3em] uppercase text-gray-400">{label}</p>
            <p className="text-[7px] tracking-[0.1em] text-gray-300 mt-0.5 hidden md:block">{sublabel}</p>
          </div>
          {/* Barre */}
          <div
            className="flex-1 py-3 px-5 flex items-center transition-all duration-500 group-hover:translate-x-1"
            style={{
              borderLeft: `3px solid ${c}${opacity}`,
              maxWidth: width,
              background: `linear-gradient(90deg, ${c}08 0%, transparent 100%)`,
            }}
          >
            <p className="text-[11px] tracking-[0.15em] text-[#1a1a1a] leading-relaxed">
              {items?.join('  ·  ')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════
   PAGE PRODUIT
═══════════════════════════════════════ */
export default function ProductPage() {
  const { slug } = useParams();
  const [perfume, setPerfume]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [added, setAdded]           = useState(false);
  const { addItem } = useCartStore();

  const genesisRef = useScrollReveal(0.1);

  useEffect(() => {
    getPerfume(slug)
      .then((data) => {
        setPerfume(data);
        setSelectedSize(data.sizes?.[0] || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    if (!selectedSize || !perfume) return;
    addItem(perfume, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <main className="min-h-screen bg-[#fdfbf7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-10 h-14 border-2 border-[#c687a3]/30 relative animate-pulse">
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[6px] tracking-widest font-serif text-[#1a1a1a]/30">Bob's</div>
          </div>
          <p className="text-[9px] tracking-[0.5em] uppercase text-[#c687a3]">Ouverture des archives…</p>
        </div>
      </main>
    );
  }

  /* ── 404 ── */
  if (!perfume) {
    return (
      <main className="min-h-screen bg-[#fdfbf7] flex flex-col items-center justify-center gap-8">
        <p className="font-serif text-4xl text-gray-200">◎</p>
        <p className="text-xs tracking-[0.3em] uppercase text-gray-400">Ce flacon n'existe pas dans nos archives.</p>
        <Link href="/collection"
          className="text-[9px] tracking-[0.3em] uppercase text-[#c687a3] border-b border-[#c687a3] pb-1">
          Retour à la collection
        </Link>
      </main>
    );
  }

  const color    = FAMILY_COLOR[perfume.family] || '#c687a3';
  const minPrice = perfume.sizes?.length
    ? Math.min(...perfume.sizes.map((s) => s.price)) : null;

  return (
    <main className="min-h-screen bg-[#fdfbf7] text-[#1a1a1a]">

      {/* ── Barre couleur famille en haut ── */}
      <div className="w-full h-1" style={{ background: `linear-gradient(90deg, ${color}, ${color}60, transparent)` }} />

      {/* ── BREADCRUMB ── */}
      <div className="px-8 md:px-16 pt-24 pb-4 border-b border-[#ebd5c1]/30">
        <div className="max-w-7xl mx-auto flex items-center gap-3 text-[9px] tracking-[0.3em] uppercase text-gray-400">
          <Link href="/" className="hover:text-[#c687a3] transition-colors">Maison</Link>
          <span className="text-gray-200">—</span>
          <Link href="/collection" className="hover:text-[#c687a3] transition-colors">Collection</Link>
          <span className="text-gray-200">—</span>
          <span style={{ color }}>{perfume.name}</span>
        </div>
      </div>

      {/* ── CONTENU PRINCIPAL ── */}
      <div className="max-w-7xl mx-auto px-8 md:px-16 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">

          {/* Colonne gauche — Visuel */}
          <div className="relative group">
            {/* Cadre décalé */}
            <div className="absolute -inset-4 -z-10 translate-x-4 translate-y-4
              group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700"
              style={{ border: `1px solid ${color}25` }} />

            <div className="aspect-[4/5] relative overflow-hidden"
              style={{ background: `linear-gradient(160deg, #faf9f8 0%, #f0ece6 100%)` }}>

              {/* Badges */}
              <span className="absolute top-6 left-6 z-10 text-[8px] tracking-[0.35em] uppercase
                bg-[#1a1a1a] text-[#ebd5c1] px-4 py-2">
                {perfume.status}
              </span>
              <span className="absolute top-6 right-6 z-10 text-[8px] tracking-[0.2em] uppercase capitalize font-medium"
                style={{ color }}>
                {perfume.family}
              </span>

              {perfume.images?.[0] ? (
                <>
                  <img
                    src={perfume.images[0]}
                    alt={perfume.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ background: `linear-gradient(to top, ${color}25 0%, transparent 55%)` }} />
                </>
              ) : (
                <>
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ background: `radial-gradient(circle at 50% 60%, ${color}15 0%, transparent 65%)` }} />
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="flex flex-col items-center group-hover:scale-105 transition-transform duration-700 animate-float">
                      <div className="w-12 h-7" style={{ backgroundColor: color }} />
                      <div className="w-36 h-52 relative bg-white/50 backdrop-blur-sm shadow-2xl"
                        style={{ border: `4px solid ${color}60` }}>
                        <div className="absolute inset-4 border border-white/40" />
                        <div className="absolute inset-8 border border-white/20" />
                        <div className="absolute top-6 left-5 w-3 h-16 bg-white/25 rounded-full" />
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
                          <div className="text-[8px] tracking-[0.45em] font-serif text-[#1a1a1a]/50 mb-1">
                            {perfume.name.toUpperCase().slice(0, 12)}
                          </div>
                        </div>
                      </div>
                      <div className="w-28 h-4 rounded-full mt-2 blur-md" style={{ background: `${color}20` }} />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
                </>
              )}
            </div>
          </div>

          {/* Colonne droite — Informations */}
          <div className="flex flex-col justify-center space-y-6">

            {/* Famille + Titre */}
            <div>
              <p className="text-[9px] tracking-[0.55em] uppercase font-medium mb-2 capitalize" style={{ color }}>
                {perfume.family}
              </p>
              <h1 className="text-4xl md:text-5xl font-serif uppercase tracking-widest text-[#1a1a1a] leading-[1.05]">
                {perfume.name}
              </h1>
              <div className="w-12 h-[3px] mt-4 rounded-full"
                style={{ background: `linear-gradient(90deg, ${color}, ${color}40)` }} />
            </div>

            {/* Description */}
            <p className="text-sm leading-loose text-gray-500 italic tracking-wide">
              {perfume.description}
            </p>

            {/* Pyramide olfactive */}
            <div className="space-y-3">
              <p className="text-[9px] tracking-[0.45em] uppercase text-gray-300 font-medium">Pyramide Olfactive</p>
              <OlfactivePyramid notes={perfume.notes} color={color} />
            </div>

            {/* Sélecteur format */}
            <div className="space-y-3">
              <p className="text-[9px] tracking-[0.45em] uppercase text-gray-300 font-medium">Format</p>
              <div className="flex gap-2 flex-wrap">
                {perfume.sizes?.map((size) => {
                  const isSelected = selectedSize?.ml === size.ml;
                  const isOut      = size.stock === 0;
                  return (
                    <button key={size.ml} onClick={() => !isOut && setSelectedSize(size)}
                      disabled={isOut}
                      className={`flex flex-col items-center px-5 py-3 border transition-all duration-300 min-w-[80px] relative overflow-hidden
                        ${isOut ? 'opacity-40 cursor-not-allowed border-gray-100 bg-white' : 'cursor-pointer'}`}
                      style={isSelected ? { borderColor: color, background: `${color}0a` } : { borderColor: '#ebd5c1', background: 'white' }}>
                      {isSelected && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: color }} />
                      )}
                      <span className="text-sm font-medium text-[#1a1a1a] tracking-wide">{size.ml} ml</span>
                      <span className="text-[11px] tracking-[0.15em] mt-0.5 font-semibold"
                        style={{ color: isSelected ? color : '#6b7280' }}>
                        {size.price} €
                      </span>
                      {size.stock <= 5 && size.stock > 0 && (
                        <span className="text-[7px] tracking-widest uppercase mt-0.5" style={{ color }}>
                          {size.stock} restant{size.stock > 1 ? 's' : ''}
                        </span>
                      )}
                      {isOut && <span className="text-[7px] tracking-widest uppercase text-gray-300 mt-0.5">Épuisé</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-3">
              <button onClick={handleAddToCart}
                disabled={!selectedSize || selectedSize?.stock === 0}
                className="w-full py-5 text-[9px] tracking-[0.55em] uppercase font-medium
                  transition-all duration-500 relative overflow-hidden"
                style={{
                  background: added
                    ? `linear-gradient(135deg, ${color}, ${color}cc)`
                    : selectedSize?.stock === 0
                      ? '#f3f4f6'
                      : '#1a1a1a',
                  color: added ? '#fff' : selectedSize?.stock === 0 ? '#9ca3af' : '#fdfbf7',
                  cursor: selectedSize?.stock === 0 ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!added && selectedSize?.stock !== 0) {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${color}, ${color}cc)`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!added && selectedSize?.stock !== 0) {
                    e.currentTarget.style.background = '#1a1a1a';
                  }
                }}>
                {added
                  ? '✦ Ajouté à votre sélection'
                  : selectedSize?.stock === 0
                    ? 'Épuisé'
                    : `Acquérir — ${selectedSize?.price ?? '—'} €`}
              </button>

              <div className="flex items-center justify-center gap-6 text-[8px] tracking-[0.2em] uppercase text-gray-300">
                <span>Livraison offerte en France</span>
                <span style={{ color }}>·</span>
                <span>Retours 14 jours</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── LA GENÈSE ── */}
        {perfume.story && (
          <div ref={genesisRef} className="mt-12 border-t pt-12 reveal" style={{ borderColor: `${color}25` }}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-3 flex flex-col gap-3 reveal">
                <p className="text-[9px] tracking-[0.5em] uppercase" style={{ color }}>La Genèse</p>
                <div className="w-6 h-[1px]" style={{ backgroundColor: color }} />
              </div>
              <div className="md:col-span-9 reveal reveal-delay-2">
                <div className="font-serif text-6xl leading-none mb-2 select-none" style={{ color: `${color}15` }}>"</div>
                <blockquote className="font-serif text-xl md:text-2xl italic text-[#1a1a1a] leading-relaxed -mt-4">
                  {perfume.story}
                </blockquote>
              </div>
            </div>
          </div>
        )}

        {/* ── RETOUR COLLECTION ── */}
        <div className="mt-10 pt-8 border-t border-[#ebd5c1]/30 text-center">
          <Link href="/collection"
            className="inline-block border border-[#1a1a1a] text-[#1a1a1a] px-16 py-4
              text-[9px] tracking-[0.5em] uppercase relative group overflow-hidden">
            <span className="relative z-10 group-hover:text-white transition-colors duration-500">
              Explorer la collection
            </span>
            <span className="absolute inset-0 scale-x-0 group-hover:scale-x-100 origin-left
              transition-transform duration-500 z-0"
              style={{ background: `linear-gradient(90deg, ${color}, ${color}cc)` }} />
          </Link>
        </div>
      </div>
    </main>
  );
}
