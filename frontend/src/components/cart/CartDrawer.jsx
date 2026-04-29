'use client';

import Link from 'next/link';
import useCartStore from '@/store/cartStore';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore();
  const total     = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]
          transition-opacity duration-500
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[480px] bg-[#fdfbf7] z-[70]
          flex flex-col shadow-2xl
          transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.175,1)]
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Barre couleur haut */}
        <div className="h-[3px] w-full"
          style={{ background: 'linear-gradient(90deg, #c687a3, #b38b59, #6aabb0, #c687a3)' }} />

        {/* Header */}
        <div className="flex justify-between items-center px-8 py-7 border-b border-[#ebd5c1]/40">
          <div>
            <h2 className="font-serif text-2xl uppercase tracking-widest text-[#1a1a1a]">
              Votre Sélection
            </h2>
            <p className="text-[9px] tracking-[0.3em] uppercase text-[#c687a3] mt-1">
              {itemCount} {itemCount > 1 ? 'articles' : 'article'}
            </p>
          </div>
          <button onClick={closeCart}
            className="text-[9px] tracking-[0.3em] uppercase text-[#1a1a1a]
              hover:text-[#c687a3] transition-colors border-b border-[#1a1a1a]
              hover:border-[#c687a3] pb-1">
            Fermer
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-8 text-center">
              {/* Flacon vide animé */}
              <div className="flex flex-col items-center animate-float">
                <div className="w-10 h-4 rounded-t-sm" style={{ backgroundColor: '#c687a3' + '40' }} />
                <div className="w-16 h-24 border-2 border-[#ebd5c1] relative bg-white/60
                  flex items-end justify-center pb-3">
                  <span className="text-[7px] tracking-widest font-serif text-[#1a1a1a]/25">Bob's</span>
                </div>
                <div className="w-12 h-3 rounded-full blur-md mt-1" style={{ background: '#c687a3' + '15' }} />
              </div>
              <div className="space-y-4">
                <p className="text-xs tracking-[0.3em] uppercase text-gray-400">Votre panier est vide</p>
                <button onClick={closeCart}
                  className="text-[9px] tracking-[0.3em] uppercase text-[#c687a3]
                    border-b border-[#c687a3] pb-1 hover:opacity-70 transition-opacity">
                  Découvrir la collection
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#ebd5c1]/30">
              {items.map((item, idx) => {
                /* couleur tournante pour les flacons */
                const colors = ['#c687a3', '#b38b59', '#6aabb0', '#9b8ea8', '#c4944a'];
                const c = colors[idx % colors.length];
                return (
                  <div key={`${item._id}-${item.ml}`} className="flex gap-5 py-7 group">
                    {/* Flacon miniature */}
                    <div className="flex-shrink-0 flex flex-col items-center">
                      <div className="w-5 h-3 rounded-t-sm" style={{ backgroundColor: c }} />
                      <div className="w-14 h-20 border-2 relative flex items-end justify-center pb-2
                        bg-gradient-to-b from-[#faf9f8] to-[#f4f1ec]"
                        style={{ borderColor: c + '55' }}>
                        <span className="text-[5px] tracking-widest font-serif text-[#1a1a1a]/35">Bob's</span>
                      </div>
                      <div className="w-10 h-2 rounded-full blur-sm mt-0.5"
                        style={{ background: c + '20' }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-sm uppercase tracking-wider text-[#1a1a1a] truncate">
                        {item.name}
                      </h4>
                      <p className="text-[9px] tracking-[0.2em] uppercase mt-0.5 font-medium"
                        style={{ color: c }}>
                        {item.ml} ml
                      </p>
                      <p className="text-base font-serif font-medium text-[#1a1a1a] mt-1">
                        {(item.price * item.quantity).toLocaleString('fr-FR')} €
                      </p>

                      <div className="flex items-center gap-4 mt-3">
                        {/* Quantité */}
                        <div className="flex items-center border border-[#ebd5c1] overflow-hidden">
                          <button onClick={() => updateQuantity(item._id, item.ml, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-sm text-[#1a1a1a]
                              hover:bg-[#faf9f8] hover:text-[#c687a3] transition-colors">
                            −
                          </button>
                          <span className="w-8 h-8 flex items-center justify-center text-xs border-x border-[#ebd5c1]">
                            {item.quantity}
                          </span>
                          <button onClick={() => updateQuantity(item._id, item.ml, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-sm text-[#1a1a1a]
                              hover:bg-[#faf9f8] hover:text-[#c687a3] transition-colors">
                            +
                          </button>
                        </div>
                        <button onClick={() => removeItem(item._id, item.ml)}
                          className="text-[8px] tracking-[0.2em] uppercase text-gray-300
                            hover:text-red-400 transition-colors">
                          Retirer
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer panier */}
        {items.length > 0 && (
          <div className="px-8 py-7 border-t border-[#ebd5c1]/40 space-y-5 bg-white">
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] tracking-[0.2em] uppercase text-gray-400">Sous-total</span>
              <span className="font-serif text-3xl text-[#1a1a1a]">
                {total.toLocaleString('fr-FR')} €
              </span>
            </div>
            {total < 200 && (
              <div className="space-y-2">
                <p className="text-[8px] tracking-[0.15em] uppercase text-gray-400">
                  Plus que {(200 - total).toLocaleString('fr-FR')} € pour la livraison offerte
                </p>
                {/* Barre de progression */}
                <div className="w-full h-[2px] bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min((total / 200) * 100, 100)}%`,
                      background: 'linear-gradient(90deg, #c687a3, #b38b59)',
                    }} />
                </div>
              </div>
            )}
            {total >= 200 && (
              <p className="text-[8px] tracking-[0.15em] uppercase text-[#6aabb0]">
                ✓ Livraison offerte en France
              </p>
            )}
            <Link href="/commande" onClick={closeCart}
              className="block w-full text-center py-4 text-[9px] tracking-[0.5em] uppercase
                text-[#fdfbf7] relative group overflow-hidden bg-[#1a1a1a]">
              <span className="relative z-10">Finaliser la commande</span>
              <span className="absolute inset-0 scale-x-0 group-hover:scale-x-100 origin-left
                transition-transform duration-500 z-0"
                style={{ background: 'linear-gradient(90deg, #c687a3, #b38b59)' }} />
            </Link>
            <button onClick={closeCart}
              className="block w-full text-center text-[8px] tracking-[0.3em] uppercase
                text-gray-400 hover:text-[#c687a3] transition-colors">
              Continuer mes achats
            </button>
          </div>
        )}
      </div>
    </>
  );
}
