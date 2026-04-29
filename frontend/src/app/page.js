'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const SAVOIR_FAIRE = [
  { num: '01', title: 'La Rareté',    sub: 'des Matières',  color: '#c687a3', desc: "Chaque ingrédient est sélectionné parmi les sources les plus précieuses du monde." },
  { num: '02', title: "L'Artisanat", sub: 'Ancestral',     color: '#b38b59', desc: "Nos parfumeurs perpétuent des techniques séculaires — enfleurage, distillation à l'ancienne." },
  { num: '03', title: "L'Histoire",  sub: 'Vivante',       color: '#6aabb0', desc: "Chaque fragrance est un récit entre Paris et Abidjan, entre tradition et modernité." },
  { num: '04', title: 'La Signature', sub: 'Éternelle',    color: '#9b8ea8', desc: "Une fragrance Bob's ne se porte pas — elle se vit. Une empreinte indélébile." },
];

const CHIFFRES = [
  { value: 10,  suffix: '+', label: "Années d'Excellence",    color: '#c687a3' },
  { value: 8,   suffix: '',  label: 'Familles Olfactives',    color: '#b38b59' },
  { value: 2,   suffix: '',  label: 'Ateliers dans le Monde', color: '#6aabb0' },
  { value: 100, suffix: '%', label: 'Ingrédients Naturels',   color: '#9b8ea8' },
];

const FAMILY_COLOR = {
  floral: '#c687a3', boisé: '#b38b59', oriental: '#c4944a',
  frais: '#6aabb0',  musqué: '#9b8ea8', aromatique: '#7a8c6e',
};

function AnimatedNumber({ target, suffix, color, visible }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let n = 0;
    const step = target / (1600 / 16);
    const id = setInterval(() => {
      n += step;
      if (n >= target) { setVal(target); clearInterval(id); }
      else setVal(Math.floor(n));
    }, 16);
    return () => clearInterval(id);
  }, [visible, target]);
  return <span style={{ color }}>{val}{suffix}</span>;
}

export default function Home() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [chiffresVisible, setChiffresVisible] = useState(false);
  const chiffresRef = useRef(null);

  const foundatrice = useScrollReveal(0.1);
  const savoirFaire = useScrollReveal(0.08);
  const collection  = useScrollReveal(0.08);
  const atelier     = useScrollReveal(0.1);
  const newsletter  = useScrollReveal(0.15);

  useEffect(() => {
    const onMove = (e) => setMousePos({
      x: (e.clientX / window.innerWidth  - 0.5) * 45,
      y: (e.clientY / window.innerHeight - 0.5) * 45,
    });
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    const el = chiffresRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setChiffresVisible(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-[#faf9f8] text-[#1a1a1a] overflow-x-hidden">

      {/* HERO */}
      <section className="relative h-screen w-full overflow-hidden bg-[#0a0a0a]">
        <img src="/bobs-accueil.jpeg" alt="" aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{
            transform: `scale(1.05) translate(${mousePos.x * 0.012}px, ${mousePos.y * 0.012}px)`,
            transition: 'transform 1.2s cubic-bezier(0.25,0.46,0.45,0.94)',
          }} />
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
          <div className="w-[1px] h-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/50 to-transparent animate-scroll-cue" />
          </div>
        </div>
      </section>

      {/* BANDEAU */}
      <div className="w-full bg-[#1a1a1a] py-3 border-y border-[#c687a3]/15 overflow-hidden marquee-wrapper">
        <div className="flex animate-marquee">
          {[0, 1].map((n) => (
            <div key={n} className="flex items-center gap-8 px-4 flex-shrink-0">
              {[
                { label: 'Moonlight', color: '#9b8ea8' },
                { label: 'Heure Sauvage', color: '#b38b59' },
                { label: 'Rose de Damas', color: '#c687a3' },
                { label: 'Oud Impérial', color: '#c4944a' },
                { label: 'Néroli Absolu', color: '#6aabb0' },
                { label: 'Haute Parfumerie', color: '#c687a3' },
              ].map((item) => (
                <span key={item.label} className="flex items-center gap-8">
                  <span className="text-[8px] tracking-[0.4em] uppercase whitespace-nowrap font-light" style={{ color: item.color }}>
                    {item.label}
                  </span>
                  <span className="text-sm select-none text-[#333]">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* FONDATRICE */}
      <section ref={foundatrice} className="py-8 px-8 md:px-16 max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-center">
        <div className="w-full md:w-1/2 relative group reveal-left">
          <div className="absolute -inset-3 border border-[#c687a3]/20 translate-x-3 translate-y-3 -z-10
            group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-1000" />
          <div className="aspect-[4/5] overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000 shadow-xl relative">
            <img src="/fondatrice2.png" alt="Fondatrice Bob's"
              className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-[1500ms]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          </div>
          <div className="absolute bottom-5 left-5 text-[8px] tracking-[0.4em] uppercase text-white z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            La Visionnaire
          </div>
        </div>
        <div className="w-full md:w-1/2 space-y-5 text-center md:text-left reveal-right">
          <p className="text-[9px] tracking-[0.55em] uppercase text-[#c687a3] font-semibold">L'Âme de la Maison</p>
          <h2 className="text-3xl md:text-5xl font-serif uppercase tracking-widest leading-[1.1]">
            Une quête <br />
            <span className="italic bg-gradient-to-r from-[#e8b5ce] via-[#c687a3] to-[#b38b59] bg-clip-text text-transparent animate-gradient-text">
              de l'absolu.
            </span>
          </h2>
          <div className="w-10 h-[2px] mx-auto md:mx-0" style={{ background: 'linear-gradient(90deg, #c687a3, #b38b59)' }} />
          <p className="text-sm tracking-[0.08em] font-light leading-loose text-gray-500 italic">
            "Je voulais une fragrance qui raconte une histoire sans dire un mot.
            Bob's est né de cette envie d'offrir une signature invisible, mais inoubliable."
          </p>
          <div className="pt-3 border-t border-gray-100 inline-block pr-10">
            <p className="text-xs tracking-[0.35em] uppercase font-bold text-[#1a1a1a]">A. B.</p>
            <p className="text-[9px] tracking-[0.3em] uppercase text-[#c687a3] mt-1">Fondatrice &amp; Directrice de Création</p>
          </div>
        </div>
      </section>

      {/* SAVOIR-FAIRE */}
      <section ref={savoirFaire} className="py-8 bg-[#fdfbf7] border-y border-[#ebd5c1]/30">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="text-center mb-8 space-y-2">
            <p className="text-[9px] tracking-[0.6em] uppercase text-[#c687a3] reveal">Notre Philosophie</p>
            <h2 className="text-3xl md:text-5xl font-serif uppercase tracking-widest inline-block pb-1 reveal reveal-delay-1
              bg-gradient-to-r from-[#e8b5ce] via-[#c687a3] to-[#b38b59] bg-clip-text text-transparent animate-gradient-text">
              Savoir-Faire
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-[#ebd5c1]/40">
            {SAVOIR_FAIRE.map((item, i) => (
              <div key={item.num}
                className={`reveal reveal-delay-${i + 1} group relative p-6
                  border-b md:border-b-0 border-[#ebd5c1]/40 ${i < 3 ? 'md:border-r' : ''}
                  transition-all duration-700 overflow-hidden cursor-default hover:bg-[#1a1a1a]`}>
                <div className="absolute bottom-0 left-0 w-0 h-[3px] group-hover:w-full transition-all duration-700"
                  style={{ backgroundColor: item.color }} />
                <div className="relative z-10">
                  <span className="font-serif text-4xl leading-none block mb-3" style={{ color: `${item.color}30` }}>{item.num}</span>
                  <h3 className="font-serif text-lg uppercase tracking-widest leading-tight text-[#1a1a1a] group-hover:text-[#fdfbf7] transition-colors duration-700">
                    {item.title}
                    <span className="block italic text-base mt-0.5" style={{ color: item.color }}>{item.sub}</span>
                  </h3>
                  <div className="w-6 h-[1px] my-3 group-hover:w-10 transition-all duration-700" style={{ backgroundColor: item.color }} />
                  <p className="text-[10px] leading-relaxed text-gray-500 group-hover:text-gray-400 transition-colors duration-700">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COLLECTION */}
      <section ref={collection} className="bg-[#080808]">
        <div className="max-w-7xl mx-auto px-8 md:px-16 pt-12 pb-6 flex flex-col md:flex-row justify-between items-end">
          <div className="reveal">
            <p className="text-[9px] tracking-[0.65em] uppercase text-[#c687a3] mb-2 font-medium">Nos Créations</p>
            <h2 className="font-serif text-4xl md:text-6xl uppercase tracking-[0.15em] text-white leading-none">La Collection</h2>
          </div>
          <Link href="/collection"
            className="mt-4 md:mt-0 text-[9px] tracking-[0.4em] uppercase text-white/40
              hover:text-[#c687a3] transition-colors duration-500 border-b border-white/15 hover:border-[#c687a3] pb-1 reveal reveal-delay-3">
            Voir toute la gamme →
          </Link>
        </div>
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, #c687a3, #b38b59, transparent)' }} />
        </div>

        {/* Moonlight & Heure Sauvage */}
        <div className="grid grid-cols-1 md:grid-cols-2 mt-1">
          {/* Moonlight */}
          <Link href="/collection/moonlight" className="group relative overflow-hidden block" style={{ aspectRatio: '4/5' }}>
            <img src="/images/moonlight-bobs.jpeg" alt="Moonlight"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
              style={{ background: 'linear-gradient(to top, rgba(198,135,163,0.3) 0%, transparent 55%)' }} />
            <div className="absolute top-5 left-5 space-y-1">
              <p className="text-[7px] tracking-[0.6em] uppercase text-white/30">Bob's Paris</p>
              <p className="text-[7px] tracking-[0.4em] uppercase text-[#c687a3]/60">Édition Signature</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-7 translate-y-2 group-hover:translate-y-0 transition-transform duration-700">
              <p className="text-[7px] tracking-[0.5em] uppercase text-[#c687a3] mb-2">Floral · Oriental · Musqué</p>
              <h3 className="font-serif text-4xl md:text-5xl uppercase tracking-[0.1em] text-white leading-none mb-3">Moonlight</h3>
              <p className="text-sm font-serif text-[#c687a3] mb-3">dès 175 €</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-[1px] w-6 bg-[#c687a3] group-hover:w-10 transition-all duration-700" />
                <span className="text-[7px] tracking-[0.4em] uppercase text-white/25">Bob's Paris</span>
              </div>
              <div className="text-[8px] tracking-[0.4em] uppercase text-white/40 group-hover:text-white transition-colors duration-500 flex items-center gap-2">
                <span>Découvrir</span><span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"
              style={{ background: 'linear-gradient(90deg, #c687a3, #e8b5ce)' }} />
          </Link>

          {/* Heure Sauvage */}
          <Link href="/collection/heure-sauvage" className="group relative overflow-hidden block" style={{ aspectRatio: '4/5' }}>
            <img src="/images/l-heure-sauvage-bobs.jpeg" alt="Heure Sauvage"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
              style={{ background: 'linear-gradient(to top, rgba(179,139,89,0.3) 0%, transparent 55%)' }} />
            <div className="absolute top-5 left-5 space-y-1">
              <p className="text-[7px] tracking-[0.6em] uppercase text-white/30">Bob's Paris</p>
              <p className="text-[7px] tracking-[0.4em] uppercase text-[#b38b59]/60">Édition Signature</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-7 translate-y-2 group-hover:translate-y-0 transition-transform duration-700">
              <p className="text-[7px] tracking-[0.5em] uppercase text-[#b38b59] mb-2">Boisé · Épicé · Sensuel</p>
              <h3 className="font-serif text-4xl md:text-5xl uppercase tracking-[0.1em] text-white leading-none mb-3">Heure Sauvage</h3>
              <p className="text-sm font-serif text-[#b38b59] mb-3">dès 195 €</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-[1px] w-6 bg-[#b38b59] group-hover:w-10 transition-all duration-700" />
                <span className="text-[7px] tracking-[0.4em] uppercase text-white/25">Bob's Paris</span>
              </div>
              <div className="text-[8px] tracking-[0.4em] uppercase text-white/40 group-hover:text-white transition-colors duration-500 flex items-center gap-2">
                <span>Découvrir</span><span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"
              style={{ background: 'linear-gradient(90deg, #b38b59, #e0b97a)' }} />
          </Link>
        </div>

        <div className="text-center py-8 reveal">
          <Link href="/collection"
            className="inline-flex items-center gap-4 border border-white/15 text-white/60 px-10 py-3
              text-[8px] tracking-[0.5em] uppercase hover:border-[#c687a3] hover:text-white transition-all duration-500">
            <span>Découvrir toute la collection</span><span>→</span>
          </Link>
        </div>
      </section>

      {/* CHIFFRES */}
      <div ref={chiffresRef} className="w-full py-8 border-y border-white/05 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #111018 50%, #0f0a0a 100%)' }}>
        <div className="max-w-7xl mx-auto px-8 md:px-16 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {CHIFFRES.map((c, i) => (
              <div key={c.label} className="space-y-2"
                style={{
                  opacity: chiffresVisible ? 1 : 0,
                  transform: chiffresVisible ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity 0.8s ease ${i * 0.15}s, transform 0.8s ease ${i * 0.15}s`,
                }}>
                <div className="font-serif text-4xl md:text-5xl leading-none tracking-tight">
                  <AnimatedNumber target={c.value} suffix={c.suffix} color={c.color} visible={chiffresVisible} />
                </div>
                <div className="w-6 h-[1px] mx-auto" style={{ backgroundColor: c.color }} />
                <p className="text-[8px] tracking-[0.4em] uppercase text-gray-500">{c.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* L'ATELIER */}
      <section ref={atelier} className="relative py-8 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0a0a0a 0%, #0d0b10 40%, #090c0c 100%)' }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_25%_50%,rgba(198,135,163,0.08)_0%,transparent_55%)]" />
        <div className="max-w-7xl mx-auto px-8 md:px-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <p className="text-[9px] tracking-[0.6em] uppercase text-[#c687a3] reveal">L'Expérience Olfactive</p>
              <h2 className="font-serif text-3xl md:text-5xl uppercase tracking-wider leading-[1.1] reveal reveal-delay-1">
                <span className="text-[#fdfbf7]">Ressentir</span><br />
                <span className="italic" style={{ color: '#c687a3' }}>l'Invisible.</span>
              </h2>
              <div className="w-10 h-[1px] reveal reveal-delay-2" style={{ background: 'linear-gradient(90deg, #c687a3, #b38b59)' }} />
              <p className="text-sm leading-loose text-gray-500 font-light italic reveal reveal-delay-3 max-w-md">
                Un parfum Bob's n'est pas simplement une fragrance. C'est un état d'âme, une mémoire que vous offrez au monde.
              </p>
              <div className="reveal reveal-delay-4">
                <Link href="/a-propos"
                  className="inline-flex items-center gap-3 text-[9px] tracking-[0.4em] uppercase
                    text-[#c687a3] border-b border-[#c687a3]/50 pb-1 hover:border-[#c687a3] transition-all group">
                  <span>Découvrir l'Héritage</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 reveal-right">
              {Object.entries(FAMILY_COLOR).map(([family, color]) => (
                <div key={family} className="relative p-4 border transition-all duration-500 group overflow-hidden"
                  style={{ borderColor: `${color}18` }}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{ background: `linear-gradient(135deg, ${color}18 0%, transparent 100%)` }} />
                  <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500"
                    style={{ backgroundColor: color }} />
                  <div className="w-3 h-3 rounded-full mb-2 group-hover:scale-125 transition-transform duration-500"
                    style={{ backgroundColor: color }} />
                  <p className="text-[8px] tracking-[0.3em] uppercase text-gray-400 capitalize group-hover:text-white transition-colors duration-500">
                    {family}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="py-8 px-8 bg-[#fdfbf7] text-center border-y border-[#ebd5c1]/20">
        <div className="max-w-3xl mx-auto">
          <p className="text-[9px] tracking-[0.6em] uppercase text-[#c687a3] mb-5">Notre Manifeste</p>
          <blockquote className="font-serif text-2xl md:text-4xl text-[#1a1a1a] italic leading-relaxed">
            "Un parfum n'est pas un accessoire.<br />C'est une mémoire que l'on offre au monde."
          </blockquote>
          <div className="w-12 h-[1px] mx-auto mt-6 mb-4" style={{ background: 'linear-gradient(90deg, #e8b5ce, #c687a3, #b38b59)' }} />
          <p className="text-[9px] tracking-[0.5em] uppercase text-gray-400">Bob's — Paris &amp; Abidjan</p>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section ref={newsletter} className="py-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #1a1018 50%, #1a1a1a 100%)' }}>
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg, transparent, #c687a3, #b38b59, #c687a3, transparent)' }} />
        <div className="max-w-xl mx-auto px-8 text-center relative z-10">
          <p className="text-[9px] tracking-[0.6em] uppercase text-[#c687a3] mb-3 reveal">Le Cercle Privé</p>
          <h3 className="font-serif text-2xl md:text-3xl uppercase tracking-widest text-[#fdfbf7] mb-3 reveal reveal-delay-1">
            Entrez dans la Maison
          </h3>
          <div className="w-10 h-[1px] mx-auto mb-5 reveal reveal-delay-2" style={{ background: 'linear-gradient(90deg, #c687a3, #b38b59)' }} />
          <p className="text-[10px] leading-loose text-gray-500 italic mb-6 reveal reveal-delay-3">
            Accédez en avant-première aux nouvelles créations et aux éditions limitées.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col md:flex-row gap-3 reveal reveal-delay-4">
            <input type="email" placeholder="Votre adresse e-mail" required className="input-luxury flex-1 text-center md:text-left" />
            <button type="submit"
              className="bg-transparent border text-[8px] tracking-[0.5em] uppercase px-8 py-3 whitespace-nowrap transition-all duration-400"
              style={{ borderColor: '#c687a3', color: '#c687a3' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #c687a3, #b38b59)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'transparent'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#c687a3'; e.currentTarget.style.borderColor = '#c687a3'; }}>
              Rejoindre
            </button>
          </form>
        </div>
      </section>

    </main>
  );
}
