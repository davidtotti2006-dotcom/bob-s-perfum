'use client';

import Link from 'next/link';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const TIMELINE = [
  { year: '2013', title: 'La Naissance',        color: '#c687a3', desc: "Dans un petit atelier du Marais, A. B. quitte les grandes maisons parisiennes pour fonder sa propre vision de la parfumerie. Les premières formules naissent en secret." },
  { year: '2015', title: 'Le Premier Flacon',   color: '#b38b59', desc: "Oud Impérial voit le jour. Proposé uniquement sur invitation, il se propage de bouche à oreille dans les cercles les plus fermés de Paris et Abidjan." },
  { year: '2018', title: "L'Ouverture Abidjan", color: '#6aabb0', desc: "Le second atelier ouvre au Plateau. Une rencontre entre les épices de l'Afrique de l'Ouest et le raffinement parisien — une alchimie unique au monde." },
  { year: '2021', title: 'La Reconnaissance',   color: '#9b8ea8', desc: "Bob's reçoit la distinction de la Chambre Syndicale de la Haute Parfumerie. La Maison s'impose comme une référence de l'excellence olfactive contemporaine." },
  { year: '2026', title: "L'Avenir",            color: '#7a8c6e', desc: "Nouvelle collection capsule, collaborations artistiques inédites et ouverture d'une boutique éphémère à Tokyo." },
];

const VALEURS = [
  { icon: '◇', title: 'Rareté',      color: '#c687a3', desc: "Nous n'utilisons que ce qui est introuvable. La rareté n'est pas un prix — c'est un engagement." },
  { icon: '○', title: 'Intégrité',   color: '#b38b59', desc: "Chaque ingrédient est sourcé éthiquement, chaque formule respecte l'environnement." },
  { icon: '△', title: 'Excellence',  color: '#6aabb0', desc: "Pas de compromis. Chaque flacon est vérifié, chaque note calibrée, chaque sillage chronométré." },
  { icon: '□', title: 'Singularité', color: '#9b8ea8', desc: "Bob's ne crée pas pour les masses. Chaque fragrance est conçue pour une âme particulière." },
];

export default function AProposPage() {
  const story    = useScrollReveal(0.1);
  const timeline = useScrollReveal(0.06);
  const valeurs  = useScrollReveal(0.08);
  const cta      = useScrollReveal(0.15);

  return (
    <main className="min-h-screen bg-[#faf9f8] text-[#1a1a1a] overflow-x-hidden">

      {/* HERO */}
      <section className="relative h-[60vh] min-h-[380px] flex flex-col items-center justify-center text-center overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0a0a0a 0%, #0d0b10 40%, #09090c 100%)' }}>
        <div className="absolute w-[400px] h-[400px] rounded-full blur-[140px] pointer-events-none animate-breathe"
          style={{ top: '10%', left: '8%', background: 'rgba(198,135,163,0.1)' }} />
        <div className="absolute w-[300px] h-[300px] rounded-full blur-[110px] pointer-events-none animate-breathe"
          style={{ bottom: '5%', right: '8%', background: 'rgba(179,139,89,0.08)', animationDelay: '2s' }} />
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg, transparent, #c687a3, #b38b59, #6aabb0, transparent)' }} />
        <div className="relative z-10 px-8">
          <p className="text-[9px] tracking-[0.65em] uppercase text-[#c687a3] mb-6">Bob's</p>
          <h1 className="font-serif text-5xl md:text-8xl uppercase tracking-widest leading-none
            bg-gradient-to-r from-[#e8b5ce] via-[#c687a3] to-[#b38b59] bg-clip-text text-transparent animate-gradient-text pb-2">
            La Maison
          </h1>
          <div className="w-12 h-[1px] mx-auto mt-8 mb-6" style={{ background: 'linear-gradient(90deg, #c687a3, #b38b59)' }} />
          <p className="text-[10px] tracking-[0.25em] text-gray-500 font-light max-w-xs mx-auto">
            Une maison née d'une obsession pour le beau, l'intime et l'inoubliable.
          </p>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="w-[1px] h-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#c687a3] to-transparent animate-scroll-cue" />
          </div>
        </div>
      </section>

      {/* L'HISTOIRE */}
      <section ref={story} className="py-14 px-8 md:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="reveal">
              <p className="text-[9px] tracking-[0.6em] uppercase text-[#c687a3] mb-4">L'Origine</p>
              <h2 className="font-serif text-3xl md:text-5xl uppercase tracking-widest leading-[1.1]">
                Née d'un <br />
                <span className="italic bg-gradient-to-r from-[#e8b5ce] via-[#c687a3] to-[#b38b59] bg-clip-text text-transparent animate-gradient-text">
                  voyage.
                </span>
              </h2>
            </div>
            <div className="w-10 h-[1px] reveal reveal-delay-1" style={{ background: 'linear-gradient(90deg, #c687a3, #b38b59)' }} />
            <p className="text-sm leading-loose text-gray-500 font-light italic reveal reveal-delay-2">
              "Tout a commencé par une odeur. L'odeur de la pluie sur le sable rouge d'Abidjan,
              mêlée au souvenir du benjoin qui brûlait dans l'appartement de ma grand-mère à Paris."
            </p>
            <p className="text-[11px] leading-loose text-gray-400 font-light reveal reveal-delay-3">
              A. B. a grandi entre deux continents, deux cultures, deux façons de concevoir la beauté.
              Cette dualité est au cœur de chaque création Bob's.
            </p>
            <div className="pt-3 border-t border-gray-100 reveal reveal-delay-4">
              <p className="text-xs tracking-[0.35em] uppercase font-bold text-[#1a1a1a]">A. B.</p>
              <p className="text-[9px] tracking-[0.3em] uppercase text-[#c687a3] mt-1">Fondatrice &amp; Directrice de Création</p>
            </div>
          </div>
          <div className="relative group reveal-right">
            <div className="absolute -inset-3 border border-[#c687a3]/15 translate-x-3 translate-y-3 -z-10
              group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-1000" />
            <div className="aspect-[4/5] overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000 shadow-xl">
              <img src="/fondatrice2.png" alt="A. B., fondatrice"
                className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-[2000ms]" />
            </div>
            <div className="absolute -bottom-3 -right-3 w-20 h-20 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #c687a3, #b38b59)' }}>
              <div className="text-center text-white">
                <div className="font-serif text-xs">2013</div>
                <div className="text-[7px] tracking-[0.3em] uppercase mt-0.5">Paris</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section ref={timeline} className="py-14 bg-[#fdfbf7] border-y border-[#ebd5c1]/30">
        <div className="max-w-4xl mx-auto px-8 md:px-16">
          <div className="text-center mb-10 space-y-2">
            <p className="text-[9px] tracking-[0.6em] uppercase text-[#c687a3] reveal">Chronologie</p>
            <h2 className="font-serif text-3xl md:text-5xl uppercase tracking-widest inline-block pb-1
              bg-gradient-to-r from-[#e8b5ce] via-[#c687a3] to-[#b38b59] bg-clip-text text-transparent animate-gradient-text reveal reveal-delay-1">
              Les Étapes Clés
            </h2>
          </div>
          <div className="relative">
            <div className="absolute left-[55px] top-0 bottom-0 w-[2px] hidden md:block"
              style={{ background: 'linear-gradient(180deg, #c687a3, #b38b59, #6aabb0, #9b8ea8, #7a8c6e, transparent)' }} />
            <div className="space-y-10">
              {TIMELINE.map((item, i) => (
                <div key={item.year}
                  className={`reveal reveal-delay-${i + 1} flex flex-col md:flex-row gap-6 md:gap-12 items-start group`}>
                  <div className="flex-shrink-0 md:w-[110px] text-right">
                    <span className="font-serif text-2xl leading-none transition-colors duration-500"
                      style={{ color: `${item.color}55` }}
                      onMouseEnter={(e) => e.currentTarget.style.color = item.color}
                      onMouseLeave={(e) => e.currentTarget.style.color = `${item.color}55`}>
                      {item.year}
                    </span>
                  </div>
                  <div className="hidden md:flex flex-shrink-0 mt-1.5">
                    <div className="w-3 h-3 rounded-full border-2 transition-all duration-500"
                      style={{ borderColor: `${item.color}50`, backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = item.color; e.currentTarget.style.borderColor = item.color; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = `${item.color}50`; }} />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="font-serif text-xl uppercase tracking-widest text-[#1a1a1a]">{item.title}</h3>
                    <div className="w-6 h-[2px] transition-all duration-700 group-hover:w-12" style={{ backgroundColor: item.color }} />
                    <p className="text-[11px] leading-loose text-gray-500 font-light">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* VALEURS */}
      <section ref={valeurs} className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="text-center mb-8 space-y-2">
            <p className="text-[9px] tracking-[0.6em] uppercase text-[#c687a3] reveal">Ce en quoi nous croyons</p>
            <h2 className="font-serif text-3xl md:text-5xl uppercase tracking-widest inline-block pb-1
              bg-gradient-to-r from-[#e8b5ce] via-[#c687a3] to-[#b38b59] bg-clip-text text-transparent animate-gradient-text reveal reveal-delay-1">
              Nos Valeurs
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-[#ebd5c1]/40">
            {VALEURS.map((v, i) => (
              <div key={v.title}
                className={`reveal reveal-delay-${i + 1} group p-8 border-b md:border-b-0
                  border-[#ebd5c1]/40 ${i < 3 ? 'md:border-r' : ''}
                  transition-all duration-700 cursor-default hover:bg-[#1a1a1a] relative overflow-hidden`}>
                <div className="absolute bottom-0 left-0 w-0 h-[3px] group-hover:w-full transition-all duration-700"
                  style={{ backgroundColor: v.color }} />
                <div className="font-serif text-3xl mb-5 transition-colors duration-700" style={{ color: `${v.color}40` }}
                  onMouseEnter={(e) => e.currentTarget.style.color = `${v.color}70`}
                  onMouseLeave={(e) => e.currentTarget.style.color = `${v.color}40`}>
                  {v.icon}
                </div>
                <h3 className="font-serif text-xl uppercase tracking-widest text-[#1a1a1a] group-hover:text-[#fdfbf7] transition-colors duration-700 mb-3">
                  {v.title}
                </h3>
                <div className="w-6 h-[2px] mb-4 group-hover:w-10 transition-all duration-700" style={{ backgroundColor: v.color }} />
                <p className="text-[11px] leading-loose text-gray-500 group-hover:text-gray-400 transition-colors duration-700">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section ref={cta} className="py-14 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #1a1018 50%, #1a1a1a 100%)' }}>
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg, transparent, #c687a3, #b38b59, #6aabb0, transparent)' }} />
        <div className="max-w-3xl mx-auto px-8 text-center relative z-10 space-y-5">
          <p className="text-[9px] tracking-[0.6em] uppercase text-[#c687a3] reveal">La prochaine étape</p>
          <h2 className="font-serif text-3xl md:text-4xl uppercase tracking-widest text-[#fdfbf7] reveal reveal-delay-1">
            Découvrez la Collection
          </h2>
          <div className="w-10 h-[1px] mx-auto reveal reveal-delay-2" style={{ background: 'linear-gradient(90deg, #c687a3, #b38b59)' }} />
          <p className="text-[11px] leading-loose text-gray-500 italic reveal reveal-delay-3">
            Chaque flacon porte en lui l'histoire de la Maison. Choisissez votre signature.
          </p>
          <div className="flex flex-col md:flex-row gap-3 justify-center pt-4 reveal reveal-delay-4">
            <Link href="/collection"
              className="inline-block border border-[#fdfbf7] text-[#fdfbf7] px-12 py-4
                text-[9px] tracking-[0.5em] uppercase hover:bg-[#fdfbf7] hover:text-[#1a1a1a] transition-all duration-500">
              Explorer les Parfums
            </Link>
            <Link href="/contact"
              className="inline-block border text-[9px] tracking-[0.5em] uppercase px-12 py-4 transition-all duration-500"
              style={{ borderColor: '#c687a3', color: '#c687a3' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #c687a3, #b38b59)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'transparent'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#c687a3'; e.currentTarget.style.borderColor = '#c687a3'; }}>
              Consultation Privée
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
