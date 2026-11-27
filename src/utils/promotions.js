// Promotion par LOT : un pourcentage de remise défini sur un lot proche de la péremption.
// Seuls les lots concernés sont en promotion, pas tout le produit.

/** Pourcentage de promotion du lot (0 si aucun). `lotId` = numéro de lot lisible. */
export function getLotPromo(product, lotId) {
  const lot = product?.lots?.find(l => l.id === lotId);
  const rate = Number(lot?.promoRate) || 0;
  return rate > 0 && rate <= 100 ? rate : 0;
}

/** Applique un pourcentage de remise à un prix. */
export function applyPromo(price, rate) {
  if (!rate) return price;
  return Math.round(price * (1 - rate / 100) * 100) / 100;
}