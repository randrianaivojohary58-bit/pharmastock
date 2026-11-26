import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { LOCATION_LEVELS, formatEmplacement } from '../../utils/emplacement';
import { Building2, Archive, Layers, Package } from 'lucide-react';

const LEVEL_ICONS = [Building2, Archive, Layers, Package];

// Schéma : chaque niveau est une boîte contenue dans la précédente
function LocationSchema({ form }) {
  const last = LOCATION_LEVELS.length - 1;

  const renderLevel = (i) => {
    const level = LOCATION_LEVELS[i];
    const Icon = LEVEL_ICONS[i] || Package;
    const value = (form[level.key] || '').trim();
    const isLast = i === last;

    const box = value
      ? (isLast
          ? 'border-emerald-600 bg-emerald-600 text-white'
          : 'border-emerald-300 bg-emerald-50 text-emerald-900')
      : 'border-dashed border-gray-300 bg-white text-gray-400';

    return (
      <div key={level.key} className={`rounded-lg border p-2.5 transition-colors ${box}`}>
        <div className="flex items-center gap-2 text-xs">
          <Icon className="w-4 h-4 shrink-0" />
          <span className="text-[10px] uppercase tracking-wider opacity-70">{level.label}</span>
          <strong className="truncate">{value || '—'}</strong>
        </div>
        {!isLast && <div className="mt-2.5">{renderLevel(i + 1)}</div>}
      </div>
    );
  };

  return (
    <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
      {renderLevel(0)}
    </div>
  );
}

const EMPTY = { rayon: '', allee: '', etagere: '', casier: '', description: '' };

export default function LocationModal({ isOpen, onClose, location }) {
  const { locations, addLocation, updateLocation } = useData();
  const { showToast } = useToast();
  const isEdit = !!location;

  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (location) {
      setForm({
        rayon: location.rayon || '',
        allee: location.allee || '',
        etagere: location.etagere || '',
        casier: location.casier || '',
        description: location.description || ''
      });
    } else {
      setForm(EMPTY);
    }
  }, [location, isOpen]);

  // Valeurs déjà utilisées : proposées en suggestion pour éviter les fautes de frappe
  const suggestions = (key) => [...new Set(locations.map(l => (l[key] || '').trim()).filter(Boolean))].sort();

  const handleSave = async () => {
    if (!form.rayon.trim() || !form.allee.trim()) {
      showToast('Attention', 'La pièce et l\'équipement sont requis', 'error');
      return;
    }
    const data = {
      rayon: form.rayon.trim(),
      allee: form.allee.trim(),
      etagere: form.etagere.trim(),
      casier: form.casier.trim(),
      description: form.description
    };
    try {
      if (isEdit) {
        await updateLocation(location.id, data);
        showToast('Succès', 'Emplacement modifié');
      } else {
        await addLocation(data);
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
      label="EMPLACEMENT" maxWidth="max-w-lg"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-xs">Annuler</button>
          <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs">Enregistrer</button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        {LOCATION_LEVELS.map((level, i) => (
          <div key={level.key}>
            <label className="block text-xs font-medium mb-1.5">
              {level.label}{i < 2 ? ' *' : ''}
            </label>
            <input
              list={`loc-${level.key}`}
              value={form[level.key]}
              onChange={(e) => setForm({ ...form, [level.key]: e.target.value })}
              placeholder={level.placeholder}
              className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs"
            />
            <datalist id={`loc-${level.key}`}>
              {suggestions(level.key).map(v => <option key={v} value={v} />)}
            </datalist>
          </div>
        ))}

        <div className="col-span-2">
          <label className="block text-xs font-medium mb-1.5">Description</label>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
        </div>

        <div className="col-span-2">
          <span className="block text-xs font-medium mb-2">Schéma de l'emplacement</span>
          <LocationSchema form={form} />
          <p className="mt-2 text-xs text-emerald-800 text-center">
            <span className="text-emerald-600">Emplacement : </span>
            <strong>{formatEmplacement(form)}</strong>
          </p>
        </div>
      </div>
    </Modal>
  );
}