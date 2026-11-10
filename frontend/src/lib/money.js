/**
 * ═══════════════════════════════════════════════════════════════
 *  MONNAIE — un seul endroit à changer
 * ═══════════════════════════════════════════════════════════════
 *  Tes prix étaient affichés en « € » en dur dans le JSX. Centralisé ici :
 *  passer la boutique en FCFA pour Abidjan, c'est une ligne.
 * ═══════════════════════════════════════════════════════════════
 */

export const CURRENCY = {
  code: 'EUR',
  locale: 'fr-FR',
  // Passer à : { code: 'XOF', locale: 'fr-CI', decimals: 0 } pour Abidjan.
  decimals: 0,
};

/**
 * Livraison. Le CartDrawer annonçait « offerte dès 200 € » tandis que le
 * tunnel appliquait un autre seuil : promesse non tenue au moment de payer.
 * Les deux lisent désormais ces valeurs.
 */
export const SHIPPING = {
  freeFrom: 200,
  flat: 9,
};

export function shippingFor(subtotal) {
  return subtotal >= SHIPPING.freeFrom ? 0 : SHIPPING.flat;
}

export function formatPrice(amount) {
  if (amount == null || Number.isNaN(amount)) return '—';
  try {
    return new Intl.NumberFormat(CURRENCY.locale, {
      style: 'currency',
      currency: CURRENCY.code,
      minimumFractionDigits: CURRENCY.decimals,
      maximumFractionDigits: CURRENCY.decimals,
    }).format(amount);
  } catch {
    return `${amount} ${CURRENCY.code}`;
  }
}
