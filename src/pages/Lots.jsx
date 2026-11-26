import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { friendlyDeleteError } from '../utils/Errors';
import PageHeader from '../components/common/PageHeader';
import SearchBar from '../components/common/SearchBar';
import LotModal from '../components/modals/LotModal';
import ConfirmModal from '../components/common/ConfirmModal';
import { formatDate, expiryStatus } from '../utils/dates';
import { formatEmplacement } from '../utils/emplacement';

export default function Lots() {
  const { products, deleteLot } = useData();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [edit, setEdit] = useState({ productId: null, lotId: null });
  const [deleteInfo, setDeleteInfo] = useState(null);

  const allLots = [];
  products.forEach(p => {
    (p.lots || []).filter(l => l.stock > 0).forEach((lot, i) => {
      allLots.push({ product: p, lot, fefoRank: i + 1 });
    });
  });
  allLots.sort((a, b) => new Date(a.lot.expiry) - new Date(b.lot.expiry));

  const filtered = allLots.filter(l =>
    l.product.name.toLowerCase().includes(search.toLowerCase()) || l.lot.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteInfo) return;
    try {
      await deleteLot(deleteInfo.productId, deleteInfo.lotId);
      showToast('Succès', `Lot « ${deleteInfo.lotId} » supprimé`);
    } catch (err) {
      showToast('Erreur', friendlyDeleteError(err, 'ce lot'), 'error');
    } finally {
      setDeleteInfo(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Lots & Péremption"
        subtitle="Suivi FEFO des lots pharmaceutiques"
        action={
          <button onClick={() => { setEdit({ productId: null, lotId: null }); setModalOpen(true); }}
            className="h-10 px-4 bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-emerald-700">
            <Plus className="w-4 h-4" /> Nouveau lot
          </button>
        }
      />

      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un lot..." />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Lot</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Produit</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Emplacement</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Quantité</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Expiration</th>
                {/* 👇 NOUVELLE COLONNE JOURS RESTANTS */}
                <th className="px-4 py-3 text-left font-bold text-gray-600">Jours restants</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Statut</th>
                <th className="px-4 py-3 text-center font-bold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ product, lot }, idx) => {
                const st = expiryStatus(lot.expiry);
                // Calcul des jours restants
                const daysLeft = Math.ceil((new Date(lot.expiry) - new Date()) / (1000 * 60 * 60 * 24));
                
                return (
                  <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-emerald-700 font-bold">{lot.id}</td>
                    <td className="px-4 py-3"><strong>{product.name}</strong></td>
                    <td className="px-4 py-3">{formatEmplacement(product)}</td>
                    <td className="px-4 py-3">{lot.stock} ctn</td>
                    <td className={`px-4 py-3 ${st.color}`}>{formatDate(lot.expiry)}</td>
                    {/* 👇 NOUVELLE VALEUR JOURS RESTANTS */}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                        daysLeft < 0 ? 'bg-red-100 text-red-700' :
                        daysLeft <= 30 ? 'bg-red-50 text-red-600' :
                        daysLeft <= 90 ? 'bg-orange-100 text-orange-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {daysLeft < 0 ? `Expiré (${Math.abs(daysLeft)}j)` : `${daysLeft} j`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        st.label === 'Expiré' || st.label === 'Critique' ? 'bg-red-100 text-red-700' :
                        st.label === 'Bientôt' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => { setEdit({ productId: product.id, lotId: lot.id }); setModalOpen(true); }}
                          className="w-7 h-7 bg-orange-50 text-orange-600 rounded hover:bg-orange-100 flex items-center justify-center">
                          <Edit className="w-3 h-3" />
                        </button>
                        <button onClick={() => setDeleteInfo({ productId: product.id, lotId: lot.id })}
                          className="w-7 h-7 bg-red-50 text-red-600 rounded hover:bg-red-100 flex items-center justify-center">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <LotModal isOpen={modalOpen} onClose={() => setModalOpen(false)} productId={edit.productId} lotId={edit.lotId} />
      <ConfirmModal
        isOpen={!!deleteInfo}
        title="Supprimer le lot ?"
        message={`Supprimer le lot « ${deleteInfo?.lotId} » de ${products.find(p => p.id === deleteInfo?.productId)?.name || 'ce produit'} ? Son stock sera retiré. Cette action est irréversible.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteInfo(null)}
      />
    </div>
  );
}