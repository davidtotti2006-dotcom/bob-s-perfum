import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

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

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      closeCart: () => set({ isOpen: false }),
    }),
    { name: 'mb-paris-cart' }
  )
);

export default useCartStore;
