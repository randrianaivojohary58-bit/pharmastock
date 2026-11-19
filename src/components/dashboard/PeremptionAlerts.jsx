import { Clock, XCircle } from 'lucide-react';
import { formatDate, daysUntil } from '../../utils/dates';
import { getNearestLot } from '../../utils/stock';

export default function PeremptionAlerts({ products }) {
  const alerts = [];
  
  products.forEach(p => {
    (p.lots || []).filter(l => l.stock > 0).forEach(lot => {
      const daysLeft = daysUntil(lot.expiry);
      if (daysLeft <= 30) {
        alerts.push({ product: p.name, lot: lot.id, qty: lot.stock, expiry: lot.expiry, daysLeft });
      }
    });
  });

  alerts.sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
      <div className="p-5">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Clock className="w-4 h-4 text-red-600" />
          Produits à périmer
        </h3>
        <span className="text-xs text-gray-500">Expiration ≤ 30 jours</span>
      </div>
      <div className="px-5 pb-5 max-h-80 overflow-y-auto">
        {alerts.length === 0 ? (
          <p className="text-center text-xs text-gray-500 py-5">Aucun produit à périmer ✓</p>
        ) : (
          alerts.slice(0, 8).map((a, i) => {
            const critical = a.daysLeft <= 0;
            return (
              <div key={i} className={`flex gap-3 items-center p-3 mb-2 rounded-lg border-l-4 ${
                critical ? 'bg-red-50 border-red-500' : 'bg-orange-50 border-orange-500'
              }`}>
                <div className={`w-9 h-9 rounded-lg bg-white flex items-center justify-center ${critical ? 'text-red-600' : 'text-orange-500'}`}>
                  {critical ? <XCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <strong className="block text-xs">{a.product}</strong>
                  <span className="block text-[10px] text-gray-600">
                    Lot {a.lot} — {a.qty} ctn — {formatDate(a.expiry)} — {critical ? 'EXPIRÉ' : `${a.daysLeft}j restants`}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}