import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import PageHeader from '../components/common/PageHeader';
import SearchBar from '../components/common/SearchBar';
import ProductModal from '../components/modals/ProductModal';
import ConfirmModal from '../components/common/ConfirmModal';
import { formatMoney } from '../utils/format';
import { formatDate, expiryStatus } from '../utils/dates';
import { getNearestLot, getEmplacement } from '../utils/stock';

export default function Produits() {
  const { products, deleteProduct } = useData();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (!filterType || p.type === filterType);
  });

  const handleDelete = async () => {
    if (deleteId) {
      await deleteProduct(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Produits"
        subtitle="Gestion du catalogue pharmaceutique"
        action={
          <button onClick={() => { setEditProduct(null); setModalOpen(true); }}
            className="h-10 px-4 bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-emerald-700">
            <Plus className="w-4 h-4" /> Nouveau produit
          </button>
        }
      />

      <div className="flex gap-3 mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un produit..." />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
          className="h-10 px-3 bg-white border border-gray-200 rounded-lg text-xs">
          <option value="">Tous les types</option>
          <option>Comprimé</option><option>Sirop</option><option>Injectable</option>
          <option>Suppositoire</option><option>Pommade</option><option>Gouttes</option><option>Consommables</option>
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
                {/* 👇 NOUVELLES COLONNES PRIX */}
                <th className="px-4 py-3 text-left font-bold text-gray-600">P. Grossiste</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">P. Revendeur</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Stock</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Emplacement</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Péremption</th>
                <th className="px-4 py-3 text-center font-bold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const nearest = getNearestLot(p);
                const st = nearest ? expiryStatus(nearest.expiry) : { label: '-', color: 'text-gray-500' };
                return (
                  <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-emerald-700 font-bold">{p.id}</td>
                    <td className="px-4 py-3"><strong>{p.name}</strong></td>
                    <td className="px-4 py-3">{p.type}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-semibold border border-emerald-100">
                        {p.conditionnement || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{formatMoney(p.buyPrice)}</td>
                    <td className="px-4 py-3 font-bold">{formatMoney(p.price)}</td>
                    {/* 👇 NOUVELLES VALEURS PRIX */}
                    <td className="px-4 py-3 text-gray-600">{formatMoney(p.priceGrossiste || p.price)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatMoney(p.priceRevendeur || p.price)}</td>
                    <td className="px-4 py-3"><strong className={p.stock < 5 ? 'text-orange-500' : ''}>{p.stock} ctn</strong></td>
                    <td className="px-4 py-3 text-emerald-700">{getEmplacement(p)}</td>
                    <td className={`px-4 py-3 ${st.color}`}>{nearest ? formatDate(nearest.expiry) : '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => { setEditProduct(p); setModalOpen(true); }}
                          className="w-7 h-7 bg-orange-50 text-orange-600 rounded hover:bg-orange-100 flex items-center justify-center">
                          <Edit className="w-3 h-3" />
                        </button>
                        <button onClick={() => setDeleteId(p.id)}
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

      <ProductModal isOpen={modalOpen} onClose={() => setModalOpen(false)} product={editProduct} />
      <ConfirmModal
        isOpen={!!deleteId}
        title="Supprimer le produit ?"
        message={`Voulez-vous vraiment supprimer "${deleteId}" ?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}