'use client';

import { useEffect, useRef } from 'react';

/**
 * Attaches IntersectionObserver to a container element.
 * All children with class "reveal", "reveal-left", "reveal-right", or "reveal-scale"
 * inside the container get the "is-visible" class when they enter the viewport.
 *
 * Usage:
 *   const sectionRef = useScrollReveal();
 *   <section ref={sectionRef}>
 *     <div className="reveal reveal-delay-1">...</div>
 *   </section>
 */
export function useScrollReveal(threshold = 0.12) {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const revealClasses = ['reveal', 'reveal-left', 'reveal-right', 'reveal-scale'];

    const targets = revealClasses.flatMap((cls) =>
      Array.from(container.querySelectorAll(`.${cls}`))
    );

    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}

/**
 * Single-element version.
 * Returns [ref, isVisible].
 */
export function useReveal(threshold = 0.12) {
  const ref       = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
