const products = [
  { id: 'PCT500', name: 'Paracetamol 500 mg', type: 'Comprimé', conditionnement: 'Boîte', category: 'Antalgique', tva: 0, buyPrice: 90000, price: 120000, stock: 125, rayon: 'A', allee: '1', etagere: '1', lots: [
    { id: 'L2024-118', expiry: '2026-11-15', stock: 25 },
    { id: 'L2025-041', expiry: '2028-01-10', stock: 100 }
  ]},
  { id: 'AMX250', name: 'Amoxicillin 250 mg', type: 'Comprimé', conditionnement: 'Boîte', category: 'Antibiotique', tva: 0, buyPrice: 120000, price: 160000, stock: 64, rayon: 'A', allee: '2', etagere: '1', lots: [
    { id: 'AMX-2025-032', expiry: '2027-02-20', stock: 20 },
    { id: 'AMX-2026-014', expiry: '2028-04-15', stock: 44 }
  ]},
  { id: 'IBU400', name: 'Ibuprofen 400 mg', type: 'Comprimé', conditionnement: 'Boîte', category: 'Anti-inflammatoire', tva: 0, buyPrice: 145000, price: 190000, stock: 31, rayon: 'A', allee: '1', etagere: '2', lots: [
    { id: 'IBU-2023-051', expiry: '2026-10-20', stock: 8 },
    { id: 'IBU-2025-018', expiry: '2028-06-12', stock: 23 }
  ]},
  { id: 'VITC1G', name: 'Vitamin C 1 g', type: 'Comprimé', conditionnement: 'Boîte', category: 'Vitamine', tva: 10, buyPrice: 220000, price: 300000, stock: 85, rayon: 'B', allee: '1', etagere: '2', lots: [
    { id: 'VITC-2025-031', expiry: '2027-05-20', stock: 35 },
    { id: 'VITC-2026-011', expiry: '2028-07-10', stock: 50 }
  ]},
  { id: 'OMEP20', name: 'Omeprazole 20 mg', type: 'Comprimé', conditionnement: 'Boîte', category: 'Gastro', tva: 10, buyPrice: 165000, price: 220000, stock: 42, rayon: 'B', allee: '2', etagere: '1', lots: [
    { id: 'OME-2025-020', expiry: '2027-03-18', stock: 17 },
    { id: 'OME-2026-005', expiry: '2028-09-10', stock: 25 }
  ]},
  { id: 'SROP125', name: 'Amoxicilline Sirop 125mg', type: 'Sirop', conditionnement: 'Flacon', category: 'Antibiotique', tva: 10, buyPrice: 85000, price: 120000, stock: 58, rayon: 'A', allee: '3', etagere: '1', lots: [
    { id: 'SRP-2025-021', expiry: '2027-04-10', stock: 30 },
    { id: 'SRP-2026-008', expiry: '2028-08-15', stock: 28 }
  ]},
  { id: 'INJ-CEF', name: 'Ceftriaxone Injectable 1g', type: 'Injectable', conditionnement: 'Ampoule', category: 'Antibiotique', tva: 20, buyPrice: 95000, price: 135000, stock: 40, rayon: 'C', allee: '2', etagere: '1', lots: [
    { id: 'INJ-2025-012', expiry: '2027-06-30', stock: 20 },
    { id: 'INJ-2026-004', expiry: '2028-05-20', stock: 20 }
  ]},
  { id: 'SUP-PAR', name: 'Paracetamol Suppositoire 150mg', type: 'Suppositoire', conditionnement: 'Boîte', category: 'Antalgique', tva: 10, buyPrice: 75000, price: 110000, stock: 72, rayon: 'A', allee: '2', etagere: '3', lots: [
    { id: 'SUP-2025-045', expiry: '2027-08-10', stock: 40 },
    { id: 'SUP-2026-018', expiry: '2028-10-05', stock: 32 }
  ]},
  { id: 'POM-BET', name: 'Bétaméthasone Pommade', type: 'Pommade', conditionnement: 'Tube', category: 'Dermatologie', tva: 20, buyPrice: 60000, price: 95000, stock: 90, rayon: 'B', allee: '3', etagere: '2', lots: [
    { id: 'POM-2025-033', expiry: '2027-09-15', stock: 50 },
    { id: 'POM-2026-011', expiry: '2028-11-20', stock: 40 }
  ]},
  { id: 'GTT-ART', name: 'Artelac Gouttes oculaires', type: 'Gouttes', conditionnement: 'Flacon', category: 'Ophtalmologie', tva: 20, buyPrice: 110000, price: 155000, stock: 35, rayon: 'B', allee: '1', etagere: '3', lots: [
    { id: 'GTT-2025-007', expiry: '2027-01-25', stock: 15 },
    { id: 'GTT-2026-002', expiry: '2028-03-30', stock: 20 }
  ]},
  { id: 'CON-GAN', name: 'Gants stériles (boîte 100)', type: 'Consommables', conditionnement: 'Boîte', category: 'Matériel', tva: 20, buyPrice: 45000, price: 70000, stock: 200, rayon: 'C', allee: '1', etagere: '1', lots: [
    { id: 'CON-2026-001', expiry: '2030-01-01', stock: 200 }
  ]},
  { id: 'CON-SYR', name: 'Seringues 5ml (boîte 100)', type: 'Consommables', conditionnement: 'Boîte', category: 'Matériel', tva: 20, buyPrice: 35000, price: 55000, stock: 150, rayon: 'C', allee: '1', etagere: '2', lots: [
    { id: 'CON-2026-002', expiry: '2030-01-01', stock: 150 }
  ]},
  { id: 'LORN-OME', name: 'Lornac omeprazole 20mg B/6*10', type: 'Comprimé', conditionnement: 'Boîte', category: 'Gastro', tva: 10, buyPrice: 26030, price: 35000, stock: 45, rayon: 'B', allee: '2', etagere: '2', lots: [
    { id: 'LORN-001', expiry: '2027-06-30', stock: 45 }
  ]},
  { id: 'LORA-100', name: 'Loratadine sol buv 100ml', type: 'Sirop', conditionnement: 'Flacon', category: 'Antihistaminique', tva: 10, buyPrice: 4990, price: 7500, stock: 55, rayon: 'A', allee: '4', etagere: '1', lots: [
    { id: 'LORA-001', expiry: '2027-04-15', stock: 55 }
  ]},
  { id: 'LORA-10', name: 'Loratin 10mg cpr/10*10', type: 'Comprimé', conditionnement: 'Blister', category: 'Antihistaminique', tva: 10, buyPrice: 27725, price: 38000, stock: 38, rayon: 'A', allee: '4', etagere: '2', lots: [
    { id: 'LORA-002', expiry: '2027-08-20', stock: 38 }
  ]}
];

export default products;