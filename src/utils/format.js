export const formatMoney = (value) => {
  return new Intl.NumberFormat('fr-FR').format(Math.round(value)) + ' Ar';
};

export const formatNumber = (value) => {
  return new Intl.NumberFormat('fr-FR').format(value);
};