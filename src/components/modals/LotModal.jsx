import { useState, useEffect } from 'react';
import Modal from './Modal';
import CustomSelect from '../common/CustomSelect';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export default function LotModal({ isOpen, onClose, productId, lotId }) {
  // Assure-toi d'avoir addLot et updateLot dans ton DataContext
  const { products, addLot, updateLot } = useData();
  const { showToast } = useToast();
  const isEdit = !!(productId && lotId);

  const [form, setForm] = useState({ productId: '', productLabel: '', lotNumber: '', quantity: 0, expiry: '' });

  const productOptions = products.map(p => `${p.name} — ${p.conditionnement || '—'}`);

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
          expiry: lot.expiry
        });
      }
    } else {
      setForm({ productId: '', productLabel: '', lotNumber: '', quantity: 0, expiry: '' });
    }
  }, [isOpen, productId, lotId, products]);

  const handleProductChange = (label) => {
    const product = products.find(p => `${p.name} — ${p.conditionnement || '—'}` === label);
    setForm({ ...form, productId: product?.id || '', productLabel: label });
  };

  const handleSave = async () => {
    if (!form.productId || !form.lotNumber || !form.quantity || !form.expiry) {
      showToast('Attention', 'Tous les champs requis', 'error');
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
        <CustomSelect
          label="Produit *"
          options={productOptions}
          value={form.productLabel}
          onChange={handleProductChange}
          placeholder="Rechercher un produit..."
        />
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
        <div>
          <label className="block text-xs font-medium mb-1.5">Date expiration *</label>
          <input type="date" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
        </div>
      </div>
    </Modal>
  );
}