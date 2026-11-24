import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { formatDate, daysUntil } from '../../utils/dates';

export default function PeremptionAlerts({ products }) {
  const navigate = useNavigate();
  const alerts = [];

  products.forEach(p => {
    (p.lots || []).filter(l => l.stock > 0).forEach(lot => {
      const daysLeft = daysUntil(lot.expiry);
      if (daysLeft <= 90) {
        alerts.push({ productId: p.id, product: p.name, lot: lot.id, qty: lot.stock, expiry: lot.expiry, daysLeft });
      }
    });
  });

  alerts.sort((a, b) => a.daysLeft - b.daysLeft);

  const expired = alerts.filter(a => a.daysLeft < 0).length;
  const d30 = alerts.filter(a => a.daysLeft >= 0 && a.daysLeft <= 30).length;
  const d90 = alerts.filter(a => a.daysLeft > 30).length;

  const badge = (d) => {
    if (d < 0) return { cls: 'bg-red-100 text-red-700', label: `Expiré (${Math.abs(d)} j)` };
    if (d <= 30) return { cls: 'bg-red-50 text-red-600', label: `${d} j` };
    return { cls: 'bg-orange-100 text-orange-700', label: `${d} j` };
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-start">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Péremption (lots ≤ 90 jours)</h3>
          <span className="text-xs text-gray-500">
            {expired} expiré(s) · {d30} ≤ 30 j · {d90} entre 31 et 90 j
          </span>
        </div>
        <button onClick={() => navigate('/lots')} className="text-[11px] text-emerald-600 font-semibold hover:underline flex items-center gap-1">
          Voir les lots <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {alerts.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-8">Aucun lot proche de la péremption ✓</p>
      ) : (
        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-500 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Produit</th>
                <th className="px-4 py-2 text-left font-semibold">Lot</th>
                <th className="px-4 py-2 text-right font-semibold">Qté</th>
                <th className="px-4 py-2 text-left font-semibold">Expiration</th>
                <th className="px-4 py-2 text-left font-semibold">Reste</th>
              </tr>
            </thead>
            <tbody>
              {alerts.slice(0, 10).map((a, i) => {
                const b = badge(a.daysLeft);
                return (
                  <tr key={`${a.productId}-${a.lot}-${i}`} className="border-t border-gray-100">
                    <td className="px-4 py-2 text-gray-800">{a.product}</td>
                    <td className="px-4 py-2 font-mono text-gray-600">{a.lot}</td>
                    <td className="px-4 py-2 text-right font-semibold">{a.qty} ctn</td>
                    <td className="px-4 py-2 text-gray-600">{formatDate(a.expiry)}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${b.cls}`}>{b.label}</span>
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