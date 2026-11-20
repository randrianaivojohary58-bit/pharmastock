import { Trophy, ArrowRight } from 'lucide-react';
import { formatMoney } from '../../utils/format';
import { useNavigate } from 'react-router-dom';

export default function TopProducts({ sales }) {
  const navigate = useNavigate();
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
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Trophy className="w-4 h-4 text-orange-500" />
            Top 5 Produits
          </h3>
          <span className="text-xs text-gray-500">Meilleures ventes</span>
        </div>
      </div>
      
      <div className="px-5 pb-5 flex-1">
        {top.length === 0 ? (
          <p className="text-center text-xs text-gray-500 py-5">Aucune vente</p>
        ) : (
          top.map((p, i) => {
            const colors = ['from-yellow-400 to-yellow-600', 'from-gray-300 to-gray-500', 'from-orange-400 to-orange-600'];
            return (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors rounded-lg px-2 -mx-2">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${colors[i] || 'from-emerald-400 to-emerald-600'} text-white flex items-center justify-center font-bold text-xs shadow-sm`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <strong className="block text-xs truncate">{p.name}</strong>
                  <small className="block text-[10px] text-gray-500">{p.qty} cartons vendus</small>
                </div>
                <div className="text-xs font-bold text-emerald-700 whitespace-nowrap">{formatMoney(p.total)}</div>
              </div>
            );
          })
        )}
      </div>
      
      <div className="p-4 border-t border-gray-100 mt-auto">
        <button onClick={() => navigate('/produits')} className="w-full py-2 text-xs text-emerald-600 font-semibold hover:bg-emerald-50 rounded-lg transition-colors flex items-center justify-center gap-1">
          Voir tout le catalogue <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}