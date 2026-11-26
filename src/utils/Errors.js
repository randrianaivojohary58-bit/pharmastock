// Message lisible quand une suppression échoue
export const friendlyDeleteError = (err, label = 'cet élément') => {
  // 23503 = violation de clé étrangère (l'élément est utilisé ailleurs)
  if (err?.code === '23503' || /foreign key|violates/i.test(err?.message || '')) {
    return `Impossible de supprimer ${label} : il est utilisé ailleurs (ventes, achats, lots...).`;
  }
  if (err?.code === '42501' || /permission|row-level security/i.test(err?.message || '')) {
    return `Vous n'avez pas le droit de supprimer ${label}.`;
  }
  return err?.message || `La suppression de ${label} a échoué.`;
};