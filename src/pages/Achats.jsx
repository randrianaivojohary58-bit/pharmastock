import { useState } from 'react';
import { Plus, Eye, Edit, Trash2, ShoppingCart, User } from 'lucide-react';
import { useData } from '../context/DataContext';
import PageHeader from '../components/common/PageHeader';
import SearchBar from '../components/common/SearchBar';
import MiniStat from '../components/common/MiniStat';
import PurchaseModal from '../components/modals/PurchaseModal';
import PurchaseDetailModal from '../components/modals/PurchaseDetailModal';
import ConfirmModal from '../components/common/ConfirmModal';
import { formatMoney } from '../utils/format';
import { formatDate } from '../utils/dates';

export default function Achats() {
  const { purchases, deletePurchase } = useData();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [edit, setEdit] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const filtered = purchases.filter(p =>
    (p.number || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.supplier || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalAll = purchases.reduce((s, p) => {
    const sub = (p.products || []).reduce((a, x) => a + (x.quantity || 0) * (x.price || 0), 0);
    const rem = sub * ((p.remiseRate || 0) / 100);
    return s + (sub - rem) * (1 + (p.tvaRate || 20) / 100);
  }, 0);

  const handleDelete = async () => {
    if (deleteId) {
      await deletePurchase(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Achats"
        subtitle="Gestion des approvisionnements"
        action={
          <button onClick={() => { setEdit(null); setModalOpen(true); }}
            className="h-10 px-4 bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-emerald-700 shadow-sm transition-colors">
            <Plus className="w-4 h-4" /> Nouvel achat
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <MiniStat label="Total achats" value={formatMoney(totalAll)} />
        <MiniStat label="Nombre d'achats" value={purchases.length} />
        <MiniStat label="Fournisseurs" value={new Set(purchases.map(p => p.supplier)).size} />
      </div>

      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un achat..." />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-600">N° Facture</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Date</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Fournisseur</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Produits</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Cartons</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Total HT</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">TVA</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Total TTC</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Utilisateur</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Statut</th>
                <th className="px-4 py-3 text-center font-bold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    Aucun achat enregistré
                  </td>
                </tr>
              ) : (
                filtered.map(p => {
                  const productsList = p.products || [];
                  const sub = productsList.reduce((a, x) => a + (x.quantity || 0) * (x.price || 0), 0);
                  const rem = sub * ((p.remiseRate || 0) / 100);
                  const afterRemise = sub - rem;
                  const tvaRate = p.tvaRate || 20;
                  const tva = afterRemise * (tvaRate / 100);
                  const totalTTC = afterRemise + tva;
                  const cartons = productsList.reduce((a, x) => a + (x.quantity || 0), 0);

                  return (
                    <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-emerald-700 font-bold">{p.number}</td>
                      <td className="px-4 py-3">{formatDate(p.date)}</td>
                      <td className="px-4 py-3"><strong>{p.supplier}</strong></td>
                      <td className="px-4 py-3 text-gray-600">{productsList.length} produit(s)</td>
                      <td className="px-4 py-3 font-bold">{cartons}</td>
                      <td className="px-4 py-3">{formatMoney(sub)}</td>
                      <td className="px-4 py-3">{tvaRate}%</td>
                      <td className="px-4 py-3 font-bold text-emerald-700">{formatMoney(totalTTC)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-emerald-600" />
                          <span className="text-gray-600">{p.userName || 'Inconnu'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          p.status === 'Reçu' ? 'bg-emerald-100 text-emerald-700' :
                          p.status === 'En attente' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                        }`}>{p.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => setDetail(p)} className="w-7 h-7 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 flex items-center justify-center" title="Détails">
                            <Eye className="w-3 h-3" />
                          </button>
                          <button onClick={() => { setEdit(p); setModalOpen(true); }} className="w-7 h-7 bg-orange-50 text-orange-600 rounded hover:bg-orange-100 flex items-center justify-center" title="Modifier">
                            <Edit className="w-3 h-3" />
                          </button>
                          <button onClick={() => setDeleteId(p.id)} className="w-7 h-7 bg-red-50 text-red-600 rounded hover:bg-red-100 flex items-center justify-center" title="Supprimer">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* On repasse à l'appel de PurchaseModal standard */}
      <PurchaseModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        purchase={edit} 
      />
      
      <PurchaseDetailModal isOpen={!!detail} onClose={() => setDetail(null)} purchase={detail} />
      
      <ConfirmModal
        isOpen={!!deleteId}
        title="Supprimer l'achat ?"
        message="Voulez-vous vraiment supprimer cet achat ? Le stock sera ajusté."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}