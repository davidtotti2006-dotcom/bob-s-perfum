'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useCartStore from '@/store/cartStore';

const MENU_LINKS = [
  { href: '/collection', label: 'Parfums' },
  { href: '/a-propos', label: 'Maison' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { items, toggleCart } = useCartStore();
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const transparent = isHome && !isScrolled;

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-700 px-8 md:px-16 flex justify-between items-center uppercase tracking-[0.2em] text-[10px] md:text-xs font-medium ${
          transparent
            ? 'bg-transparent py-8'
            : 'bg-white/90 backdrop-blur-xl py-4 border-b border-[#ebd5c1]/40 shadow-sm'
        }`}
      >
        {/* Left */}
        <div className="flex gap-8 items-center">
          <button
            onClick={() => setIsMenuOpen((v) => !v)}
            className="hover:text-[#c687a3] transition-colors relative group"
            aria-label="Menu"
          >
            {isMenuOpen ? 'Fermer' : 'Menu'}
            <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-[#c687a3] transition-all duration-500 group-hover:w-full" />
          </button>
          <Link
            href="/collection"
            className="hidden md:inline-block hover:text-[#c687a3] transition-colors relative group"
          >
            Collection
            <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-[#c687a3] transition-all duration-500 group-hover:w-full" />
          </Link>
          <Link
            href="/a-propos"
            className="hidden md:inline-block hover:text-[#c687a3] transition-colors relative group"
          >
            Maison
            <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-[#c687a3] transition-all duration-500 group-hover:w-full" />
          </Link>
        </div>

        {/* Logo centré */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link href="/" className="block">
            <span
              className={`font-serif transition-all duration-700 bg-clip-text text-transparent leading-none ${
                transparent ? 'text-3xl tracking-[0.4em]' : 'text-xl tracking-[0.3em]'
              }`}
              style={{ backgroundImage: 'linear-gradient(135deg, #f8ecc0 0%, #e0b97a 35%, #c4944a 60%, #f5e0a0 100%)' }}
            >
              Bob's
            </span>
          </Link>
        </div>

        {/* Right */}
        <div className="flex gap-8 items-center">
          <Link
            href="/compte"
            className="hidden md:inline-block hover:text-[#c687a3] transition-colors relative group"
          >
            Compte
            <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-[#c687a3] transition-all duration-500 group-hover:w-full" />
          </Link>
          <button
            onClick={toggleCart}
            className="hover:text-[#c687a3] transition-colors"
            aria-label="Panier"
          >
            Panier{itemCount > 0 ? ` (${itemCount})` : ''}
          </button>
        </div>
      </nav>

      {/* Menu Overlay */}
      <div
        className={`fixed inset-0 bg-[#0a0a0a] z-40 flex flex-col items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(198,135,163,0.08)_0%,transparent_70%)]" />

        <ul className="text-center space-y-8 md:space-y-10 relative z-10">
          {MENU_LINKS.map(({ href, label }, i) => (
            <li
              key={href}
              style={{ transitionDelay: isMenuOpen ? `${i * 80}ms` : '0ms' }}
              className={`transition-all duration-500 ${
                isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <Link
                href={href}
                className="text-4xl md:text-7xl font-serif uppercase tracking-widest text-[#fdfbf7] hover:text-[#c687a3] hover:italic transition-all duration-400 block"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="absolute bottom-12 text-[#c687a3] text-[9px] tracking-[0.5em] uppercase opacity-60">
          L'art de l'invisible.
        </div>
      </div>
    </>
  );
}
