import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { formatMoney } from '../../utils/format';
import { formatDate } from '../../utils/dates';
import { saleTotal } from '../../utils/salesStats';

const statusClass = (status) => {
  if (status === 'Payée') return 'bg-emerald-100 text-emerald-700';
  if (status === 'En attente') return 'bg-orange-100 text-orange-700';
  if (status === 'Partielle') return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

// Tableau simple de ventes, réutilisé pour "Dernières ventes" et "À encaisser"
export default function SalesTable({ title, subtitle, sales, limit = 8, seeAllPath, seeAllLabel = 'Voir tout', emptyText = 'Aucune vente' }) {
  const navigate = useNavigate();
  const rows = [...sales]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);

  return (
    <div className="bg-white border border-gray-200 rounded-xl flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-start">
        <div>
          <h3 className="text-sm font-bold text-gray-800">{title}</h3>
          {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
        </div>
        {seeAllPath && (
          <button onClick={() => navigate(seeAllPath)} className="text-[11px] text-emerald-600 font-semibold hover:underline flex items-center gap-1">
            {seeAllLabel} <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-8">{emptyText}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">N°</th>
                <th className="px-4 py-2 text-left font-semibold">Date</th>
                <th className="px-4 py-2 text-left font-semibold">Client</th>
                <th className="px-4 py-2 text-right font-semibold">Total TTC</th>
                <th className="px-4 py-2 text-left font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(s => (
                <tr key={s.id} className="border-t border-gray-100">
                  <td className="px-4 py-2 font-mono text-emerald-700">{s.number}</td>
                  <td className="px-4 py-2 text-gray-600">{formatDate(s.date)}</td>
                  <td className="px-4 py-2 text-gray-800">{s.client}</td>
                  <td className="px-4 py-2 text-right font-semibold">{formatMoney(saleTotal(s))}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusClass(s.status)}`}>{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}