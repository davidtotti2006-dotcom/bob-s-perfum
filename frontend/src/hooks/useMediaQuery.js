'use client';

/**
 * ═══════════════════════════════════════════════════════════════
 *  useMediaQuery — via useSyncExternalStore
 * ═══════════════════════════════════════════════════════════════
 *  Une media query est un store externe. La lire avec useState +
 *  useEffect provoque un rendu en cascade au montage (et React 19 le
 *  signale comme une erreur). `useSyncExternalStore` la lit au premier
 *  rendu, sans setState, et reste cohérent en SSR grâce au 3e argument.
 *
 *  Conséquence utile : `prefers-reduced-motion` et `pointer: fine` sont
 *  disponibles DÈS le rendu — on peut donc décider de ne jamais monter
 *  une animation, au lieu de la monter puis de l'éteindre.
 * ═══════════════════════════════════════════════════════════════
 */

import { useCallback, useSyncExternalStore } from 'react';

function subscribe(query) {
  return (onChange) => {
    const mql = window.matchMedia(query);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  };
}

export function useMediaQuery(query, serverValue = false) {
  const sub = useCallback((onChange) => subscribe(query)(onChange), [query]);
  const get = useCallback(() => window.matchMedia(query).matches, [query]);
  // Côté serveur, on renvoie `serverValue` : aucune hypothèse sur le client.
  const getServer = useCallback(() => serverValue, [serverValue]);
  return useSyncExternalStore(sub, get, getServer);
}

/** L'utilisateur a demandé moins de mouvement. Sur serveur : on suppose oui. */
export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)', true);
}

/** Souris / trackpad plutôt que doigt. Sur serveur : on suppose non. */
export function usePointerFine() {
  return useMediaQuery('(pointer: fine)', false);
}
