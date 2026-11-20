import { useState, useMemo } from 'react';
import { formatMoney } from '../../utils/format';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// Options de période
const PERIODS = [
  { label: '7 derniers jours', value: '7d' },
  { label: '30 derniers jours', value: '30d' },
  { label: '12 derniers mois', value: '12m' },
  { label: 'Par année', value: 'year' },
];

export default function SalesChart({ sales }) {
  const [period, setPeriod] = useState('7d');

  // Calcul des données du graphique selon la période choisie
  const chartData = useMemo(() => {
    const now = new Date();
    const data = [];

    if (period === '7d' || period === '30d') {
      const days = period === '7d' ? 7 : 30;
      
      // Initialiser les jours
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        data.push({
          date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
          fullDate: d.toDateString(),
          ca: 0,
        });
      }

      // Remplir avec les ventes
      sales.forEach(sale => {
        const saleDate = new Date(sale.date).toDateString();
        const dayData = data.find(d => d.fullDate === saleDate);
        if (dayData) {
          const totalSale = sale.products.reduce((a, p) => a + p.quantity * p.price * (1 + (p.tva || 0) / 100), 0);
          dayData.ca += totalSale;
        }
      });

    } else if (period === '12m') {
      // Initialiser les 12 mois
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        data.push({
          date: d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
          month: d.getMonth(),
          year: d.getFullYear(),
          ca: 0,
        });
      }

      // Remplir avec les ventes
      sales.forEach(sale => {
        const saleDate = new Date(sale.date);
        const monthData = data.find(d => d.month === saleDate.getMonth() && d.year === saleDate.getFullYear());
        if (monthData) {
          const totalSale = sale.products.reduce((a, p) => a + p.quantity * p.price * (1 + (p.tva || 0) / 100), 0);
          monthData.ca += totalSale;
        }
      });

    } else if (period === 'year') {
      // Grouper par année
      const years = {};
      sales.forEach(sale => {
        const year = new Date(sale.date).getFullYear();
        if (!years[year]) years[year] = 0;
        const totalSale = sale.products.reduce((a, p) => a + p.quantity * p.price * (1 + (p.tva || 0) / 100), 0);
        years[year] += totalSale;
      });

      Object.keys(years).sort().forEach(year => {
        data.push({ date: year, ca: years[year] });
      });
    }

    return data;
  }, [sales, period]);

  // Calcul du total de la période
  const totalPeriod = chartData.reduce((sum, item) => sum + item.ca, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
      
      {/* En-tête avec le sélecteur de période */}
      <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Évolution des ventes</h3>
          <span className="text-xs text-gray-500">Visualisez vos revenus</span>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          {/* Total de la période */}
          <div className="text-left sm:text-right">
            <span className="block text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Total Période</span>
            <strong className="text-lg font-bold text-emerald-700">{formatMoney(totalPeriod)}</strong>
          </div>

          {/* Menu déroulant */}
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {PERIODS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Le Graphique */}
      <div className="p-5 flex-1 min-h-[300px]">
        {chartData.length === 0 || totalPeriod === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p className="text-sm">Aucune vente sur cette période</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#6b7280' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#6b7280' }}
                tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                width={40}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                formatter={(value) => [formatMoney(value), 'Chiffre d\'affaires']}
                labelStyle={{ fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}
              />
              <Area 
                type="monotone" 
                dataKey="ca" 
                stroke="#10b981" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorCa)" 
                activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}