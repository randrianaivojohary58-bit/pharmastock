import { useState } from 'react';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { friendlyDeleteError } from '../utils/Errors';
import PageHeader from '../components/common/PageHeader';
import SearchBar from '../components/common/SearchBar';
import LocationModal from '../components/modals/LocationModal';
import ConfirmModal from '../components/common/ConfirmModal';
import { LOCATION_LEVELS, formatEmplacement } from '../utils/emplacement';

export default function Emplacements() {
  const { locations, products, deleteLocation } = useData();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const q = search.toLowerCase();
  const filtered = locations.filter(l =>
    formatEmplacement(l, ' ').toLowerCase().includes(q) || (l.description || '').toLowerCase().includes(q)
  );

  const handleDelete = async () => {
    if (!deleteId) return;
    const label = formatEmplacement(locations.find(l => l.id === deleteId));
    try {
      await deleteLocation(deleteId);
      showToast('Succès', `Emplacement « ${label} » supprimé`);
    } catch (err) {
      showToast('Erreur', friendlyDeleteError(err, 'cet emplacement'), 'error');
    } finally {
      setDeleteId(null);
    }
  };

  // Produits rangés dans cet emplacement (les quatre niveaux doivent correspondre)
  const countProducts = (loc) => products.filter(p =>
    LOCATION_LEVELS.every(({ key }) => (p[key] || '') === (loc[key] || ''))
  ).length;

  return (
    <div>
      <PageHeader
        title="Emplacements"
        subtitle="Pièce › Équipement › Niveau › Case"
        action={
          <button onClick={() => { setEdit(null); setModalOpen(true); }}
            className="h-10 px-4 bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-emerald-700">
            <Plus className="w-4 h-4" /> Nouvel emplacement
          </button>
        }
      />

      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un emplacement..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(loc => (
          <div key={loc.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm relative">
            <div className="absolute top-3 right-3 flex gap-1">
              <button onClick={() => { setEdit(loc); setModalOpen(true); }}
                className="w-8 h-8 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 flex items-center justify-center">
                <Edit className="w-3 h-3" />
              </button>
              <button onClick={() => setDeleteId(loc.id)}
                className="w-8 h-8 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-3 pr-16">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] uppercase tracking-wider text-gray-400">Pièce</span>
                <h3 className="text-base font-bold text-emerald-800 truncate">{loc.rayon || '—'}</h3>
              </div>
            </div>

            <div className="space-y-1.5 mb-3 text-xs">
              {LOCATION_LEVELS.slice(1).map(level => (
                <div key={level.key} className="flex justify-between gap-3 border-b border-gray-50 pb-1">
                  <span className="text-gray-400">{level.label}</span>
                  <strong className="text-gray-700 text-right">{loc[level.key] || '—'}</strong>
                </div>
              ))}
            </div>

            {loc.description && <p className="text-xs text-gray-600 mb-3">{loc.description}</p>}

            <div className="bg-emerald-50 rounded-lg p-2 text-xs text-emerald-700 font-semibold text-center">
              <span className="inline-block mr-1">💊</span> {countProducts(loc)} produit(s) stocké(s)
            </div>
          </div>
        ))}
      </div>

      <LocationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} location={edit} />
      <ConfirmModal
        isOpen={!!deleteId}
        title="Supprimer l'emplacement ?"
        message={`Voulez-vous vraiment supprimer l'emplacement « ${formatEmplacement(locations.find(l => l.id === deleteId))} » ? Cette action est irréversible.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}