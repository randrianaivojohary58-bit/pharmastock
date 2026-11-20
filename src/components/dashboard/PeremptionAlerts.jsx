import { Clock, XCircle, ArrowRight } from 'lucide-react';
import { formatDate, daysUntil } from '../../utils/dates';
import { useNavigate } from 'react-router-dom'; // <-- Import pour la navigation

export default function PeremptionAlerts({ products }) {
  const navigate = useNavigate(); // <-- Hook de navigation
  const alerts = [];
  
  products.forEach(p => {
    (p.lots || []).filter(l => l.stock > 0).forEach(lot => {
      const daysLeft = daysUntil(lot.expiry);
      if (daysLeft <= 30) {
        alerts.push({ 
          productId: p.id, // On garde l'ID pour le lien
          product: p.name, 
          lot: lot.id, 
          qty: lot.stock, 
          expiry: lot.expiry, 
          daysLeft 
        });
      }
    });
  });

  alerts.sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col h-full">
      <div className="p-5 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-600" />
              Produits à périmer
            </h3>
            <span className="text-xs text-gray-500">Expiration ≤ 30 jours</span>
          </div>
          {/* Lien rapide vers la page Lots */}
          <button onClick={() => navigate('/lots')} className="text-[10px] text-emerald-600 font-bold hover:underline flex items-center gap-1">
            Voir tout <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      <div className="px-5 pb-5 flex-1 max-h-80 overflow-y-auto pt-3">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8">
            <Clock className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs">Aucun produit à périmer ✓</p>
          </div>
        ) : (
          alerts.slice(0, 8).map((a, i) => {
            const critical = a.daysLeft <= 0;
            return (
              <div key={i} className={`flex gap-3 items-center p-3 mb-2 rounded-lg border-l-4 transition-all hover:bg-gray-50 group ${
                critical ? 'bg-red-50 border-red-500' : 'bg-orange-50 border-orange-500'
              }`}>
                <div className={`w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0 ${critical ? 'text-red-600' : 'text-orange-500'}`}>
                  {critical ? <XCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <strong className="block text-xs truncate" title={a.product}>{a.product}</strong>
                  <span className="block text-[10px] text-gray-600 truncate">
                    Lot {a.lot} — {a.qty} ctn — {formatDate(a.expiry)} — <span className={critical ? 'text-red-600 font-bold' : 'text-orange-600 font-bold'}>{critical ? 'EXPIRÉ' : `${a.daysLeft}j restants`}</span>
                  </span>
                </div>
                
                {/* Bouton d'action direct */}
                <button 
                  onClick={() => navigate('/lots')} 
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                  title="Gérer ce lot"
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