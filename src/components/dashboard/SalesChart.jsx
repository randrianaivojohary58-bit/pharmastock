import { formatMoney } from '../../utils/format';

export default function SalesChart({ sales }) {
  const totalCA = sales.reduce((s, sale) =>
    s + sale.products.reduce((a, p) => a + p.quantity * p.price, 0), 0);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold">Évolution des ventes</h3>
          <span className="text-xs text-gray-500">7 derniers jours</span>
        </div>
        <select className="text-xs border border-gray-200 rounded-lg px-3 py-2">
          <option>7 jours</option>
          <option>30 jours</option>
          <option>1 an</option>
        </select>
      </div>
      <div className="relative px-5 pb-5">
        <div className="absolute right-5 top-0 text-lg font-bold text-emerald-700">
          {formatMoney(totalCA)}
        </div>
        <svg viewBox="0 0 600 200" preserveAspectRatio="none" className="w-full h-48">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,150 C60,120 100,80 160,90 C220,100 260,60 320,70 C380,80 420,40 480,50 C540,60 580,30 600,35 L600,200 L0,200 Z" fill="url(#chartGradient)" />
          <path d="M0,150 C60,120 100,80 160,90 C220,100 260,60 320,70 C380,80 420,40 480,50 C540,60 580,30 600,35" fill="none" stroke="#10b981" strokeWidth="3" />
        </svg>
        <div className="flex justify-between text-[9px] text-gray-400 mt-2">
          <span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span>
        </div>
      </div>
    </div>
  );
}