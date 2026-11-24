import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getEmplacement } from '../../utils/stock';
import { SEUIL_STOCK_BAS } from '../../utils/salesStats';

export default function StockAlerts({ products }) {
  const navigate = useNavigate();

  const alerts = products
    .filter(p => (p.stock || 0) < SEUIL_STOCK_BAS)
    .sort((a, b) => (a.stock || 0) - (b.stock || 0));

  return (
    <div className="bg-white border border-gray-200 rounded-xl flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-start">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Ruptures et stock bas</h3>
          <span className="text-xs text-gray-500">Moins de {SEUIL_STOCK_BAS} cartons · {alerts.length} produit(s)</span>
        </div>
        <button onClick={() => navigate('/stock')} className="text-[11px] text-emerald-600 font-semibold hover:underline flex items-center gap-1">
          Voir le stock <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {alerts.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-8">Aucun produit en rupture ✓</p>
      ) : (
        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-500 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Produit</th>
                <th className="px-4 py-2 text-left font-semibold">Emplacement</th>
                <th className="px-4 py-2 text-right font-semibold">Stock</th>
                <th className="px-4 py-2 text-left font-semibold">État</th>
              </tr>
            </thead>
            <tbody>
              {alerts.slice(0, 10).map(p => {
                const out = (p.stock || 0) <= 0;
                return (
                  <tr key={p.id} className="border-t border-gray-100">
                    <td className="px-4 py-2 text-gray-800">{p.name}</td>
                    <td className="px-4 py-2 text-gray-600">{getEmplacement(p)}</td>
                    <td className={`px-4 py-2 text-right font-semibold ${out ? 'text-red-600' : 'text-orange-600'}`}>{p.stock || 0} ctn</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${out ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                        {out ? 'Rupture' : 'Stock bas'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}