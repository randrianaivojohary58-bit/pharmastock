const sales = [
  { id: 1, number: 'VTE-2026-00121', date: '2026-09-18', client: 'Pharmacie Centrale Analakely', clientType: 'Pharmacie',
    products: [
      { productId: 'PCT500', name: 'Paracetamol 500 mg', quantity: 5, price: 120000, tva: 0 },
      { productId: 'AMX250', name: 'Amoxicillin 250 mg', quantity: 3, price: 160000, tva: 0 }
    ], payment: 'Virement', status: 'Payée', paid: 1080000, echeance: null },
  { id: 2, number: 'VTE-2026-00122', date: '2026-09-19', client: 'Clinique Andohatapenaka', clientType: 'Clinique',
    products: [{ productId: 'IBU400', name: 'Ibuprofen 400 mg', quantity: 2, price: 190000, tva: 0 }],
    payment: 'Crédit', status: 'En attente', paid: 0, echeance: '2026-09-27' },
  { id: 3, number: 'VTE-2026-00123', date: '2026-09-20', client: 'DEPOT MIARINTSOA', clientType: 'Revendeur',
    products: [
      { productId: 'VITC1G', name: 'Vitamin C 1 g', quantity: 4, price: 300000, tva: 10 },
      { productId: 'OMEP20', name: 'Omeprazole 20 mg', quantity: 2, price: 220000, tva: 10 }
    ], payment: 'Virement', status: 'Payée', paid: 1804000, echeance: null },
  { id: 4, number: 'VTE-2026-00124', date: '2026-09-20', client: 'Hôpital Ambohimiandra', clientType: 'Hôpital',
    products: [
      { productId: 'INJ-CEF', name: 'Ceftriaxone Injectable 1g', quantity: 10, price: 135000, tva: 20 },
      { productId: 'CON-GAN', name: 'Gants stériles (boîte 100)', quantity: 5, price: 70000, tva: 20 }
    ], payment: 'Crédit 15 jours', status: 'En attente', paid: 0, echeance: '2026-09-26' },
  { id: 5, number: 'VTE-2026-00125', date: '2026-09-21', client: 'Clinique Sainte Famille', clientType: 'Clinique',
    products: [{ productId: 'SROP125', name: 'Amoxicilline Sirop 125mg', quantity: 8, price: 120000, tva: 10 }],
    payment: 'Espèces', status: 'Payée', paid: 1056000, echeance: null },
  { id: 6, number: 'VTE-2026-00126', date: '2026-09-21', client: 'Pharmacie Ankorondrano', clientType: 'Pharmacie',
    products: [
      { productId: 'SUP-PAR', name: 'Paracetamol Suppositoire 150mg', quantity: 6, price: 110000, tva: 10 },
      { productId: 'POM-BET', name: 'Bétaméthasone Pommade', quantity: 4, price: 95000, tva: 20 }
    ], payment: 'Virement', status: 'Payée', paid: 1144000, echeance: null },
  { id: 7, number: 'VTE-2026-00127', date: '2026-09-21', client: 'Dr. Rakoto Jean', clientType: 'Particulier',
    products: [{ productId: 'GTT-ART', name: 'Artelac Gouttes oculaires', quantity: 3, price: 155000, tva: 20 }],
    payment: 'Espèces', status: 'Payée', paid: 511500, echeance: null }
];

export default sales;