// Fonctions utilitaires partagées (tableau de bord, ventes, clients, crédit)

export const CREDIT_DAYS = 15;          // délai de paiement accordé aux clients fidèles
export const SEUIL_STOCK_BAS = 5;

// Taux de remise d'une vente (0 à 100 %)
export const saleRemiseRate = (sale) => Math.min(Math.max(Number(sale.remiseRate) || 0, 0), 100);

// Sous-total HT avant remise
export const saleSubtotal = (sale) =>
  (sale.products || []).reduce((a, p) => a + (p.quantity || 0) * (p.price || 0), 0);

// Montant de la remise (sur le HT)
export const saleRemiseAmount = (sale) => saleSubtotal(sale) * saleRemiseRate(sale) / 100;

// Total TTC d'une vente, remise déduite (la remise s'applique avant TVA)
export const saleTotal = (sale) =>
  (sale.products || []).reduce(
    (a, p) => a + (p.quantity || 0) * (p.price || 0) * (1 + (p.tva || 0) / 100),
    0
  ) * (1 - saleRemiseRate(sale) / 100);

// Reste à payer d'une vente déjà livrée (statut Partielle)
export const saleRest = (sale) =>
  sale.status === 'Partielle' ? Math.max(saleTotal(sale) - (sale.paid || 0), 0) : 0;

// Une vente compte dans le CA seulement si elle n'est plus une proforma "En attente"
export const isCounted = (sale) => sale.status === 'Payée' || sale.status === 'Partielle';

// Marge estimée HT d'une vente (prix de vente - prix d'achat du produit)
export const saleMargin = (sale, costById) =>
  (sale.products || []).reduce(
    (a, p) => a + (p.quantity || 0) * ((p.price || 0) - (costById[p.productId] || 0)),
    0
  ) - saleRemiseAmount(sale);

const pad = (n) => String(n).padStart(2, '0');

// Date locale au format AAAA-MM-JJ (évite les décalages de fuseau horaire)
export const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Ajoute n jours à une date AAAA-MM-JJ
export const addDaysStr = (dateStr, n) => {
  const [y, m, d] = (dateStr || todayStr()).split('-').map(Number);
  const date = new Date(y, m - 1, d + n);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

// Vente livrée mais non soldée, dont l'échéance est dépassée
export const isOverdue = (sale) =>
  sale.status === 'Partielle' && !!sale.echeance && sale.echeance.slice(0, 10) < todayStr();