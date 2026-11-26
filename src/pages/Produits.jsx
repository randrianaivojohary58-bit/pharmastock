import { useState } from 'react';
import { Plus, Edit, Trash2, Upload } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { friendlyDeleteError } from '../utils/Errors';
import PageHeader from '../components/common/PageHeader';
import SearchBar from '../components/common/SearchBar';
import ProductModal from '../components/modals/ProductModal';
import ImportProductsModal from '../components/modals/ImportProductsModal';
import ConfirmModal from '../components/common/ConfirmModal';
import { formatMoney } from '../utils/format';
import { formatEmplacement } from '../utils/emplacement';
import { PRODUCT_TYPES } from '../utils/productTypes';

export default function Produits() {
  const { products, deleteProduct } = useData();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const filtered = products.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (!filterType || p.type === filterType);
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    const name = products.find(p => p.id === deleteId)?.name || deleteId;
    try {
      await deleteProduct(deleteId);
      showToast('Succès', `Produit « ${name} » supprimé`);
    } catch (err) {
      showToast('Erreur', friendlyDeleteError(err, 'ce produit'), 'error');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Produits"
        subtitle="Gestion du catalogue pharmaceutique"
        action={
          <div className="flex gap-2">
          <button
            onClick={() => setImportOpen(true)}
            className="h-10 px-4 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-gray-50"
          >
            <Upload className="w-4 h-4" /> Importer
          </button>
          <button
            onClick={() => { setEditProduct(null); setModalOpen(true); }}
            className="h-10 px-4 bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4" /> Nouveau produit
          </button>
          </div>
        }
      />

      <div className="flex gap-3 mb-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Rechercher un produit..."
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="h-10 px-3 bg-white border border-gray-200 rounded-lg text-xs"
        >
          <option value="">Tous les types</option>
          {PRODUCT_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Code</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Produit</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Type</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Cond.</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Prix achat</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Prix vente</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">P. Grossiste</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">P. Revendeur</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Stock</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Emplacement</th>
                <th className="px-4 py-3 text-center font-bold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr
                  key={p.id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-mono text-emerald-700 font-bold">
                    {p.id}
                  </td>
                  <td className="px-4 py-3">
                    <strong>{p.name}</strong>
                  </td>
                  <td className="px-4 py-3">{p.type}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-semibold border border-emerald-100">
                      {p.conditionnement || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{formatMoney(p.buyPrice)}</td>
                  <td className="px-4 py-3 font-bold">{formatMoney(p.price)}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatMoney(p.priceGrossiste || p.price)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatMoney(p.priceRevendeur || p.price)}
                  </td>
                  <td className="px-4 py-3">
                    <strong className={p.stock < 5 ? 'text-orange-500' : ''}>
                      {p.stock} ctn
                    </strong>
                  </td>
                  <td className="px-4 py-3 text-emerald-700">
                    {formatEmplacement(p)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => {
                          setEditProduct(p);
                          setModalOpen(true);
                        }}
                        className="w-7 h-7 bg-orange-50 text-orange-600 rounded hover:bg-orange-100 flex items-center justify-center"
                        title="Modifier"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setDeleteId(p.id)}
                        className="w-7 h-7 bg-red-50 text-red-600 rounded hover:bg-red-100 flex items-center justify-center"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        product={editProduct}
      />
      <ImportProductsModal isOpen={importOpen} onClose={() => setImportOpen(false)} />
      <ConfirmModal
        isOpen={!!deleteId}
        title="Supprimer le produit ?"
        message={`Voulez-vous vraiment supprimer « ${products.find(p => p.id === deleteId)?.name || deleteId} » ? Cette action est irréversible.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}