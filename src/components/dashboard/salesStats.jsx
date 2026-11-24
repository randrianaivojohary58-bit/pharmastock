// Fonctions utilitaires partagées par le tableau de bord

// Total TTC d'une vente
export const saleTotal = (sale) =>
  (sale.products || []).reduce(
    (a, p) => a + (p.quantity || 0) * (p.price || 0) * (1 + (p.tva || 0) / 100),
    0
  );

// Une vente compte dans le CA seulement si elle n'est plus une proforma "En attente"
export const isCounted = (sale) => sale.status === 'Payée' || sale.status === 'Partielle';

// Marge estimée HT d'une vente (prix de vente - prix d'achat du produit)
export const saleMargin = (sale, costById) =>
  (sale.products || []).reduce(
    (a, p) => a + (p.quantity || 0) * ((p.price || 0) - (costById[p.productId] || 0)),
    0
  );

// Date locale au format AAAA-MM-JJ (évite les décalages de fuseau horaire)
export const todayStr = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

export const SEUIL_STOCK_BAS = 5;