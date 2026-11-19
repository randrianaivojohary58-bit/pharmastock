import { useState, useEffect } from 'react';
import Modal from './Modal';
import CustomSelect from '../common/CustomSelect';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

const TYPES = ['Comprimé', 'Sirop', 'Injectable', 'Suppositoire', 'Pommade', 'Gouttes', 'Consommables'];
const CONDS = ['Chassie (carton)', 'Boîte', 'Flacon', 'Tube', 'Sachet', 'Ampoule', 'Pot', 'Blister', 'Étui'];

export default function ProductModal({ isOpen, onClose, product }) {
  const { products, addProduct, updateProduct } = useData();
  const { showToast } = useToast();
  const isEdit = !!product;

  const [form, setForm] = useState({
    code: '', name: '', type: 'Comprimé', conditionnement: 'Boîte',
    category: '', tva: 20, buyPrice: 0, price: 0, stock: 0,
    rayon: '', allee: '', etagere: '', expiry: ''
  });

  useEffect(() => {
    if (product) {
      setForm({
        code: product.id, name: product.name, type: product.type,
        conditionnement: product.conditionnement || 'Boîte',
        category: product.category || '', tva: product.tva,
        buyPrice: product.buyPrice, price: product.price, stock: product.stock,
        rayon: product.rayon || '', allee: product.allee || '', etagere: product.etagere || '',
        expiry: product.lots?.[0]?.expiry || ''
      });
    } else {
      setForm({
        code: '', name: '', type: 'Comprimé', conditionnement: 'Boîte',
        category: '', tva: 20, buyPrice: 0, price: 0, stock: 0,
        rayon: '', allee: '', etagere: '', expiry: ''
      });
    }
  }, [product, isOpen]);

  const productNames = [...new Set(products.map(p => p.name))].sort();

  const handleSave = async () => {
    if (!form.code || !form.name) {
      showToast('Attention', 'Code et nom requis', 'error');
      return;
    }

    try {
      if (isEdit) {
        await updateProduct(product.id, form);
        showToast('Succès', 'Produit modifié');
      } else {
        if (products.some(p => p.id === form.code)) {
          showToast('Attention', 'Code déjà utilisé', 'error');
          return;
        }
        await addProduct(form);
        showToast('Succès', 'Produit ajouté');
      }
      onClose();
    } catch (err) {
      showToast('Erreur', err.message, 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen} onClose={onClose}
      title={isEdit ? 'Modifier le produit' : 'Ajouter un produit'} label="PRODUIT"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-xs">Annuler</button>
          <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700">Enregistrer</button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium mb-1.5">Code *</label>
          <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
            disabled={isEdit} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs disabled:bg-gray-50" />
        </div>
        <CustomSelect
          label="Nom * (recherche/saisie)"
          options={productNames}
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
          allowCreate
          placeholder="Rechercher ou saisir..."
        />
        <div>
          <label className="block text-xs font-medium mb-1.5">Type *</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs">
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5">Conditionnement *</label>
          <select value={form.conditionnement} onChange={(e) => setForm({ ...form, conditionnement: e.target.value })}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs">
            {CONDS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5">Catégorie</label>
          <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5">TVA *</label>
          <select value={form.tva} onChange={(e) => setForm({ ...form, tva: Number(e.target.value) })}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs">
            <option value={0}>0%</option><option value={10}>10%</option><option value={20}>20%</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5">Prix achat *</label>
          <input type="number" value={form.buyPrice} onChange={(e) => setForm({ ...form, buyPrice: Number(e.target.value) })}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5">Prix vente *</label>
          <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium mb-1.5">Emplacement</label>
          <div className="flex gap-2 items-center">
            <input placeholder="Rayon" value={form.rayon} onChange={(e) => setForm({ ...form, rayon: e.target.value })}
              className="w-24 h-10 px-3 border border-gray-200 rounded-lg text-xs" />
            <input placeholder="Allée" value={form.allee} onChange={(e) => setForm({ ...form, allee: e.target.value })}
              className="w-24 h-10 px-3 border border-gray-200 rounded-lg text-xs" />
            <input placeholder="Étagère" value={form.etagere} onChange={(e) => setForm({ ...form, etagere: e.target.value })}
              className="w-24 h-10 px-3 border border-gray-200 rounded-lg text-xs" />
            <span className="px-3 py-2 bg-emerald-100 text-emerald-700 text-xs rounded-lg font-semibold">
              {form.rayon || '?'}-{form.allee || '?'}-{form.etagere || '?'}
            </span>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5">Stock</label>
          <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5">Date péremption</label>
          <input type="date" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
        </div>
      </div>
    </Modal>
  );
}