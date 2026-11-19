import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

const TYPES = ['Grossiste', 'Laboratoire', 'Importateur', 'Distributeur'];

export default function SupplierModal({ isOpen, onClose, supplier }) {
  const { addSupplier, updateSupplier } = useData();
  const { showToast } = useToast();
  const isEdit = !!supplier;

  const [form, setForm] = useState({ name: '', type: 'Grossiste', phone: '', country: '', email: '', nif: '', stat: '' });

  useEffect(() => {
    if (supplier) setForm({ name: supplier.name, type: supplier.type, phone: supplier.phone || '', country: supplier.country || '', email: supplier.email || '', nif: supplier.nif || '', stat: supplier.stat || '' });
    else setForm({ name: '', type: 'Grossiste', phone: '', country: '', email: '', nif: '', stat: '' });
  }, [supplier, isOpen]);

  const handleSave = async () => {
    if (!form.name) { showToast('Attention', 'Nom requis', 'error'); return; }
    try {
      if (isEdit) {
        await updateSupplier(supplier.id, form);
        showToast('Succès', 'Fournisseur modifié');
      } else {
        await addSupplier(form);
        showToast('Succès', 'Fournisseur ajouté');
      }
      onClose();
    } catch (err) {
      showToast('Erreur', err.message, 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Modifier le fournisseur' : 'Ajouter un fournisseur'} label="FOURNISSEUR" maxWidth="max-w-xl"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-xs">Annuler</button>
          <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs">Enregistrer</button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium mb-1.5">Nom *</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5">Type</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs">
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5">Téléphone</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5">Pays</label>
          <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5">Email</label>
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5">NIF</label>
          <input value={form.nif} onChange={(e) => setForm({ ...form, nif: e.target.value })} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5">STAT</label>
          <input value={form.stat} onChange={(e) => setForm({ ...form, stat: e.target.value })} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
        </div>
      </div>
    </Modal>
  );
}