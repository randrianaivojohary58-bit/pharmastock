import { useState } from 'react';
import { useData } from '../context/DataContext';
import PageHeader from '../components/common/PageHeader';
import ConfirmModal from '../components/common/ConfirmModal';
import { Plus, Trash2, ClipboardList } from 'lucide-react';
import { formatDate } from '../utils/dates';
import { useToast } from '../context/ToastContext';

export default function Inventaires() {
  const { products, inventories, addInventory, deleteInventory } = useData();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Formulaire de nouvel inventaire
  const [form, setForm] = useState({
    productId: '',
    theoretical: 0,
    physical: 0,
  });

  // Quand on change de produit, on met à jour le stock théorique
  const handleProductChange = (productId) => {
    const product = products.find(p => p.id === productId);
    setForm({
      ...form,
      productId,
      theoretical: product?.stock || 0,
      physical: product?.stock || 0 // Par défaut, on suppose que le physique = théorique
    });
  };

  const handleSave = async () => {
    if (!form.productId) {
      showToast('Attention', 'Sélectionnez un produit', 'error');
      return;
    }

    const reference = `INV-${new Date().getFullYear()}-${String(inventories.length + 1).padStart(3, '0')}`;

    await addInventory({
      reference,
      date: new Date().toISOString().split('T')[0],
      productId: form.productId,
      theoretical: form.theoretical,
      physical: form.physical
    });

    showToast('Succès', 'Inventaire enregistré');
    setModalOpen(false);
    setForm({ productId: '', theoretical: 0, physical: 0 });
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteInventory(deleteId);
      showToast('Succès', 'Inventaire supprimé');
      setDeleteId(null);
    }
  };

  const gap = form.physical - form.theoretical;

  return (
    <div>
      <PageHeader
        title="Inventaires"
        subtitle="Contrôle physique des stocks"
        action={
          <button onClick={() => setModalOpen(true)}
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
                <th className="px-4 py-3 text-left font-bold text-gray-600">Produit</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Théorique</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Physique</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Écart</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Utilisateur</th>
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
                    <td className="px-4 py-3 font-mono text-emerald-700 font-bold">{i.reference}</td>
                    <td className="px-4 py-3">{formatDate(i.date_inventaire)}</td>
                    <td className="px-4 py-3"><strong>{i.produit?.nom || 'Produit supprimé'}</strong></td>
                    <td className="px-4 py-3">{i.stock_theorique}</td>
                    <td className="px-4 py-3">{i.stock_physique}</td>
                    <td className={`px-4 py-3 font-bold ${
                      i.ecart < 0 ? 'text-red-600' : i.ecart > 0 ? 'text-emerald-600' : 'text-gray-500'
                    }`}>{i.ecart > 0 ? '+' : ''}{i.ecart}</td>
                    <td className="px-4 py-3">{i.user_name || 'Inconnu'}</td>
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

      {/* MODALE NOUVEL INVENTAIRE */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold mb-4">Nouvel Inventaire</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">Produit *</label>
                <select 
                  value={form.productId} 
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs"
                >
                  <option value="">Sélectionner un produit</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Stock Théorique</label>
                  <input type="number" value={form.theoretical} disabled className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Stock Physique *</label>
                  <input type="number" value={form.physical} onChange={(e) => setForm({ ...form, physical: Number(e.target.value) })} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
                </div>
              </div>

              {form.productId && (
                <div className={`p-3 rounded-lg text-xs font-bold text-center ${
                  gap < 0 ? 'bg-red-50 text-red-700' : gap > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-600'
                }`}>
                  Écart : {gap > 0 ? '+' : ''}{gap} carton(s)
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-xs">Annuler</button>
              <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs">Enregistrer</button>
            </div>
          </div>
        </div>
      )}

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