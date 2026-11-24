import { formatMoney } from '../../utils/format';
import { daysUntil } from '../../utils/dates';
import { saleTotal, saleMargin, isCounted, todayStr, SEUIL_STOCK_BAS } from '../../utils/salesStats';

function Card({ label, value, detail, valueClass = 'text-gray-800' }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <span className="block text-xs text-gray-500">{label}</span>
      <strong className={`block text-xl mt-1 ${valueClass}`}>{value}</strong>
      {detail && <span className="block text-[11px] text-gray-500 mt-1">{detail}</span>}
    </div>
  );
}

export default function KpiCards({ sales, products }) {
  const today = todayStr();
  const month = today.slice(0, 7);
  const year = today.slice(0, 4);

  const counted = sales.filter(isCounted);
  const byPrefix = (prefix) => counted.filter(s => (s.date || '').startsWith(prefix));
  const sum = (list) => list.reduce((a, s) => a + saleTotal(s), 0);

  const daySales = byPrefix(today);
  const monthSales = byPrefix(month);
  const yearSales = byPrefix(year);

  const costById = {};
  products.forEach(p => { costById[p.id] = p.buyPrice || 0; });
  const monthMargin = monthSales.reduce((a, s) => a + saleMargin(s, costById), 0);

  // Proformas en attente d'encaissement
  const pending = sales.filter(s => s.status === 'En attente');
  const pendingTotal = sum(pending);

  // Créances : ventes partiellement payées
  const partial = sales.filter(s => s.status === 'Partielle');
  const receivable = partial.reduce((a, s) => a + Math.max(saleTotal(s) - (s.paid || 0), 0), 0);

  // Stock
  const totalCartons = products.reduce((a, p) => a + (p.stock || 0), 0);
  const stockValue = products.reduce((a, p) => a + (p.stock || 0) * (p.buyPrice || 0), 0);
  const rupture = products.filter(p => (p.stock || 0) <= 0).length;
  const low = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) < SEUIL_STOCK_BAS).length;

  // Péremption
  let expired = 0;
  let soon = 0;
  products.forEach(p => (p.lots || []).filter(l => l.stock > 0).forEach(l => {
    const d = daysUntil(l.expiry);
    if (d < 0) expired += 1;
    else if (d <= 30) soon += 1;
  }));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card label="CA du jour" value={formatMoney(sum(daySales))} detail={`${daySales.length} vente(s) aujourd'hui`} />
        <Card label="CA du mois" value={formatMoney(sum(monthSales))} detail={`${monthSales.length} vente(s) ce mois`} />
        <Card label="CA de l'année" value={formatMoney(sum(yearSales))} detail={`${yearSales.length} vente(s) cette année`} />
        <Card label="Marge estimée (mois)" value={formatMoney(monthMargin)} valueClass="text-emerald-700" detail="Prix de vente − prix d'achat (HT)" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card
          label="À encaisser (proformas)"
          value={formatMoney(pendingTotal)}
          valueClass="text-orange-600"
          detail={`${pending.length} proforma(s) en attente · stock non déduit`}
        />
        <Card
          label="Créances clients"
          value={formatMoney(receivable)}
          valueClass={receivable > 0 ? 'text-red-600' : 'text-gray-800'}
          detail={`${partial.length} vente(s) partiellement payée(s)`}
        />
        <Card
          label="Stock total"
          value={`${totalCartons} ctn`}
          detail={`${products.length} produit(s) · valeur ${formatMoney(stockValue)}`}
        />
        <Card
          label="Alertes"
          value={`${rupture + low + expired + soon}`}
          valueClass={rupture + expired > 0 ? 'text-red-600' : 'text-gray-800'}
          detail={`${rupture} rupture · ${low} stock bas · ${expired} expiré · ${soon} ≤ 30 j`}
        />
      </div>
    </div>
  );
}