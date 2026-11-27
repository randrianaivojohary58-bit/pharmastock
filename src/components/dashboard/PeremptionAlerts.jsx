import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertTriangle, Percent, Ban } from 'lucide-react';
import { formatDate, daysUntil } from '../../utils/dates';
import LotModal from '../modals/LotModal';

export default function PeremptionAlerts({ products }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('soon'); // 'soon' | 'expired'
  const [modalOpen, setModalOpen] = useState(false);
  const [edit, setEdit] = useState({ productId: null, lotId: null });

  // ===== Collecte des lots en stock expirés ou proches de la péremption (≤ 90 j) =====
  const all = [];
  products.forEach(p => {
    (p.lots || []).filter(l => l.stock > 0).forEach(lot => {
      const daysLeft = daysUntil(lot.expiry);
      if (daysLeft <= 90) {
        all.push({
          productId: p.id,
          product: p.name,
          lot: lot.id,
          qty: lot.stock,
          expiry: lot.expiry,
          daysLeft,
          promoRate: Number(lot.promoRate) || 0
        });
      }
    });
  });

  const expired = all.filter(a => a.daysLeft < 0).sort((a, b) => a.daysLeft - b.daysLeft);
  const soon = all.filter(a => a.daysLeft >= 0).sort((a, b) => a.daysLeft - b.daysLeft);

  // Lots proches de la péremption SANS promotion : à traiter en priorité
  const toPromote = soon.filter(a => !a.promoRate);
  const d30 = soon.filter(a => a.daysLeft <= 30).length;
  const expiredQty = expired.reduce((s, a) => s + a.qty, 0);

  const rows = tab === 'expired' ? expired : soon;

  const openPromo = (a) => {
    setEdit({ productId: a.productId, lotId: a.lot });
    setModalOpen(true);
  };

  const badge = (d) => {
    if (d < 0) return { cls: 'bg-red-100 text-red-700', label: `Expiré depuis ${Math.abs(d)} j` };
    if (d <= 30) return { cls: 'bg-red-50 text-red-600', label: `${d} j` };
    return { cls: 'bg-orange-100 text-orange-700', label: `${d} j` };
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-start">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Péremption des lots</h3>
          <span className="text-xs text-gray-500">
            {expired.length} expiré(s) · {d30} ≤ 30 j · {soon.length - d30} entre 31 et 90 j
          </span>
        </div>
        <button onClick={() => navigate('/lots')} className="text-[11px] text-emerald-600 font-semibold hover:underline flex items-center gap-1">
          Voir les lots <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* ===== ALERTES ===== */}
      {(toPromote.length > 0 || expired.length > 0) && (
        <div className="px-4 pt-3 space-y-2">
          {toPromote.length > 0 && (
            <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 text-orange-800 rounded-lg px-3 py-2 text-[11px]">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-orange-500" />
              <div>
                <strong>{toPromote.length} lot(s) proche(s) de la péremption sans promotion.</strong>{' '}
                Ajoutez une promotion pour les écouler avant la date limite.
              </div>
            </div>
          )}
          {expired.length > 0 && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-800 rounded-lg px-3 py-2 text-[11px]">
              <Ban className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <div>
                <strong>{expired.length} lot(s) expiré(s) encore en stock ({expiredQty} ctn).</strong>{' '}
                À retirer de la vente.
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== ONGLETS ===== */}
      <div className="px-4 pt-3 flex gap-2">
        <button
          onClick={() => setTab('soon')}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
            tab === 'soon' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Proches de la péremption ({soon.length})
        </button>
        <button
          onClick={() => setTab('expired')}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
            tab === 'expired' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Expirés ({expired.length})
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-8">
          {tab === 'expired' ? 'Aucun lot expiré en stock' : 'Aucun lot proche de la péremption'}
        </p>
      ) : (
        <div className="overflow-x-auto max-h-80 overflow-y-auto mt-3">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-500 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Produit</th>
                <th className="px-4 py-2 text-left font-semibold">Lot</th>
                <th className="px-4 py-2 text-right font-semibold">Qté</th>
                <th className="px-4 py-2 text-left font-semibold">Expiration</th>
                <th className="px-4 py-2 text-left font-semibold">Reste</th>
                {tab === 'soon' && <th className="px-4 py-2 text-left font-semibold">Promotion</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((a, i) => {
                const b = badge(a.daysLeft);
                return (
                  <tr key={`${a.productId}-${a.lot}-${i}`} className="border-t border-gray-100">
                    <td className="px-4 py-2 text-gray-800 font-medium">{a.product}</td>
                    <td className="px-4 py-2 font-mono text-gray-600">{a.lot}</td>
                    <td className="px-4 py-2 text-right font-semibold">{a.qty} ctn</td>
                    <td className="px-4 py-2 text-gray-600">{formatDate(a.expiry)}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${b.cls}`}>{b.label}</span>
                    </td>
                    {tab === 'soon' && (
                      <td className="px-4 py-2">
                        {a.promoRate > 0 ? (
                          <button
                            onClick={() => openPromo(a)}
                            title="Modifier la promotion"
                            className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold hover:bg-emerald-200"
                          >
                            -{a.promoRate}%
                          </button>
                        ) : (
                          <button
                            onClick={() => openPromo(a)}
                            className="px-2 py-1 bg-orange-500 text-white rounded-lg text-[10px] font-bold hover:bg-orange-600 flex items-center gap-1"
                          >
                            <Percent className="w-3 h-3" /> Ajouter
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <LotModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        productId={edit.productId}
        lotId={edit.lotId}
      />
    </div>
  );
}