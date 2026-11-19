import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

const TYPES = ['Pharmacie', 'Clinique', 'Hôpital', 'Revendeur', 'Grossiste', 'Particulier'];

export default function ClientModal({ isOpen, onClose, client }) {
  // On récupère les fonctions de Supabase
  const { addClient, updateClient } = useData();
  const { showToast } = useToast();
  const isEdit = !!client;

  const [form, setForm] = useState({
    name: '', type: 'Revendeur', phone: '', address: '', email: '', nif: '', fidele: false
  });

  useEffect(() => {
    if (client) {
      setForm({
        name: client.name, type: client.type, phone: client.phone || '',
        address: client.address || '', email: client.email || '',
        nif: client.nif || '', fidele: client.fidele
      });
    } else {
      setForm({ name: '', type: 'Revendeur', phone: '', address: '', email: '', nif: '', fidele: false });
    }
  }, [client, isOpen]);

  const handleSave = async () => {
    if (!form.name) { showToast('Attention', 'Nom requis', 'error'); return; }
    
    try {
      if (isEdit) {
        await updateClient(client.id, form);
        showToast('Succès', 'Client modifié');
      } else {
        await addClient(form);
        showToast('Succès', 'Client ajouté');
      }
      onClose();
    } catch (err) {
      showToast('Erreur', err.message, 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen} onClose={onClose}
      title={isEdit ? 'Modifier le client' : 'Ajouter un client'}
      label="CLIENT" maxWidth="max-w-xl"
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
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5">Type</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs">
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5">Téléphone</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium mb-1.5">Adresse</label>
          <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5">Email</label>
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5">NIF</label>
          <input value={form.nif} onChange={(e) => setForm({ ...form, nif: e.target.value })}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <input type="checkbox" id="fidele" checked={form.fidele} onChange={(e) => setForm({ ...form, fidele: e.target.checked })}
            className="w-4 h-4 accent-emerald-600" />
          <label htmlFor="fidele" className="text-xs">Client fidèle (crédit 15j autorisé)</label>
        </div>
      </div>
    </Modal>
  );
}