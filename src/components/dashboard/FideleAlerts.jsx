import { Star, AlertTriangle, Hourglass } from 'lucide-react';
import { formatMoney } from '../../utils/format';
import { TODAY } from '../../utils/dates';

export default function FideleAlerts({ sales, clients }) {
  const alerts = [];
  
  sales.filter(s => s.status !== 'Payée' && s.echeance).forEach(s => {
    const ecl = new Date(s.echeance);
    const daysLeft = Math.ceil((ecl - TODAY) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 5 && daysLeft >= -30) {
      const client = clients.find(c => c.name === s.client);
      alerts.push({
        client: s.client,
        facture: s.number,
        montant: s.products.reduce((a, p) => a + p.quantity * p.price * (1 + p.tva / 100), 0),
        daysLeft,
        fidele: client?.fidele || false
      });
    }
  });

  alerts.sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
      <div className="p-5">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
          Clients fidèles à relancer
        </h3>
        <span className="text-xs text-gray-500">Échéance ≤ 5 jours</span>
      </div>
      <div className="px-5 pb-5 max-h-80 overflow-y-auto">
        {alerts.length === 0 ? (
          <p className="text-center text-xs text-gray-500 py-5">Aucun client à relancer ✓</p>
        ) : (
          alerts.map((a, i) => {
            const urgent = a.daysLeft <= 2;
            return (
              <div key={i} className={`flex gap-3 items-center p-3 mb-2 rounded-lg border-l-4 ${
                urgent ? 'bg-red-50 border-red-500' : 'bg-orange-50 border-orange-500'
              }`}>
                <div className={`w-9 h-9 rounded-lg bg-white flex items-center justify-center ${urgent ? 'text-red-600' : 'text-orange-500'}`}>
                  {urgent ? <AlertTriangle className="w-4 h-4" /> : <Hourglass className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <strong className="block text-xs">{a.client} {a.fidele ? '⭐' : ''}</strong>
                  <span className="block text-[10px] text-gray-600">
                    {a.facture} — {formatMoney(a.montant)} — {a.daysLeft < 0 ? `Retard ${Math.abs(a.daysLeft)}j` : `Reste ${a.daysLeft}j`}
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