const purchases = [
  { id: 1, number: '20260826-01', date: '2026-08-26', supplier: 'SOCIETE SALAMA SAVA (SARL)', tvaRate: 20, remiseRate: 0, status: 'Reçu',
    products: [
      { productId: 'LORN-OME', name: 'Lornac omeprazole 20mg B/6*10', quantity: 1, price: 26030, expiry: '2027-06-30' },
      { productId: 'LORA-100', name: 'Loratadine sol buv 100ml', quantity: 2, price: 4990, expiry: '2027-04-15' },
      { productId: 'LORA-10', name: 'Loratin 10mg cpr/10*10', quantity: 1, price: 27725, expiry: '2027-08-20' }
    ]
  },
  { id: 2, number: 'ACH-2026-00089', date: '2026-09-21', supplier: 'PharmaDistrib OI', tvaRate: 20, remiseRate: 2, status: 'Reçu',
    products: [{ productId: 'VITC1G', name: 'Vitamin C 1 g', quantity: 50, price: 220000, expiry: '2028-07-10' }]
  },
  { id: 3, number: 'ACH-2026-00088', date: '2026-09-20', supplier: 'MedSupply France', tvaRate: 20, remiseRate: 0, status: 'Reçu',
    products: [{ productId: 'INJ-CEF', name: 'Ceftriaxone Injectable 1g', quantity: 30, price: 95000, expiry: '2028-05-20' }]
  },
  { id: 4, number: 'ACH-2026-00087', date: '2026-09-19', supplier: 'Laborex', tvaRate: 10, remiseRate: 5, status: 'En attente',
    products: [{ productId: 'POM-BET', name: 'Bétaméthasone Pommade', quantity: 60, price: 60000, expiry: '2028-11-20' }]
  }
];

export default purchases;