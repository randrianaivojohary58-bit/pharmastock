import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { friendlyDeleteError } from '../utils/Errors';
import PageHeader from '../components/common/PageHeader';
import SearchBar from '../components/common/SearchBar';
import SupplierModal from '../components/modals/SupplierModal';
import ConfirmModal from '../components/common/ConfirmModal';
import { getSupplierMargins } from '../utils/pricing';

export default function Fournisseurs() {
  const { suppliers, deleteSupplier } = useData();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || (s.country || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteId) return;
    const name = suppliers.find(s => s.id === deleteId)?.name || 'Fournisseur';
    try {
      await deleteSupplier(deleteId);
      showToast('Succès', `Fournisseur « ${name} » supprimé`);
    } catch (err) {
      showToast('Erreur', friendlyDeleteError(err, 'ce fournisseur'), 'error');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Fournisseurs"
        subtitle="Gestion des fournisseurs et de leurs marges"
        action={
          <button onClick={() => { setEdit(null); setModalOpen(true); }}
            className="h-10 px-4 bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-emerald-700">
            <Plus className="w-4 h-4" /> Nouveau fournisseur
          </button>
        }
      />

      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un fournisseur..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(s => {
          const m = getSupplierMargins(s);
          return (
            <div key={s.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md relative">
              <div className="absolute top-3 right-3 flex gap-1">
                <button onClick={() => { setEdit(s); setModalOpen(true); }}
                  className="w-8 h-8 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 flex items-center justify-center">
                  <Edit className="w-3 h-3" />
                </button>
                <button onClick={() => setDeleteId(s.id)}
                  className="w-8 h-8 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <h3 className="text-sm font-bold text-emerald-800 mb-1 pr-16">{s.name}</h3>
              <p className="text-xs text-gray-500 mb-3">{s.type} — {s.country}</p>

              <div className="flex flex-wrap gap-1.5">
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                  s.status === 'Actif' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                }`}>{s.status}</span>
                <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                  Marge {m.margin} %
                </span>
              </div>

              <p className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-500">
                Revendeur {m.marginRevendeur} % · Grossiste {m.marginGrossiste} %
              </p>
            </div>
          );
        })}
      </div>

      <SupplierModal isOpen={modalOpen} onClose={() => setModalOpen(false)} supplier={edit} />
      <ConfirmModal
        isOpen={!!deleteId}
        title="Supprimer le fournisseur ?"
        message={`Voulez-vous vraiment supprimer « ${suppliers.find(s => s.id === deleteId)?.name || 'ce fournisseur'} » ? Cette action est irréversible.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}