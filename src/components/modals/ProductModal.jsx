import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { AlertCircle } from 'lucide-react';

const TYPES = ['Comprimé', 'Sirop', 'Injectable', 'Suppositoire', 'Pommade', 'Gouttes', 'Consommables', 'Autre'];
const CONDS = ['Chassie (carton)', 'Boîte', 'Flacon', 'Tube', 'Sachet', 'Ampoule', 'Pot', 'Blister', 'Étui'];

export default function ProductModal({ isOpen, onClose, product }) {
  const { products, addProduct, updateProduct } = useData();
  const { showToast } = useToast();
  const isEdit = !!product;

  const [form, setForm] = useState({
    code: '', name: '', type: 'Comprimé', conditionnement: 'Boîte',
    category: '', tva: 20, buyPrice: 0, price: 0, priceGrossiste: 0, priceRevendeur: 0,
    stock: 0, rayon: '', allee: '', etagere: '', expiry: ''
  });

  // Vérifier si le code saisi correspond à un produit existant
  const isExistingProduct = !isEdit && products.some(p => p.id === form.code);

  useEffect(() => {
    if (product) {
      setForm({
        code: product.id, name: product.name, type: product.type,
        conditionnement: product.conditionnement || 'Boîte',
        category: product.category || '', tva: product.tva,
        buyPrice: product.buyPrice, price: product.price,
        priceGrossiste: product.priceGrossiste || product.price || 0,
        priceRevendeur: product.priceRevendeur || product.price || 0,
        stock: product.stock,
        rayon: product.rayon || '', allee: product.allee || '', etagere: product.etagere || '',
        expiry: product.lots?.[0]?.expiry || ''
      });
    } else {
      setForm({
        code: '', name: '', type: 'Comprimé', conditionnement: 'Boîte',
        category: '', tva: 20, buyPrice: 0, price: 0, priceGrossiste: 0, priceRevendeur: 0,
        stock: 0, rayon: '', allee: '', etagere: '', expiry: ''
      });
    }
  }, [product, isOpen]);

  const productNames = [...new Set(products.map(p => p.name))].sort();

  const handleSave = async () => {
    if (!form.code.trim() || !form.name.trim()) {
      showToast('Attention', 'Code et nom requis', 'error');
      return;
    }

    // Si c'est un produit existant (nouveau lot), vérifier qu'il y a une date et un stock
    if (isExistingProduct && (!form.expiry || form.stock <= 0)) {
      showToast('Attention', 'Pour ajouter un nouveau lot, saisissez une date de péremption et une quantité > 0.', 'error');
      return;
    }

    try {
      if (isEdit) {
        await updateProduct(product.id, form);
        showToast('Succès', 'Produit modifié');
      } else {
        await addProduct(form);
        showToast('Succès', isExistingProduct ? 'Nouveau lot ajouté' : 'Produit ajouté');
      }
      onClose();
    } catch (err) {
      showToast('Erreur', err.message, 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen} onClose={onClose}
      title={isEdit ? 'Modifier le produit' : 'Ajouter un produit / lot'} label="PRODUIT"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-xs">Annuler</button>
          <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700">Enregistrer</button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        
        {/* CHAMP CODE AVEC ALERTE */}
        <div>
          <label className="block text-xs font-medium mb-1.5">Code *</label>
          <input 
            value={form.code} 
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            disabled={isEdit} 
            className={`w-full h-10 px-3 border rounded-lg text-xs disabled:bg-gray-50 ${
              isExistingProduct ? 'border-orange-400 bg-orange-50' : 'border-gray-200'
            }`} 
          />
          {isExistingProduct && (
            <p className="text-[10px] text-orange-600 font-bold mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Ce code existe déjà. Un nouveau lot sera ajouté.
            </p>
          )}
        </div>
        
        {/* CHAMP NOM */}
        <div>
          <label className="block text-xs font-medium mb-1.5">Nom * (choisir ou saisir)</label>
          <input 
            list="product-names"
            value={form.name} 
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" 
            placeholder="Rechercher ou saisir un nouveau nom..."
          />
          <datalist id="product-names">
            {productNames.map(name => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>

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
        
        {/* SECTION DES PRIX */}
        <div>
          <label className="block text-xs font-medium mb-1.5">Prix achat *</label>
          <input type="number" value={form.buyPrice} onChange={(e) => setForm({ ...form, buyPrice: Number(e.target.value) })}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5">Prix vente (Détail) *</label>
          <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5">Prix Grossiste</label>
          <input type="number" value={form.priceGrossiste} onChange={(e) => setForm({ ...form, priceGrossiste: Number(e.target.value) })}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5">Prix Revendeur</label>
          <input type="number" value={form.priceRevendeur} onChange={(e) => setForm({ ...form, priceRevendeur: Number(e.target.value) })}
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

        {/* SECTION STOCK ET PÉREMPTION (Mise en avant) */}
        <div className="col-span-2 mt-2 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
          <h4 className="text-xs font-bold text-emerald-800 mb-3">
            {isExistingProduct ? "Détails du nouveau lot" : "Premier lot / Stock initial"}
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5">Quantité (stock) *</label>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">Date de péremption *</label>
              <input type="date" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
            </div>
          </div>
        </div>

      </div>
    </Modal>
  );
}