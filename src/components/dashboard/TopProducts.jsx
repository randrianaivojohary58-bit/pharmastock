import { Trophy } from 'lucide-react';
import { formatMoney } from '../../utils/format';

export default function TopProducts({ sales }) {
  const productSales = {};
  
  sales.forEach(s => {
    s.products.forEach(p => {
      if (!productSales[p.productId]) {
        productSales[p.productId] = { name: p.name, qty: 0, total: 0 };
      }
      productSales[p.productId].qty += p.quantity;
      productSales[p.productId].total += p.quantity * p.price;
    });
  });

  const top = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
      <div className="p-5">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Trophy className="w-4 h-4 text-orange-500" />
          Top 5 produits vendus
        </h3>
        <span className="text-xs text-gray-500">Meilleures ventes</span>
      </div>
      <div className="px-5 pb-5">
        {top.map((p, i) => {
          const colors = ['from-yellow-400 to-yellow-600', 'from-gray-400 to-gray-600', 'from-orange-600 to-orange-800'];
          return (
            <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${colors[i] || 'from-emerald-500 to-emerald-700'} text-white flex items-center justify-center font-bold text-xs`}>
                {i + 1}
              </div>
              <div className="flex-1">
                <strong className="block text-xs">{p.name}</strong>
                <small className="block text-[10px] text-gray-500">{p.qty} cartons vendus</small>
              </div>
              <div className="text-xs font-bold text-emerald-700">{formatMoney(p.total)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}