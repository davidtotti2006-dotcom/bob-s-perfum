import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * ═══════════════════════════════════════════════════════════════
 *  CART STORE — panier + coffret découverte
 * ═══════════════════════════════════════════════════════════════
 *  L'API publique d'origine est conservée telle quelle (items, addItem,
 *  removeItem, updateQuantity, clearCart, toggleCart, closeCart) : le
 *  CartDrawer existant continue de fonctionner sans modification.
 *
 *  Ajouts :
 *    · samples[]   — échantillons 2 ml offerts, jamais facturés
 *    · paliers     — le droit à N échantillons dépend du sous-total
 *    · sélecteurs  — subtotal / count / allowance calculés au même endroit
 *
 *  Règle produit : les échantillons restent dans le panier même si le
 *  sous-total redescend sous le palier. On ne reprend pas un cadeau au
 *  client en cours de route ; on l'avertit (`overAllowance`) et on tranche
 *  à la validation de commande.
 * ═══════════════════════════════════════════════════════════════
 */

/** Paliers de générosité : [sous-total minimum, nombre d'échantillons]. */
export const SAMPLE_TIERS = [
  { min: 0, allowance: 1 },
  { min: 60, allowance: 2 },
  { min: 120, allowance: 3 },
];

export function allowanceFor(subtotal) {
  return SAMPLE_TIERS.reduce(
    (acc, t) => (subtotal >= t.min ? t.allowance : acc),
    SAMPLE_TIERS[0].allowance
  );
}

/** Palier suivant, pour l'incitation « encore X € et un 3e échantillon ». */
export function nextTier(subtotal) {
  return SAMPLE_TIERS.find((t) => t.min > subtotal) || null;
}

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      samples: [],
      isOpen: false,

      /* ─────────── Articles ─────────── */
      addItem: (perfume, size) => {
        const existing = get().items.find(
          (i) => i._id === perfume._id && i.ml === size.ml
        );
        if (existing) {
          set({
            items: get().items.map((i) =>
              i._id === perfume._id && i.ml === size.ml
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
            isOpen: true,
          });
        } else {
          set({
            items: [
              ...get().items,
              {
                _id: perfume._id,
                name: perfume.name,
                slug: perfume.slug,
                ml: size.ml,
                price: size.price,
                quantity: 1,
              },
            ],
            isOpen: true,
          });
        }
      },

      removeItem: (_id, ml) => {
        set({ items: get().items.filter((i) => !(i._id === _id && i.ml === ml)) });
      },

      updateQuantity: (_id, ml, quantity) => {
        if (quantity <= 0) {
          get().removeItem(_id, ml);
          return;
        }
        set({
          items: get().items.map((i) =>
            i._id === _id && i.ml === ml ? { ...i, quantity } : i
          ),
        });
      },

      /* ─────────── Échantillons offerts ─────────── */

      /**
       * @param {{_id:string,name:string,slug:string,reason?:string}} sample
       * @returns {'added'|'duplicate'|'full'}
       */
      addSample: (sample) => {
        const { samples } = get();
        if (samples.some((s) => s._id === sample._id)) return 'duplicate';
        if (samples.length >= get().maxAllowance()) return 'full';
        set({
          samples: [...samples, { ...sample, ml: 2, price: 0 }],
          isOpen: true,
        });
        return 'added';
      },

      removeSample: (_id) => {
        set({ samples: get().samples.filter((s) => s._id !== _id) });
      },

      clearSamples: () => set({ samples: [] }),

      /** Plafond absolu : le palier le plus généreux du barème. */
      maxAllowance: () => SAMPLE_TIERS[SAMPLE_TIERS.length - 1].allowance,

      /* ─────────── Sélecteurs dérivés ─────────── */
      subtotal: () =>
        get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),

      itemCount: () => get().items.reduce((acc, i) => acc + i.quantity, 0),

      /** Droit courant, et dépassement éventuel à arbitrer à la commande. */
      sampleStatus: () => {
        const sub = get().subtotal();
        const allowance = allowanceFor(sub);
        const taken = get().samples.length;
        return {
          allowance,
          taken,
          remaining: Math.max(allowance - taken, 0),
          overAllowance: Math.max(taken - allowance, 0),
          next: nextTier(sub),
          missingForNext: nextTier(sub) ? +(nextTier(sub).min - sub).toFixed(2) : 0,
        };
      },

      /** Échantillons réellement offerts, dans la limite du droit acquis. */
      grantedSamples: () => get().samples.slice(0, allowanceFor(get().subtotal())),

      clearCart: () => set({ items: [], samples: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: 'mb-paris-cart',
      version: 2,
      /** Les paniers v1 n'ont pas `samples` : on migre sans les casser. */
      migrate: (persisted, version) => {
        if (version < 2) return { ...persisted, samples: [] };
        return persisted;
      },
      /** `isOpen` ne doit jamais être restauré : on n'ouvre pas le tiroir au load. */
      partialize: (state) => ({ items: state.items, samples: state.samples }),
    }
  )
);

export default useCartStore;
