'use client';

import { useState, useEffect } from 'react';

export default function Preloader() {
  const [phase, setPhase]     = useState('in');   // 'in' | 'hold' | 'out' | 'done'
  const [letters, setLetters] = useState([false, false, false, false, false]);

  useEffect(() => {
    // stagger letter reveals
    const delays = [100, 220, 340, 460, 580];
    const timers = delays.map((d, i) =>
      setTimeout(() => setLetters((prev) => {
        const n = [...prev]; n[i] = true; return n;
      }), d)
    );

    // start exit
    const t1 = setTimeout(() => setPhase('out'),  2600);
    // remove from DOM
    const t2 = setTimeout(() => setPhase('done'), 3400);

    return () => { timers.forEach(clearTimeout); clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (phase === 'done') return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0a]
        transition-all duration-700 ease-[cubic-bezier(0.77,0,0.175,1)]
        ${phase === 'out' ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'}`}
    >
      {/* Soft glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(198,135,163,0.12)_0%,transparent_65%)] pointer-events-none" />

      {/* Decorative rings */}
      <div className="absolute w-[300px] h-[300px] rounded-full border border-[#c687a3]/10 animate-breathe" />
      <div className="absolute w-[420px] h-[420px] rounded-full border border-[#c687a3]/05 animate-breathe" style={{ animationDelay: '1s' }} />

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="flex items-center">
          {["B", "o", "b", "'", "s"].map((char, i) => (
            <span
              key={i}
              className="font-serif text-5xl md:text-7xl bg-gradient-to-r from-[#e8b5ce] via-[#c687a3] to-[#e8b5ce] bg-clip-text text-transparent"
              style={{
                opacity: letters[i] ? 1 : 0,
                transform: letters[i] ? 'translateY(0)' : 'translateY(20px)',
                filter: letters[i] ? 'blur(0px)' : 'blur(6px)',
                transition: 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1), filter 0.6s ease',
              }}
            >
              {char}
            </span>
          ))}
        </div>

        {/* Loading line */}
        <div className="w-32 h-[1px] bg-white/5 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#e8b5ce] via-[#c687a3] to-[#e8b5ce] animate-line-grow" />
        </div>

        <p
          className="text-[8px] tracking-[0.6em] uppercase text-gray-600"
          style={{
            opacity: letters[3] ? 1 : 0,
            transition: 'opacity 0.6s ease 0.8s',
          }}
        >
          Paris &amp; Abidjan
        </p>
      </div>
    </div>
  );
}
