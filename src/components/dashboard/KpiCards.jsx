import { DollarSign, TrendingUp, Calendar, Coins } from 'lucide-react';
import { formatMoney } from '../../utils/format';

export default function KpiCards({ sales }) {
  const caDay = sales.reduce((s, sale) =>
    s + sale.products.reduce((a, p) => a + p.quantity * p.price * (1 + p.tva / 100), 0), 0);
  const caMonth = caDay;
  const caYear = caDay;
  const profit = caDay * 0.2;

  const cards = [
    { label: 'CA du jour', value: formatMoney(caDay), icon: DollarSign, color: 'blue' },
    { label: 'CA du mois', value: formatMoney(caMonth), icon: TrendingUp, color: 'green' },
    { label: "CA de l'année", value: formatMoney(caYear), icon: Calendar, color: 'purple' },
    { label: 'Bénéfice du jour', value: formatMoney(profit), icon: Coins, color: 'orange' }
  ];

  const colorClasses = {
    blue: 'bg-emerald-50 text-emerald-500',
    green: 'bg-emerald-50 text-emerald-700',
    purple: 'bg-violet-50 text-violet-500',
    orange: 'bg-orange-50 text-orange-500'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${colorClasses[card.color]} flex items-center justify-center`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs text-gray-500">{card.label}</span>
              <strong className="block text-xl mt-0.5">{card.value}</strong>
            </div>
          </div>
        );
      })}
    </div>
  );
}