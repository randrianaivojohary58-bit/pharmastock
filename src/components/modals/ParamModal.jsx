import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export default function ParamModal({ isOpen, onClose, type }) {
  const { settings, setSettings } = useData();
  const { showToast } = useToast();
  const [form, setForm] = useState(settings);

  useEffect(() => {
    setForm(settings);
  }, [settings, isOpen]);

  const handleSave = () => {
    setSettings(form);
    showToast('Succès', 'Paramètres enregistrés');
    onClose();
  };

  const getTitle = () => {
    const titles = {
      company: 'Informations entreprise',
      tva: 'TVA par défaut',
      delay: 'Paiement différé',
      remise: 'Remise caisse',
      fefo: 'Gestion FEFO'
    };
    return titles[type] || 'Paramètre';
  };

  return (
    <Modal
      isOpen={isOpen} onClose={onClose}
      title={getTitle()} label="PARAMÈTRE" maxWidth="max-w-lg"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-xs">Annuler</button>
          <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs">Enregistrer</button>
        </>
      }
    >
      {type === 'company' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium mb-1.5">Nom</label>
            <input value={form.company.name} onChange={(e) => setForm({ ...form, company: { ...form.company, name: e.target.value } })}
              className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium mb-1.5">Adresse</label>
            <input value={form.company.address} onChange={(e) => setForm({ ...form, company: { ...form.company, address: e.target.value } })}
              className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5">NIF</label>
            <input value={form.company.nif} onChange={(e) => setForm({ ...form, company: { ...form.company, nif: e.target.value } })}
              className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5">STAT</label>
            <input value={form.company.stat} onChange={(e) => setForm({ ...form, company: { ...form.company, stat: e.target.value } })}
              className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5">Téléphone</label>
            <input value={form.company.phone} onChange={(e) => setForm({ ...form, company: { ...form.company, phone: e.target.value } })}
              className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5">Email</label>
            <input value={form.company.email} onChange={(e) => setForm({ ...form, company: { ...form.company, email: e.target.value } })}
              className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium mb-1.5">Banque</label>
            <input value={form.company.bank} onChange={(e) => setForm({ ...form, company: { ...form.company, bank: e.target.value } })}
              className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
          </div>
        </div>
      )}
      {type === 'tva' && (
        <div>
          <label className="block text-xs font-medium mb-1.5">TVA par défaut (%)</label>
          <select value={form.tvaRate} onChange={(e) => setForm({ ...form, tvaRate: Number(e.target.value) })}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs">
            <option value={0}>0%</option><option value={10}>10%</option><option value={20}>20%</option>
          </select>
        </div>
      )}
      {type === 'delay' && (
        <div>
          <label className="block text-xs font-medium mb-1.5">Délai (jours)</label>
          <input type="number" value={form.delayDays} onChange={(e) => setForm({ ...form, delayDays: Number(e.target.value) })}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
        </div>
      )}
      {type === 'remise' && (
        <div>
          <label className="block text-xs font-medium mb-1.5">Remise par défaut (%)</label>
          <input type="number" value={form.remiseRate} onChange={(e) => setForm({ ...form, remiseRate: Number(e.target.value) })}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
        </div>
      )}
      {type === 'fefo' && (
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={form.fefoEnabled} onChange={(e) => setForm({ ...form, fefoEnabled: e.target.checked })}
            className="w-4 h-4 accent-emerald-600" />
          <label className="text-xs">Activer la sélection FEFO automatique</label>
        </div>
      )}
    </Modal>
  );
}