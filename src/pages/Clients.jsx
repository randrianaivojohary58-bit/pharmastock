import { useState } from 'react';
import { Plus, Edit, Trash2, Star } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { friendlyDeleteError } from '../utils/Errors';
import PageHeader from '../components/common/PageHeader';
import SearchBar from '../components/common/SearchBar';
import ClientModal from '../components/modals/ClientModal';
import ConfirmModal from '../components/common/ConfirmModal';
import { formatMoney } from '../utils/format';
import { saleRest, isOverdue, CREDIT_DAYS } from '../utils/salesStats';

export default function Clients() {
  const { clients, sales, deleteClient } = useData();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const filtered = clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone || '').includes(search);
    return matchSearch && (!filterType || c.type === filterType);
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    const name = clients.find(c => c.id === deleteId)?.name || 'Client';
    try {
      await deleteClient(deleteId);
      showToast('Succès', `Client « ${name} » supprimé`);
    } catch (err) {
      showToast('Erreur', friendlyDeleteError(err, 'ce client'), 'error');
    } finally {
      setDeleteId(null);
    }
  };

  // Encours d'un client : ce qu'il doit encore payer sur des ventes déjà livrées
  const getEncours = (client) => {
    const clientSales = sales.filter(s => s.client === client.name);
    return {
      rest: clientSales.reduce((a, s) => a + saleRest(s), 0),
      overdue: clientSales.filter(isOverdue).length
    };
  };

  return (
    <div>
      <PageHeader
        title="Clients"
        subtitle="Gestion des clients"
        action={
          <button onClick={() => { setEdit(null); setModalOpen(true); }}
            className="h-10 px-4 bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-emerald-700">
            <Plus className="w-4 h-4" /> Nouveau client
          </button>
        }
      />

      <div className="flex gap-3 mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un client..." />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
          className="h-10 px-3 bg-white border border-gray-200 rounded-lg text-xs">
          <option value="">Tous les types</option>
          <option>Pharmacie</option><option>Clinique</option><option>Hôpital</option>
          <option>Revendeur</option><option>Grossiste</option><option>Particulier</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => {
          const { rest, overdue } = getEncours(c);
          return (
            <div key={c.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md relative">
              <div className="absolute top-3 right-3 flex gap-1">
                <button onClick={() => { setEdit(c); setModalOpen(true); }}
                  className="w-8 h-8 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 flex items-center justify-center">
                  <Edit className="w-3 h-3" />
                </button>
                <button onClick={() => setDeleteId(c.id)}
                  className="w-8 h-8 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <h3 className="text-sm font-bold text-emerald-800 mb-1 pr-16">
                {c.name} {c.fidele && <Star className="inline w-3 h-3 text-yellow-500 fill-yellow-500" />}
              </h3>
              <p className="text-xs text-gray-500 mb-3">{c.type} — {c.phone}</p>

              <div className="flex flex-wrap gap-1.5">
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                  c.status === 'Actif' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                }`}>{c.status}</span>
                {c.fidele && (
                  <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700">
                    Crédit {CREDIT_DAYS} jours
                  </span>
                )}
                {overdue > 0 && (
                  <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                    {overdue} facture(s) en retard
                  </span>
                )}
              </div>

              {rest > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs">
                  <span className="text-gray-500">Reste à payer</span>
                  <strong className={overdue > 0 ? 'text-red-600' : 'text-orange-600'}>{formatMoney(rest)}</strong>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ClientModal isOpen={modalOpen} onClose={() => setModalOpen(false)} client={edit} />
      <ConfirmModal
        isOpen={!!deleteId}
        title="Supprimer le client ?"
        message={`Voulez-vous vraiment supprimer « ${clients.find(c => c.id === deleteId)?.name || 'ce client'} » ? Cette action est irréversible.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}