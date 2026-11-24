import { useState } from 'react';
import { useData } from '../context/DataContext';
import PageHeader from '../components/common/PageHeader';
import SearchBar from '../components/common/SearchBar';
import { formatDate } from '../utils/dates';

export default function Mouvements() {
  const { purchases, sales } = useData();
  const [search, setSearch] = useState('');

  const movements = [];
  
  // ENTRÉES (Achats)
  purchases.forEach(p => {
    p.products.forEach(prod => {
      movements.push({
        date: p.date, type: 'Entrée', product: prod.name,
        lot: `LOT-${p.number}-${prod.productId}`, // Le lot pour les achats est généré
        qty: prod.quantity, ref: p.number
      });
    });
  });
  
  // SORTIES (Ventes)
  sales.forEach(s => {
    s.products.forEach(prod => {
      movements.push({
        date: s.date, type: 'Sortie', product: prod.name,
        lot: prod.lot || '—', // <-- CORRECTION : On utilise le lot de la vente
        qty: -prod.quantity, ref: s.number
      });
    });
  });
  
  movements.sort((a, b) => new Date(b.date) - new Date(a.date));

  const filtered = movements.filter(m =>
    m.product.toLowerCase().includes(search.toLowerCase()) ||
    m.ref.toLowerCase().includes(search.toLowerCase()) ||
    (m.lot || '').toLowerCase().includes(search.toLowerCase()) // <-- Ajout de la recherche par lot
  );

  return (
    <div>
      <PageHeader title="Mouvements" subtitle="Historique des entrées et sorties" />

      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un mouvement (produit, référence, lot...)" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Date</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Type</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Produit</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Lot</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Quantité</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Référence</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => {
                const isIn = m.qty > 0;
                return (
                  <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">{formatDate(m.date)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        isIn ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>{isIn ? 'Entrée' : 'Sortie'}</span>
                    </td>
                    <td className="px-4 py-3"><strong>{m.product}</strong></td>
                    <td className="px-4 py-3 font-mono">{m.lot || '—'}</td>
                    <td className={`px-4 py-3 font-bold ${isIn ? 'text-emerald-600' : 'text-red-600'}`}>
                      {m.qty > 0 ? '+' : ''}{m.qty} ctn
                    </td>
                    <td className="px-4 py-3 font-mono text-emerald-700">{m.ref}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}