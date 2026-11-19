import { useState } from 'react';
import { BarChart3, Boxes, ShoppingCart } from 'lucide-react';
import { useData } from '../context/DataContext';
import PageHeader from '../components/common/PageHeader';
import ReportModal from '../components/modals/ReportModal';
import { formatMoney } from '../utils/format';

export default function Rapports() {
  const { sales, products, purchases } = useData();
  const [reportType, setReportType] = useState(null);

  const reports = [
    { key: 'ventes', title: 'Rapport des ventes', desc: 'Analyse détaillée des ventes', icon: BarChart3 },
    { key: 'stock', title: 'Rapport de stock', desc: 'État actuel des stocks', icon: Boxes },
    { key: 'achats', title: "Rapport d'achats", desc: 'Analyse des approvisionnements', icon: ShoppingCart }
  ];

  return (
    <div>
      <PageHeader title="Rapports" subtitle="Analyse de votre activité" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {reports.map(r => {
          const Icon = r.icon;
          return (
            <div key={r.key} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold mb-1">{r.title}</h3>
              <p className="text-xs text-gray-500 mb-4">{r.desc}</p>
              <button onClick={() => setReportType(r.key)}
                className="w-full h-10 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700">
                Générer →
              </button>
            </div>
          );
        })}
      </div>

      <ReportModal
        isOpen={!!reportType}
        onClose={() => setReportType(null)}
        title={reports.find(r => r.key === reportType)?.title || 'Rapport'}
      >
        {reportType === 'ventes' && <SalesReport sales={sales} />}
        {reportType === 'stock' && <StockReport products={products} />}
        {reportType === 'achats' && <PurchasesReport purchases={purchases} />}
      </ReportModal>
    </div>
  );
}

function SalesReport({ sales }) {
  const totalTTC = sales.reduce((s, sale) =>
    s + sale.products.reduce((a, p) => a + p.quantity * p.price * (1 + p.tva / 100), 0), 0);

  const byClient = {};
  sales.forEach(s => {
    const ttc = s.products.reduce((a, p) => a + p.quantity * p.price * (1 + p.tva / 100), 0);
    if (!byClient[s.client]) byClient[s.client] = { count: 0, total: 0, type: s.clientType };
    byClient[s.client].count++;
    byClient[s.client].total += ttc;
  });
  const top = Object.entries(byClient).sort((a, b) => b[1].total - a[1].total).slice(0, 5);

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-emerald-50 rounded-xl p-4 text-center">
          <span className="block text-xs text-gray-500">Nb ventes</span>
          <strong className="block text-lg text-emerald-700">{sales.length}</strong>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 text-center">
          <span className="block text-xs text-gray-500">Total TTC</span>
          <strong className="block text-lg text-emerald-700">{formatMoney(totalTTC)}</strong>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 text-center">
          <span className="block text-xs text-gray-500">Panier moyen</span>
          <strong className="block text-lg text-emerald-700">{formatMoney(totalTTC / sales.length || 0)}</strong>
        </div>
      </div>
      <h3 className="text-sm font-bold text-emerald-700 mb-2">Top 5 Clients</h3>
      <table className="w-full text-xs">
        <thead><tr className="bg-gray-50"><th className="p-2 text-left">Client</th><th className="p-2 text-center">Type</th><th className="p-2 text-right">Total</th></tr></thead>
        <tbody>
          {top.map(([name, data]) => (
            <tr key={name} className="border-t border-gray-100">
              <td className="p-2 font-medium">{name}</td>
              <td className="p-2 text-center">{data.type}</td>
              <td className="p-2 text-right font-bold">{formatMoney(data.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StockReport({ products }) {
  const total = products.reduce((s, p) => s + p.stock, 0);
  const valueBuy = products.reduce((s, p) => s + p.stock * p.buyPrice, 0);
  const valueSell = products.reduce((s, p) => s + p.stock * p.price, 0);

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-emerald-50 rounded-xl p-4 text-center">
          <span className="block text-xs text-gray-500">Produits</span>
          <strong className="block text-lg text-emerald-700">{products.length}</strong>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 text-center">
          <span className="block text-xs text-gray-500">Cartons</span>
          <strong className="block text-lg text-emerald-700">{total}</strong>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 text-center">
          <span className="block text-xs text-gray-500">Marge potentielle</span>
          <strong className="block text-lg text-emerald-700">{formatMoney(valueSell - valueBuy)}</strong>
        </div>
      </div>
    </div>
  );
}

function PurchasesReport({ purchases }) {
  const totalTTC = purchases.reduce((s, p) => {
    const sub = p.products.reduce((a, x) => a + x.quantity * x.price, 0);
    const rem = sub * (p.remiseRate / 100);
    return s + (sub - rem) * (1 + p.tvaRate / 100);
  }, 0);

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-emerald-50 rounded-xl p-4 text-center">
          <span className="block text-xs text-gray-500">Nb achats</span>
          <strong className="block text-lg text-emerald-700">{purchases.length}</strong>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 text-center">
          <span className="block text-xs text-gray-500">Total TTC</span>
          <strong className="block text-lg text-emerald-700">{formatMoney(totalTTC)}</strong>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 text-center">
          <span className="block text-xs text-gray-500">Fournisseurs</span>
          <strong className="block text-lg text-emerald-700">{new Set(purchases.map(p => p.supplier)).size}</strong>
        </div>
      </div>
    </div>
  );
}