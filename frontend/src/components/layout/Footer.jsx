import Link from 'next/link';

const LINKS = {
  Maisons:  [{ label: 'Atelier Paris', href: '#' }, { label: 'Atelier Abidjan', href: '#' }],
  Services: [{ label: 'Consultation Privée', href: '/contact' }, { label: 'Livraison & Retours', href: '#' }],
  Maison:   [{ label: 'Notre Histoire', href: '/a-propos' }, { label: 'Nous Contacter', href: '/contact' }, { label: 'La Collection', href: '/collection' }],
};

export default function Footer() {
  return (
    <footer className="w-full bg-[#0a0a0a] text-[#fdfbf7] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(198,135,163,0.05)_0%,transparent_60%)] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-8 md:px-16 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-10">

          {/* Brand */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <Link href="/">
              <span className="font-serif text-3xl tracking-[0.3em] bg-clip-text text-transparent inline-block pb-1"
                style={{ backgroundImage: 'linear-gradient(135deg, #f8ecc0 0%, #e0b97a 35%, #c4944a 60%, #f5e0a0 100%)' }}>
                Bob's
              </span>
            </Link>
            <div className="space-y-1">
              <p className="text-[9px] text-gray-500 tracking-[0.4em] uppercase font-medium">L'art de l'invisible.</p>
              <p className="text-[9px] text-gray-600 tracking-[0.3em] uppercase">Paris &amp; Abidjan</p>
            </div>
            <p className="text-[11px] leading-loose text-gray-600 font-light max-w-xs">
              Des fragrances d'exception pour les âmes singulières. Chaque flacon est une œuvre d'art olfactive.
            </p>
            <div className="w-10 h-[1px]" style={{ background: 'linear-gradient(90deg, #c687a3, transparent)' }} />
          </div>

          {/* Links */}
          <div className="md:col-span-5 grid grid-cols-3 gap-6">
            {Object.entries(LINKS).map(([title, items]) => (
              <div key={title} className="space-y-4">
                <h5 className="text-[9px] tracking-[0.4em] uppercase text-[#c687a3] font-medium">{title}</h5>
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li key={item.label}>
                      <Link href={item.href}
                        className="text-[10px] tracking-[0.15em] uppercase text-gray-500 hover:text-[#c687a3] transition-colors duration-300 font-light">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact / Social */}
          <div className="md:col-span-3 flex flex-col gap-5">
            <h5 className="text-[9px] tracking-[0.4em] uppercase text-[#c687a3] font-medium">Contact</h5>
            <div className="space-y-2 text-[10px] tracking-[0.15em] text-gray-500 font-light uppercase">
              <p>contact@maisonb.fr</p>
              <p>+33 1 XX XX XX XX</p>
            </div>
            <div className="h-[1px] bg-white/5 w-full" />
            <div className="space-y-2">
              <p className="text-[9px] tracking-[0.4em] uppercase text-gray-600">Suivez la Maison</p>
              <div className="flex gap-4">
                {['Instagram', 'Pinterest', 'TikTok'].map((s) => (
                  <a key={s} href="#"
                    className="text-[8px] tracking-[0.3em] uppercase text-gray-600 hover:text-[#c687a3]
                      transition-colors duration-300 border-b border-transparent hover:border-[#c687a3] pb-0.5">
                    {s}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <span className="text-[9px] tracking-[0.3em] text-gray-600 uppercase">
            © 2026 Bob's Paris — Tous droits réservés.
          </span>
          <div className="flex gap-6 text-[9px] tracking-[0.3em] uppercase">
            {['Mentions Légales', 'Confidentialité', 'CGV'].map((t) => (
              <a key={t} href="#" className="text-gray-600 hover:text-[#c687a3] transition-colors duration-300">{t}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
