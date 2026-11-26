// Emplacement d'un produit : Pièce > Équipement > Niveau > Case
//
// Les noms techniques (rayon, allee, etagere) sont conservés pour les trois premiers niveaux,
// afin de ne pas casser la base ni les pages existantes. Seuls les libellés changent :
//   rayon   = Pièce        (ex. « Pièce 2 »)
//   allee   = Équipement   (ex. « Étagère murale 02 »)
//   etagere = Niveau       (ex. « Niveau 03 »)
//   casier  = Case         (ex. « Case 01 »)   <- nouvelle colonne
export const LOCATION_LEVELS = [
  { key: 'rayon', label: 'Pièce', placeholder: 'Ex : Pièce 2' },
  { key: 'allee', label: 'Équipement', placeholder: 'Ex : Étagère murale 02' },
  { key: 'etagere', label: 'Niveau', placeholder: 'Ex : Niveau 03' },
  { key: 'casier', label: 'Case', placeholder: 'Ex : Case 01' }
];

// « Pièce 2 / Étagère murale 02 / Niveau 03 / Case 01 »
export const formatEmplacement = (obj, sep = ' / ') =>
  LOCATION_LEVELS.map(l => String(obj?.[l.key] ?? '').trim()).filter(Boolean).join(sep) || '—';
