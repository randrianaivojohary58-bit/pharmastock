// Aides d'affichage partagées par les tableaux Produits et Stock

// Couleur du texte du type de produit : chaque type garde toujours la même couleur
const TYPE_TEXT_COLORS = [
  'text-blue-600', 'text-purple-600', 'text-pink-600', 'text-teal-600',
  'text-indigo-600', 'text-amber-600', 'text-cyan-600', 'text-rose-600',
  'text-lime-700', 'text-fuchsia-600'
];

export const typeColor = (type) => {
  if (!type) return 'text-gray-400';
  let hash = 0;
  for (const ch of String(type)) hash = (hash * 31 + ch.charCodeAt(0)) % 1000003;
  return TYPE_TEXT_COLORS[hash % TYPE_TEXT_COLORS.length];
};

// Promotions des lots en stock d'un produit : taux le plus élevé, nombre de lots et détail
export const getPromoInfo = (product) => {
  const promoLots = (product.lots || []).filter(l => l.stock > 0 && Number(l.promoRate) > 0);
  if (promoLots.length === 0) return null;
  return {
    max: Math.max(...promoLots.map(l => Number(l.promoRate))),
    count: promoLots.length,
    detail: promoLots.map(l => `${l.id} : -${l.promoRate}%`).join('\n')
  };
};