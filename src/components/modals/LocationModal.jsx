import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export default function LocationModal({ isOpen, onClose, location }) {
  // Assure-toi d'avoir ces fonctions dans ton DataContext
  const { locations, addLocation, updateLocation } = useData();
  const { showToast } = useToast();
  const isEdit = !!location;

  const [form, setForm] = useState({ rayon: '', allee: '', etagere: '', description: '' });

  useEffect(() => {
    if (location) {
      setForm({ rayon: location.rayon, allee: location.allee, etagere: location.etagere, description: location.description || '' });
    } else {
      setForm({ rayon: '', allee: '', etagere: '', description: '' });
    }
  }, [location, isOpen]);

  const handleSave = async () => {
    if (!form.rayon || !form.allee || !form.etagere) {
      showToast('Attention', 'Rayon, allée et étagère requis', 'error');
      return;
    }
    try {
      if (isEdit) {
        await updateLocation(location.id, form);
        showToast('Succès', 'Emplacement modifié');
      } else {
        await addLocation(form);
        showToast('Succès', 'Emplacement ajouté');
      }
      onClose();
    } catch (err) {
      showToast('Erreur', err.message, 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen} onClose={onClose}
      title={isEdit ? 'Modifier l\'emplacement' : 'Nouvel emplacement'}
      label="EMPLACEMENT" maxWidth="max-w-md"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-xs">Annuler</button>
          <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs">Enregistrer</button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1.5">Rayon *</label>
          <input value={form.rayon} onChange={(e) => setForm({ ...form, rayon: e.target.value })}
            placeholder="Ex: A" className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5">Allée *</label>
          <input value={form.allee} onChange={(e) => setForm({ ...form, allee: e.target.value })}
            placeholder="Ex: 3" className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5">Étagère *</label>
          <input value={form.etagere} onChange={(e) => setForm({ ...form, etagere: e.target.value })}
            placeholder="Ex: 2" className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium mb-1.5">Description</label>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
        </div>
      </div>
    </Modal>
  );
}