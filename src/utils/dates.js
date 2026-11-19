export const formatDate = (date) => {
  if (!date) return '-';
  const parts = date.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return new Date(date).toLocaleDateString('fr-FR');
};

export const TODAY = new Date('2026-09-22');

export const daysUntil = (dateStr) => {
  const d = new Date(dateStr);
  return Math.ceil((d - TODAY) / (1000 * 60 * 60 * 24));
};

export const expiryStatus = (expiry) => {
  const days = daysUntil(expiry);
  if (days < 0) return { label: 'Expiré', class: 'danger', color: 'text-red-600', days };
  if (days <= 30) return { label: 'Critique', class: 'danger', color: 'text-red-600', days };
  if (days <= 90) return { label: 'Bientôt', class: 'pending', color: 'text-orange-500', days };
  return { label: 'OK', class: 'paid', color: 'text-green-600', days };
};