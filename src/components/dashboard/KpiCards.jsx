import { DollarSign, TrendingUp, Calendar, Coins } from 'lucide-react';
import { formatMoney } from '../../utils/format';
import { isToday, isThisMonth, isThisYear } from 'date-fns'; // Assurez-vous d'avoir installé date-fns

export default function KpiCards({ sales }) {
  // Calcul du CA
  const calculateTotal = (filteredSales) => {
    return filteredSales.reduce((sum, sale) => 
      sum + sale.products.reduce((a, p) => a + p.quantity * p.price * (1 + (p.tva || 0) / 100), 0), 0
    );
  };

  // Filtrage des ventes (nécessite date-fns, sinon utilisez des comparaisons de dates manuelles)
  const todaySales = sales.filter(s => new Date(s.date).toDateString() === new Date().toDateString());
  const monthSales = sales.filter(s => {
    const d = new Date(s.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const yearSales = sales.filter(s => new Date(s.date).getFullYear() === new Date().getFullYear());

  const caDay = calculateTotal(todaySales);
  const caMonth = calculateTotal(monthSales);
  const caYear = calculateTotal(yearSales);
  
  // Bénéfice estimé (vous pouvez affiner avec le vrai prix d'achat)
  const profit = caDay * 0.2; 

  const cards = [
    { label: 'CA du jour', value: formatMoney(caDay), icon: DollarSign, color: 'blue' },
    { label: 'CA du mois', value: formatMoney(caMonth), icon: TrendingUp, color: 'green' },
    { label: "CA de l'année", value: formatMoney(caYear), icon: Calendar, color: 'purple' },
    { label: 'Bénéfice estimé (jour)', value: formatMoney(profit), icon: Coins, color: 'orange' }
  ];

  const colorClasses = {
    blue: 'bg-emerald-50 text-emerald-500',
    green: 'bg-emerald-50 text-emerald-700',
    purple: 'bg-violet-50 text-violet-500',
    orange: 'bg-orange-50 text-orange-500'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${colorClasses[card.color]} flex items-center justify-center shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs text-gray-500">{card.label}</span>
              <strong className="block text-lg mt-0.5 text-gray-800">{card.value}</strong>
            </div>
          </div>
        );
      })}
    </div>
  );
}