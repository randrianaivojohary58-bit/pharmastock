import { useState } from 'react';
import { Boxes, Coins, AlertTriangle, Clock } from 'lucide-react';
import { useData } from '../context/DataContext';
import SearchBar from '../components/common/SearchBar';
import { formatMoney } from '../utils/format';
import { formatDate, expiryStatus } from '../utils/dates';
import { typeColor, getPromoInfo } from '../utils/productDisplay';

export default function Stock() {
  const { products, loading } = useData();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Chargement du stock...</div>;
  }

  const safeProducts = Array.isArray(products) ? products : [];
  
  // Statistiques
  const totalCartons = safeProducts.reduce((s, p) => s + (p.stock || 0), 0);
  const totalValueBuy = safeProducts.reduce((s, p) => s + (p.stock || 0) * (p.buyPrice || 0), 0);
  const totalValueSell = safeProducts.reduce((s, p) => s + (p.stock || 0) * (p.price || 0), 0);
  const lowStock = safeProducts.filter(p => (p.stock || 0) < 5).length;

  let criticalExpiry = 0;
  let soonExpiry = 0;
  safeProducts.forEach(p => {
    const lots = p.lots || [];
    const nearest = [...lots].filter(l => l.stock > 0).sort((a, b) => new Date(a.expiry) - new Date(b.expiry))[0];
    if (nearest) {
      const days = Math.ceil((new Date(nearest.expiry) - new Date()) / (1000 * 60 * 60 * 24));
      if (days <= 30) criticalExpiry++;
      else if (days <= 90) soonExpiry++;
    }
  });

  // Filtrage
  const filtered = safeProducts.filter(p => {
    const matchSearch = (p.name || '').toLowerCase().includes(search.toLowerCase()) || 
                        (p.id || '').toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || p.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div>
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs text-gray-500">Total cartons</span>
            <strong className="block text-xl">{totalCartons}</strong>
            <small className="text-[10px] text-gray-500">{safeProducts.length} produits</small>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs text-gray-500">Valeur d'achat</span>
            <strong className="block text-lg">{formatMoney(totalValueBuy)}</strong>
            <small className="text-[10px] text-gray-500">Vente: {formatMoney(totalValueSell)}</small>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs text-gray-500">Stock faible</span>
            <strong className="block text-xl">{lowStock}</strong>
            <small className="text-[10px] text-gray-500">Produits &lt; 5 cartons</small>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs text-gray-500">Péremption proche</span>
            <strong className="block text-xl">{criticalExpiry + soonExpiry}</strong>
            <small className="text-[10px] text-gray-500">{criticalExpiry} critique · {soonExpiry} bientôt</small>
          </div>
        </div>
      </div>

      {/* Barre de recherche + filtre type */}
      <div className="flex gap-3 mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Rechercher dans le stock..." />
        <select 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
          className="h-10 px-3 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Tous les types</option>
          <option>Comprimé</option>
          <option>Sirop</option>
          <option>Injectable</option>
          <option>Suppositoire</option>
          <option>Pommade</option>
          <option>Gouttes</option>
          <option>Consommables</option>
        </select>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Code</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Produit</th>
                {/* 👇 NOUVELLE COLONNE TYPE */}
                <th className="px-4 py-3 text-left font-bold text-gray-600">Type</th>
                <th className="px-4 py-3 text-left font-bold text-emerald-800 bg-emerald-100" title="Modifiable depuis la page Lots">Stock</th>
                <th className="px-4 py-3 text-left font-bold text-orange-800 bg-orange-100" title="Modifiable depuis la page Lots">Promo</th>
                <th className="px-4 py-3 text-left font-bold text-sky-800 bg-sky-100" title="Modifiable depuis la page Lots">Emplacement</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Péremption</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Valeur</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500">
                    <Boxes className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    Aucun produit en stock
                  </td>
                </tr>
              ) : (
                filtered.map(p => {
                  const lots = p.lots || [];
                  const nearest = [...lots].filter(l => l.stock > 0).sort((a, b) => new Date(a.expiry) - new Date(b.expiry))[0];
                  const st = nearest ? expiryStatus(nearest.expiry) : { label: '-', color: 'text-gray-500' };
                  const isLow = (p.stock || 0) < 5;
                  const promo = getPromoInfo(p);
                  const emplacement = p.rayon ? `${p.rayon}-${p.allee}-${p.etagere}` : '—';
                  
                  return (
                    <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-emerald-700 font-bold">{p.id}</td>
                      <td className="px-4 py-3"><strong>{p.name}</strong></td>
                      {/* 👇 NOUVELLE VALEUR TYPE */}
                      <td className={`px-4 py-3 font-semibold ${typeColor(p.type)}`}>{p.type || '—'}</td>
                      <td className="px-4 py-3 bg-emerald-50">
                        <strong className={(p.stock || 0) <= 0 ? 'text-red-600' : isLow ? 'text-orange-600' : 'text-emerald-800'}>
                          {p.stock || 0} ctn
                        </strong>
                      </td>
                      <td className="px-4 py-3 bg-orange-50">
                        {promo ? (
                          <span title={promo.detail} className="inline-flex items-center gap-1">
                            <span className="px-2 py-1 bg-orange-500 text-white rounded-full text-[10px] font-bold">
                              -{promo.max}%
                            </span>
                            {promo.count > 1 && (
                              <span className="text-[10px] text-orange-700 font-semibold">{promo.count} lots</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 bg-sky-50 text-sky-800 font-medium">{emplacement}</td>
                      <td className={`px-4 py-3 ${st.color}`}>{nearest ? formatDate(nearest.expiry) : '-'}</td>
                      <td className="px-4 py-3">{formatMoney((p.stock || 0) * (p.buyPrice || 0))}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          isLow ? 'bg-orange-100 text-orange-700' :
                          st.label === 'Expiré' || st.label === 'Critique' ? 'bg-red-100 text-red-700' :
                          st.label === 'Bientôt' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>{isLow ? 'Stock faible' : st.label}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}