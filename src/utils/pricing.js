// Calcul des prix de vente à partir du prix d'achat et de la marge du fournisseur

// Marges par défaut (identiques aux anciens coefficients : x1.20 / x1.15 / x1.10)
export const DEFAULT_MARGINS = { margin: 20, marginRevendeur: 15, marginGrossiste: 10 };

// Prix de vente = prix d'achat x (1 + marge / 100), arrondi à l'ariary
export const priceFromMargin = (buyPrice, marginPct) =>
  Math.round((Number(buyPrice) || 0) * (1 + (Number(marginPct) || 0) / 100));

// Marges d'un fournisseur (valeurs par défaut si non renseignées)
export const getSupplierMargins = (supplier) => ({
  margin: supplier?.margin ?? DEFAULT_MARGINS.margin,
  marginRevendeur: supplier?.marginRevendeur ?? DEFAULT_MARGINS.marginRevendeur,
  marginGrossiste: supplier?.marginGrossiste ?? DEFAULT_MARGINS.marginGrossiste
});

// Les trois prix de vente d'un produit
export const getSellPrices = (buyPrice, margins) => ({
  price: priceFromMargin(buyPrice, margins.margin),
  priceRevendeur: priceFromMargin(buyPrice, margins.marginRevendeur),
  priceGrossiste: priceFromMargin(buyPrice, margins.marginGrossiste)
});

// Produits "d'un fournisseur" = produits dont le DERNIER achat reçu vient de ce fournisseur.
// (Un produit acheté chez plusieurs fournisseurs suit la marge du plus récent.)
export const getProductsOfSupplier = (supplierId, purchases, products) => {
  const lastSupplierByProduct = {};
  [...(purchases || [])]
    .filter(p => p.status === 'Reçu')
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach(p => {
      (p.products || []).forEach(l => {
        if (!(l.productId in lastSupplierByProduct)) lastSupplierByProduct[l.productId] = p.supplierId;
      });
    });
  return (products || []).filter(p => lastSupplierByProduct[p.id] === supplierId);
};