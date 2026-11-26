import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { AlertCircle } from 'lucide-react';
import { PRODUCT_TYPES } from '../../utils/productTypes';
import { LOCATION_LEVELS, formatEmplacement } from '../../utils/emplacement';

const CONDS = ['Chassie (carton)', 'Boîte', 'Flacon', 'Tube', 'Sachet', 'Ampoule', 'Pot', 'Blister', 'Étui'];

const EMPTY_FORM = {
  code: '', name: '', type: PRODUCT_TYPES[0], conditionnement: 'Boîte',
  category: '', tva: 20, buyPrice: 0, price: 0, priceGrossiste: 0, priceRevendeur: 0,
  rayon: '', allee: '', etagere: '', casier: ''
};

export default function ProductModal({ isOpen, onClose, product }) {
  const { products, locations, addProduct, updateProduct } = useData();
  const { showToast } = useToast();
  const isEdit = !!product;

  const [form, setForm] = useState(EMPTY_FORM);

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
        rayon: product.rayon || '', allee: product.allee || '',
        etagere: product.etagere || '', casier: product.casier || ''
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [product, isOpen]);

  const productNames = [...new Set(products.map(p => p.name))].sort();

  // Si le type du produit n'est plus dans la liste (ex. « Autre »), on l'affiche quand même
  const typeOptions = !form.type || PRODUCT_TYPES.includes(form.type)
    ? PRODUCT_TYPES
    : [form.type, ...PRODUCT_TYPES];

  // Valeurs d'emplacement déjà utilisées, proposées en suggestion
  const locationSuggestions = (key) =>
    [...new Set((locations || []).map(l => (l[key] || '').trim()).filter(Boolean))].sort();

  const handleSave = async () => {
    if (!form.code.trim() || !form.name.trim()) {
      showToast('Attention', 'Code et nom requis', 'error');
      return;
    }

    // Le stock et la péremption se gèrent par lot : un code existant ne peut pas être recréé ici
    if (isExistingProduct) {
      showToast('Attention', 'Ce code existe déjà. Pour ajouter du stock, utilisez la page Lots.', 'error');
      return;
    }

    try {
      if (isEdit) {
        await updateProduct(product.id, form);
        showToast('Succès', 'Produit modifié');
      } else {
        // Le produit est créé sans stock : le stock entre par un lot (page Lots) ou par un achat
        await addProduct({ ...form, stock: 0, expiry: '' });
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
              <AlertCircle className="w-3 h-3" /> Ce code existe déjà. Choisissez un autre code.
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
            {typeOptions.map(t => <option key={t}>{t}</option>)}
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

        {/* EMPLACEMENT : Pièce > Équipement > Niveau > Case */}
        <div className="col-span-2">
          <label className="block text-xs font-medium mb-1.5">Emplacement</label>
          <div className="grid grid-cols-2 gap-3">
            {LOCATION_LEVELS.map(level => (
              <div key={level.key}>
                <span className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1">{level.label}</span>
                <input
                  list={`prod-loc-${level.key}`}
                  placeholder={level.placeholder}
                  value={form[level.key] || ''}
                  onChange={(e) => setForm({ ...form, [level.key]: e.target.value })}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs"
                />
                <datalist id={`prod-loc-${level.key}`}>
                  {locationSuggestions(level.key).map(v => <option key={v} value={v} />)}
                </datalist>
              </div>
            ))}
          </div>
          <div className="mt-2 px-3 py-2 bg-emerald-100 text-emerald-700 text-xs rounded-lg font-semibold">
            {formatEmplacement(form)}
          </div>
        </div>

        {/* Le stock et la péremption ne se saisissent plus ici */}
        <div className="col-span-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[11px] text-gray-500">
          Le stock et la date de péremption se saisissent par <strong>lot</strong> : page <strong>Lots</strong>, ou directement dans un <strong>achat</strong>.
        </div>

      </div>
    </Modal>
  );
}