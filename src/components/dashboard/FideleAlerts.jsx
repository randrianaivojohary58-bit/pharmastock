import { Star, AlertTriangle, Hourglass, ArrowRight } from 'lucide-react';
import { formatMoney } from '../../utils/format';
import { TODAY } from '../../utils/dates';
import { saleTotal } from '../../utils/salesStats';
import { useNavigate } from 'react-router-dom';

export default function FideleAlerts({ sales, clients }) {
  const navigate = useNavigate();
  const alerts = [];
  
  sales.filter(s => s.status !== 'Payée' && s.echeance).forEach(s => {
    const ecl = new Date(s.echeance);
    const daysLeft = Math.ceil((ecl - TODAY) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 5 && daysLeft >= -30) {
      const client = clients.find(c => c.name === s.client);
      alerts.push({
        client: s.client,
        facture: s.number,
        montant: saleTotal(s),
        daysLeft,
        fidele: client?.fidele || false
      });
    }
  });

  alerts.sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col h-full">
      <div className="p-5 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
              Clients à relancer
            </h3>
            <span className="text-xs text-gray-500">Échéance ≤ 5 jours</span>
          </div>
          <button onClick={() => navigate('/creances')} className="text-[10px] text-emerald-600 font-bold hover:underline flex items-center gap-1">
            Voir les créances <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      <div className="px-5 pb-5 flex-1 max-h-80 overflow-y-auto pt-3">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8">
            <Star className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs">Aucun client à relancer ✓</p>
          </div>
        ) : (
          alerts.map((a, i) => {
            const urgent = a.daysLeft <= 2;
            return (
              <div key={i} className={`flex gap-3 items-center p-3 mb-2 rounded-lg border-l-4 transition-all hover:bg-gray-50 group ${
                urgent ? 'bg-red-50 border-red-500' : 'bg-orange-50 border-orange-500'
              }`}>
                <div className={`w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0 ${urgent ? 'text-red-600' : 'text-orange-500'}`}>
                  {urgent ? <AlertTriangle className="w-4 h-4" /> : <Hourglass className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <strong className="block text-xs truncate">{a.client} {a.fidele ? '⭐' : ''}</strong>
                  <span className="block text-[10px] text-gray-600 truncate">
                    {a.facture} — {formatMoney(a.montant)} — <span className={urgent ? 'text-red-600 font-bold' : 'text-orange-600 font-bold'}>{a.daysLeft < 0 ? `Retard ${Math.abs(a.daysLeft)}j` : `Reste ${a.daysLeft}j`}</span>
                  </span>
                </div>
                <button 
                  onClick={() => navigate('/creances')} 
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}