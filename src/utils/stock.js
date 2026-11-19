import { daysUntil } from './dates';

export const getNearestLot = (product) => {
  if (!product.lots || !product.lots.length) return null;
  return [...product.lots]
    .filter(l => l.stock > 0)
    .sort((a, b) => new Date(a.expiry) - new Date(b.expiry))[0];
};

export const getLotsCount = (product) => {
  return (product.lots || []).filter(l => l.stock > 0).length;
};

export const getEmplacement = (product) => {
  return product.rayon ? `${product.rayon}-${product.allee}-${product.etagere}` : '—';
};

export const getStockStats = (products) => {
  const totalCartons = products.reduce((s, p) => s + p.stock, 0);
  const totalValueBuy = products.reduce((s, p) => s + p.stock * p.buyPrice, 0);
  const totalValueSell = products.reduce((s, p) => s + p.stock * p.price, 0);
  const lowStock = products.filter(p => p.stock < 5).length;
  
  let criticalExpiry = 0, soonExpiry = 0;
  products.forEach(p => {
    const lot = getNearestLot(p);
    if (lot) {
      const d = daysUntil(lot.expiry);
      if (d <= 30) criticalExpiry++;
      else if (d <= 90) soonExpiry++;
    }
  });
  
  return { totalCartons, totalValueBuy, totalValueSell, lowStock, criticalExpiry, soonExpiry };
};