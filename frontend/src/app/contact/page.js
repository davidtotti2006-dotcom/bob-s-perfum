'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const SERVICES = [
  { icon: '◈', color: '#c687a3', title: 'Consultation Privée',    desc: "Un rendez-vous d'une heure avec notre parfumeur pour trouver votre signature olfactive.", detail: 'Sur invitation — Paris & Abidjan' },
  { icon: '◉', color: '#b38b59', title: 'Composition Sur-Mesure', desc: "Votre parfum unique, conçu exclusivement pour vous en trois sessions d'écriture olfactive.", detail: 'Délai 6–8 semaines' },
  { icon: '◎', color: '#6aabb0', title: 'Coffret Découverte',      desc: 'Cinq miniatures sélectionnées selon votre profil. Le premier pas dans la Maison.', detail: 'Livraison 72h' },
];

export default function ContactPage() {
  const services = useScrollReveal(0.08);
  const content  = useScrollReveal(0.08);
  const [form, setForm]   = useState({ nom: '', email: '', sujet: '', message: '' });
  const [sent, setSent]   = useState(false);
  const [focus, setFocus] = useState('');

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => { e.preventDefault(); setSent(true); };

  return (
    <main className="min-h-screen bg-[#faf9f8] text-[#1a1a1a] overflow-x-hidden">

      {/* HERO */}
      <section className="relative h-[50vh] min-h-[320px] flex flex-col items-center justify-center text-center overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0a0a0a 0%, #0d0b10 40%, #09090c 100%)' }}>
        <div className="absolute w-[350px] h-[350px] rounded-full blur-[130px] pointer-events-none animate-breathe"
          style={{ top: '10%', left: '5%', background: 'rgba(198,135,163,0.1)' }} />
        <div className="absolute w-[280px] h-[280px] rounded-full blur-[100px] pointer-events-none animate-breathe"
          style={{ bottom: '5%', right: '5%', background: 'rgba(106,171,176,0.08)', animationDelay: '2s' }} />
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg, transparent, #c687a3, #b38b59, #6aabb0, transparent)' }} />
        <div className="relative z-10 px-8">
          <p className="text-[9px] tracking-[0.65em] uppercase text-[#c687a3] mb-5">Bob's</p>
          <h1 className="font-serif text-5xl md:text-7xl uppercase tracking-widest leading-none
            bg-gradient-to-r from-[#e8b5ce] via-[#c687a3] to-[#b38b59] bg-clip-text text-transparent animate-gradient-text pb-2">
            Contact
          </h1>
          <div className="w-12 h-[1px] mx-auto mt-7 mb-5" style={{ background: 'linear-gradient(90deg, #c687a3, #b38b59)' }} />
          <p className="text-[10px] tracking-[0.25em] text-gray-500 font-light max-w-xs mx-auto">
            Du lundi au samedi, 10h — 19h.
          </p>
        </div>
      </section>

      {/* SERVICES */}
      <section ref={services} className="py-12 bg-[#fdfbf7] border-b border-[#ebd5c1]/30">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="text-center mb-8 space-y-2">
            <p className="text-[9px] tracking-[0.6em] uppercase text-[#c687a3] reveal">Nos Services</p>
            <h2 className="font-serif text-2xl md:text-4xl uppercase tracking-widest inline-block pb-1
              bg-gradient-to-r from-[#e8b5ce] via-[#c687a3] to-[#b38b59] bg-clip-text text-transparent animate-gradient-text reveal reveal-delay-1">
              Comment Pouvons-Nous Vous Aider ?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[#ebd5c1]/40">
            {SERVICES.map((s, i) => (
              <div key={s.title}
                className={`reveal reveal-delay-${i + 1} group p-8 border-b md:border-b-0
                  border-[#ebd5c1]/40 ${i < 2 ? 'md:border-r' : ''}
                  hover:bg-[#1a1a1a] transition-all duration-700 cursor-default relative overflow-hidden`}>
                <div className="absolute bottom-0 left-0 w-0 h-[3px] group-hover:w-full transition-all duration-700"
                  style={{ backgroundColor: s.color }} />
                <div className="relative z-10">
                  <div className="font-serif text-3xl mb-5 leading-none transition-colors duration-700"
                    style={{ color: `${s.color}45` }}
                    onMouseEnter={(e) => e.currentTarget.style.color = `${s.color}80`}
                    onMouseLeave={(e) => e.currentTarget.style.color = `${s.color}45`}>
                    {s.icon}
                  </div>
                  <h3 className="font-serif text-lg uppercase tracking-widest text-[#1a1a1a] group-hover:text-[#fdfbf7] transition-colors duration-700 mb-3">
                    {s.title}
                  </h3>
                  <div className="w-6 h-[2px] mb-4 group-hover:w-10 transition-all duration-700" style={{ backgroundColor: s.color }} />
                  <p className="text-[11px] leading-loose text-gray-500 group-hover:text-gray-400 transition-colors duration-700 mb-4">{s.desc}</p>
                  <p className="text-[8px] tracking-[0.35em] uppercase" style={{ color: s.color }}>{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORMULAIRE + INFOS */}
      <section ref={content} className="py-14 px-8 md:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-14">

          {/* Informations */}
          <div className="space-y-10 reveal-left">
            <div className="space-y-4">
              <p className="text-[9px] tracking-[0.6em] uppercase text-[#c687a3]">Nos Ateliers</p>
              <h2 className="font-serif text-2xl md:text-4xl uppercase tracking-widest leading-[1.1]">
                Venez Nous<br />
                <span className="italic bg-gradient-to-r from-[#c687a3] to-[#b38b59] bg-clip-text text-transparent animate-gradient-text">
                  Rencontrer.
                </span>
              </h2>
              <div className="w-10 h-[2px]" style={{ background: 'linear-gradient(90deg, #c687a3, #b38b59)' }} />
            </div>

            {/* Paris */}
            <div className="space-y-3 group cursor-default">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 group-hover:h-12 transition-all duration-500 rounded-full"
                  style={{ background: 'linear-gradient(180deg, #c687a3, #e8b5ce)' }} />
                <div>
                  <h4 className="font-serif text-lg uppercase tracking-widest">Paris</h4>
                  <p className="text-[9px] tracking-[0.3em] uppercase text-[#c687a3]">Atelier Principal</p>
                </div>
              </div>
              <div className="ml-4 space-y-1 text-[11px] tracking-[0.15em] text-gray-500 font-light uppercase">
                <p>12, Rue du Faubourg Saint-Honoré</p>
                <p>75008 Paris, France</p>
                <p className="text-[#c687a3] font-medium">contact@maisonb.fr</p>
                <p>+33 1 42 XX XX XX</p>
              </div>
            </div>

            {/* Abidjan */}
            <div className="space-y-3 group cursor-default">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 group-hover:h-12 transition-all duration-500 rounded-full"
                  style={{ background: 'linear-gradient(180deg, #b38b59, #e0b97a)' }} />
                <div>
                  <h4 className="font-serif text-lg uppercase tracking-widest">Abidjan</h4>
                  <p className="text-[9px] tracking-[0.3em] uppercase text-[#b38b59]">Atelier Afrique</p>
                </div>
              </div>
              <div className="ml-4 space-y-1 text-[11px] tracking-[0.15em] text-gray-500 font-light uppercase">
                <p>Marcory Zone 4</p>
                <p>Abidjan, Côte d'Ivoire</p>
                <p className="font-medium" style={{ color: '#b38b59' }}>abidjan@maisonb.fr</p>
                <p>+225 07 XX XX XX XX</p>
              </div>
            </div>

            {/* Horaires */}
            <div className="border-t border-[#ebd5c1]/40 pt-6 space-y-3">
              <p className="text-[9px] tracking-[0.5em] uppercase text-gray-400 font-medium">Horaires</p>
              <div className="space-y-2">
                {[
                  { jours: 'Lundi — Vendredi', heure: '10h — 19h', color: '#c687a3' },
                  { jours: 'Samedi',           heure: '11h — 18h', color: '#b38b59' },
                  { jours: 'Dimanche',         heure: 'Fermé',     color: '#9ca3af' },
                ].map((h) => (
                  <div key={h.jours} className="flex justify-between max-w-xs items-center">
                    <span className="text-[10px] tracking-[0.15em] uppercase text-gray-400">{h.jours}</span>
                    <span className="text-[10px] tracking-[0.15em] uppercase font-medium" style={{ color: h.color }}>{h.heure}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div className="reveal-right">
            <div className="space-y-3 mb-8">
              <p className="text-[9px] tracking-[0.6em] uppercase text-[#c687a3]">Écrivez-nous</p>
              <h2 className="font-serif text-2xl md:text-3xl uppercase tracking-widest leading-tight">
                Un Message,<br />
                <span className="italic bg-gradient-to-r from-[#c687a3] to-[#6aabb0] bg-clip-text text-transparent animate-gradient-text">
                  Une Rencontre.
                </span>
              </h2>
            </div>

            {sent ? (
              <div className="py-16 text-center space-y-6">
                <div className="font-serif text-5xl animate-float" style={{ color: '#c687a3' }}>✦</div>
                <h3 className="font-serif text-2xl uppercase tracking-widest">Message Reçu</h3>
                <div className="w-10 h-[1px] mx-auto" style={{ background: 'linear-gradient(90deg, #c687a3, #b38b59)' }} />
                <p className="text-[11px] leading-loose text-gray-500 italic">
                  Nous vous répondrons dans les 24 heures ouvrées.
                </p>
                <button onClick={() => setSent(false)}
                  className="text-[9px] tracking-[0.3em] uppercase text-[#c687a3] border-b border-[#c687a3] pb-1">
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-7">
                {[
                  { name: 'nom',   label: 'Votre Nom',      type: 'text',  placeholder: 'Prénom Nom' },
                  { name: 'email', label: 'Adresse E-mail', type: 'email', placeholder: 'votre@email.com' },
                ].map((field) => (
                  <div key={field.name} className="space-y-1.5">
                    <label className="text-[8px] tracking-[0.5em] uppercase"
                      style={{ color: focus === field.name ? '#c687a3' : '#9ca3af' }}>
                      {field.label}
                    </label>
                    <input type={field.type} name={field.name} value={form[field.name]}
                      onChange={handleChange} onFocus={() => setFocus(field.name)} onBlur={() => setFocus('')}
                      placeholder={field.placeholder} required
                      className="w-full bg-transparent border-b outline-none py-2.5 text-[11px] tracking-[0.15em] text-[#1a1a1a] placeholder:text-gray-300 transition-colors duration-300"
                      style={{ borderColor: focus === field.name ? '#c687a3' : '#ebd5c1' }} />
                  </div>
                ))}

                <div className="space-y-1.5">
                  <label className="text-[8px] tracking-[0.5em] uppercase"
                    style={{ color: focus === 'sujet' ? '#c687a3' : '#9ca3af' }}>Sujet</label>
                  <select name="sujet" value={form.sujet} onChange={handleChange}
                    onFocus={() => setFocus('sujet')} onBlur={() => setFocus('')} required
                    className="w-full bg-transparent border-b outline-none py-2.5 text-[11px] tracking-[0.15em] text-[#1a1a1a] transition-colors duration-300 appearance-none"
                    style={{ borderColor: focus === 'sujet' ? '#c687a3' : '#ebd5c1' }}>
                    <option value="" disabled>Choisir un sujet…</option>
                    <option value="consultation">Consultation Privée</option>
                    <option value="surmesure">Parfum Sur-Mesure</option>
                    <option value="commande">Commande &amp; Livraison</option>
                    <option value="presse">Presse &amp; Médias</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] tracking-[0.5em] uppercase"
                    style={{ color: focus === 'message' ? '#c687a3' : '#9ca3af' }}>Votre Message</label>
                  <textarea name="message" value={form.message} onChange={handleChange}
                    onFocus={() => setFocus('message')} onBlur={() => setFocus('')}
                    placeholder="Décrivez votre demande…" rows={4} required
                    className="w-full bg-transparent border-b outline-none py-2.5 text-[11px] tracking-[0.12em] leading-loose text-[#1a1a1a] placeholder:text-gray-300 transition-colors duration-300 resize-none"
                    style={{ borderColor: focus === 'message' ? '#c687a3' : '#ebd5c1' }} />
                </div>

                <button type="submit"
                  className="w-full py-4 text-[9px] tracking-[0.6em] uppercase font-medium bg-[#1a1a1a] text-[#fdfbf7] relative group overflow-hidden">
                  <span className="relative z-10">Envoyer le Message</span>
                  <span className="absolute inset-0 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 z-0"
                    style={{ background: 'linear-gradient(90deg, #c687a3, #b38b59)' }} />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="w-full border-t border-[#ebd5c1]/30 py-10 text-center bg-[#fdfbf7]">
        <Link href="/collection"
          className="inline-block border border-[#1a1a1a] text-[#1a1a1a] px-16 py-4
            text-[9px] tracking-[0.5em] uppercase relative group overflow-hidden">
          <span className="relative z-10 group-hover:text-white transition-colors duration-500">Découvrir la Collection</span>
          <span className="absolute inset-0 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 z-0"
            style={{ background: 'linear-gradient(90deg, #c687a3, #b38b59)' }} />
        </Link>
      </div>
    </main>
  );
}
