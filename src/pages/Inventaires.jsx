import { useState, useEffect } from 'react';
import { Plus, Trash2, ClipboardList } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import ConfirmModal from '../components/common/ConfirmModal';
import { formatDate } from '../utils/dates';
import { useToast } from '../context/ToastContext';

export default function Inventaires() {
  const { showToast } = useToast();
  const [inventories, setInventories] = useState([]);
  const [deleteId, setDeleteId] = useState(null);

  // Charger depuis localStorage au démarrage
  useEffect(() => {
    const saved = localStorage.getItem('pharmastock_inventaires');
    if (saved) {
      try {
        setInventories(JSON.parse(saved));
      } catch (e) {
        console.error("Erreur de lecture localStorage", e);
      }
    }
  }, []);

  // Sauvegarder dans localStorage à chaque modification
  const saveToLocal = (newData) => {
    setInventories(newData);
    localStorage.setItem('pharmastock_inventaires', JSON.stringify(newData));
  };

  const handleNew = () => {
    const ref = `INV-2026-${String(inventories.length + 10).padStart(3, '0')}`;
    const newEntry = {
      id: Date.now(),
      ref,
      date: new Date().toISOString().split('T')[0],
      warehouse: 'Dépôt principal',
      theoretical: 1068,
      physical: 1068,
      gap: 0,
      status: 'En cours'
    };
    saveToLocal([newEntry, ...inventories]);
    showToast('Succès', 'Inventaire créé');
  };

  const handleDelete = () => {
    if (deleteId) {
      saveToLocal(inventories.filter(i => i.id !== deleteId));
      showToast('Succès', 'Inventaire supprimé');
      setDeleteId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Inventaires"
        subtitle="Contrôle physique des stocks"
        action={
          <button onClick={handleNew}
            className="h-10 px-4 bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-emerald-700">
            <Plus className="w-4 h-4" /> Nouvel inventaire
          </button>
        }
      />

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Référence</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Date</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Dépôt</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Théorique</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Physique</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Écart</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Statut</th>
                <th className="px-4 py-3 text-center font-bold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventories.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    <ClipboardList className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    Aucun inventaire enregistré
                  </td>
                </tr>
              ) : (
                inventories.map(i => (
                  <tr key={i.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-emerald-700 font-bold">{i.ref}</td>
                    <td className="px-4 py-3">{formatDate(i.date)}</td>
                    <td className="px-4 py-3"><strong>{i.warehouse}</strong></td>
                    <td className="px-4 py-3">{i.theoretical}</td>
                    <td className="px-4 py-3">{i.physical}</td>
                    <td className={`px-4 py-3 font-bold ${
                      i.gap < 0 ? 'text-red-600' : i.gap > 0 ? 'text-emerald-600' : ''
                    }`}>{i.gap > 0 ? '+' : ''}{i.gap}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">{i.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setDeleteId(i.id)}
                        className="w-7 h-7 bg-red-50 text-red-600 rounded hover:bg-red-100 flex items-center justify-center mx-auto">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Supprimer l'inventaire ?"
        message="Voulez-vous vraiment supprimer cet inventaire ?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}