import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export default function LotModal({ isOpen, onClose, productId, lotId }) {
  // Assure-toi d'avoir addLot et updateLot dans ton DataContext
  const { products, addLot, updateLot } = useData();
  const { showToast } = useToast();
  const isEdit = !!(productId && lotId);

  const [form, setForm] = useState({ productId: '', productLabel: '', lotNumber: '', quantity: 0, expiry: '', promoRate: 0 });
  const [productSearch, setProductSearch] = useState('');
  const [productOpen, setProductOpen] = useState(false);

  const productLabelOf = (p) => `${p.name} — ${p.conditionnement || '—'}`;

  // Recherche sur le nom, le code, le code-barres, la DCI, la référence et le conditionnement
  const query = productSearch.trim().toLowerCase();
  const filteredProducts = products.filter(p => {
    if (!query) return true;
    return [p.name, p.id, p.code, p.barcode, p.dci, p.reference, p.conditionnement]
      .some(v => String(v || '').toLowerCase().includes(query));
  });

  useEffect(() => {
    if (isEdit) {
      const product = products.find(p => p.id === productId);
      const lot = product?.lots.find(l => l.id === lotId);
      if (product && lot) {
        setForm({
          productId: product.id,
          productLabel: `${product.name} — ${product.conditionnement || '—'}`,
          lotNumber: lot.id,
          quantity: lot.stock,
          expiry: lot.expiry,
          promoRate: lot.promoRate || 0
        });
      }
    } else {
      setForm({ productId: '', productLabel: '', lotNumber: '', quantity: 0, expiry: '', promoRate: 0 });
    }
    setProductOpen(false);
    setProductSearch('');
  }, [isOpen, productId, lotId, products]);

  const daysLeft = form.expiry
    ? Math.ceil((new Date(form.expiry) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const handleSelectProduct = (p) => {
    setForm({ ...form, productId: p.id, productLabel: productLabelOf(p) });
    setProductOpen(false);
    setProductSearch('');
  };

  const handleSave = async () => {
    if (!form.productId || !form.lotNumber || !form.quantity || !form.expiry) {
      showToast('Attention', 'Tous les champs requis', 'error');
      return;
    }

    const promoRate = Number(form.promoRate) || 0;
    if (promoRate < 0 || promoRate > 100) {
      showToast('Attention', 'La promotion doit être comprise entre 0 et 100 %', 'error');
      return;
    }

    try {
      if (isEdit) {
        await updateLot(productId, lotId, form);
        showToast('Succès', 'Lot modifié');
      } else {
        await addLot(form);
        showToast('Succès', 'Lot ajouté');
      }
      onClose();
    } catch (err) {
      showToast('Erreur', err.message, 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen} onClose={onClose}
      title={isEdit ? 'Modifier le lot' : 'Ajouter un lot'}
      label="LOT" maxWidth="max-w-xl"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-xs">Annuler</button>
          <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs">Enregistrer</button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="relative">
          <label className="block text-xs font-medium mb-1.5">Produit *</label>
          <input
            type="text"
            value={productOpen ? productSearch : form.productLabel}
            onFocus={() => { setProductOpen(true); setProductSearch(''); }}
            onChange={(e) => { setProductOpen(true); setProductSearch(e.target.value); }}
            onBlur={() => setProductOpen(false)}
            onKeyDown={(e) => { if (e.key === 'Escape') { setProductOpen(false); setProductSearch(''); } }}
            placeholder="Rechercher un produit (nom, code, DCI...)"
            autoComplete="off"
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
          {productOpen && (
            <div
              onMouseDown={(e) => e.preventDefault()}
              className="absolute z-50 top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl"
            >
              {filteredProducts.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectProduct(p)}
                  className={`w-full px-3 py-2.5 text-left hover:bg-emerald-50 border-b border-gray-100 last:border-0 ${
                    form.productId === p.id ? 'bg-emerald-50' : ''
                  }`}
                >
                  <span className="block text-xs font-semibold text-gray-800">{p.name}</span>
                  <span className="block mt-0.5 text-[10px] text-gray-500">
                    {p.id} · {p.conditionnement || '—'} · Stock : {p.stock || 0}
                  </span>
                </button>
              ))}
              {filteredProducts.length === 0 && (
                <p className="px-3 py-4 text-center text-xs text-gray-500">Aucun produit trouvé</p>
              )}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1.5">N° de lot *</label>
            <input value={form.lotNumber} onChange={(e) => setForm({ ...form, lotNumber: e.target.value })}
              className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5">Quantité *</label>
            <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
              className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1.5">Date expiration *</label>
            <input type="date" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })}
              className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
            {daysLeft !== null && (
              <p className={`text-[10px] mt-1 font-semibold ${daysLeft <= 90 ? 'text-orange-600' : 'text-gray-400'}`}>
                {daysLeft < 0 ? `Expiré depuis ${Math.abs(daysLeft)} j` : `Expire dans ${daysLeft} jours`}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5">Promotion (%)</label>
            <input type="number" min={0} max={100} step="0.5" value={form.promoRate}
              onChange={(e) => setForm({ ...form, promoRate: e.target.value === '' ? '' : Number(e.target.value) })}
              placeholder="0"
              className="w-full h-10 px-3 border border-orange-200 bg-orange-50 rounded-lg text-xs font-bold text-orange-600" />
            <p className="text-[10px] mt-1 text-gray-400">Pour écouler ce lot avant péremption. 0 = pas de promo.</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}