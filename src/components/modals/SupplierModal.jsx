import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { formatMoney } from '../../utils/format';
import { priceFromMargin, DEFAULT_MARGINS, getProductsOfSupplier } from '../../utils/pricing';

const DEFAULT_TYPES = ['Laboratoire', 'Grossiste', 'Importateur', 'Distributeur'];

const EMPTY = {
  name: '', type: '', phone: '', country: '', email: '', nif: '', stat: '',
  margin: DEFAULT_MARGINS.margin,
  marginRevendeur: DEFAULT_MARGINS.marginRevendeur,
  marginGrossiste: DEFAULT_MARGINS.marginGrossiste
};

export default function SupplierModal({ isOpen, onClose, supplier }) {
  const { suppliers, purchases, products, addSupplier, updateSupplier } = useData();
  const { showToast } = useToast();
  const isEdit = !!supplier;

  const [form, setForm] = useState(EMPTY);
  const [applyToProducts, setApplyToProducts] = useState(true);

  // Produits rattachés à ce fournisseur (dernier achat reçu) et marges modifiées ?
  const linkedProducts = isEdit
    ? getProductsOfSupplier(supplier.id, purchases, products).filter(p => (Number(p.buyPrice) || 0) > 0)
    : [];
  const marginsChanged = isEdit && (
    Number(form.margin) !== Number(supplier.margin ?? DEFAULT_MARGINS.margin) ||
    Number(form.marginRevendeur) !== Number(supplier.marginRevendeur ?? DEFAULT_MARGINS.marginRevendeur) ||
    Number(form.marginGrossiste) !== Number(supplier.marginGrossiste ?? DEFAULT_MARGINS.marginGrossiste)
  );

  // Types proposés : ceux par défaut + ceux déjà utilisés par vos fournisseurs
  const typeOptions = [...new Set([...DEFAULT_TYPES, ...suppliers.map(s => s.type).filter(Boolean)])];

  useEffect(() => {
    if (supplier) {
      setForm({
        name: supplier.name || '',
        type: supplier.type || '',
        phone: supplier.phone || '',
        country: supplier.country || '',
        email: supplier.email || '',
        nif: supplier.nif || '',
        stat: supplier.stat || '',
        margin: supplier.margin ?? DEFAULT_MARGINS.margin,
        marginRevendeur: supplier.marginRevendeur ?? DEFAULT_MARGINS.marginRevendeur,
        marginGrossiste: supplier.marginGrossiste ?? DEFAULT_MARGINS.marginGrossiste
      });
    } else {
      setForm(EMPTY);
    }
    setApplyToProducts(true);
  }, [supplier, isOpen]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const setMargin = (field) => (e) => setForm({ ...form, [field]: e.target.value === '' ? '' : Number(e.target.value) });

  const handleSave = async () => {
    if (!form.name.trim()) {
      showToast('Attention', 'Le nom du fournisseur est requis', 'error');
      return;
    }
    const margins = [form.margin, form.marginRevendeur, form.marginGrossiste].map(Number);
    if (margins.some(m => Number.isNaN(m) || m < 0)) {
      showToast('Attention', 'Les marges doivent être des nombres positifs', 'error');
      return;
    }

    const data = {
      ...form,
      name: form.name.trim(),
      margin: Number(form.margin) || 0,
      marginRevendeur: Number(form.marginRevendeur) || 0,
      marginGrossiste: Number(form.marginGrossiste) || 0
    };

    try {
      if (isEdit) {
        const res = await updateSupplier(supplier.id, data, {
          applyToProducts: marginsChanged && applyToProducts
        });
        showToast(
          'Succès',
          res?.updatedProducts > 0
            ? `Fournisseur modifié — prix de ${res.updatedProducts} produit(s) mis à jour`
            : 'Fournisseur modifié'
        );
      } else {
        await addSupplier(data);
        showToast('Succès', 'Fournisseur ajouté');
      }
      onClose();
    } catch (err) {
      showToast('Erreur', err.message, 'error');
    }
  };

  // Exemple chiffré : produit acheté 10 000 Ar chez ce fournisseur
  const EXAMPLE = 10000;

  const inputCls = 'w-full h-10 px-3 border border-gray-200 rounded-lg text-xs';

  return (
    <Modal
      isOpen={isOpen} onClose={onClose}
      title={isEdit ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
      label="FOURNISSEUR" maxWidth="max-w-xl"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-xs">Annuler</button>
          <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700">Enregistrer</button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium mb-1.5">Nom *</label>
            <input value={form.name} onChange={set('name')} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5">Type</label>
            <input list="supplier-types" value={form.type} onChange={set('type')} className={inputCls} placeholder="Choisir ou saisir..." />
            <datalist id="supplier-types">
              {typeOptions.map(t => <option key={t} value={t} />)}
            </datalist>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5">Pays</label>
            <input value={form.country} onChange={set('country')} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5">Téléphone</label>
            <input value={form.phone} onChange={set('phone')} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={set('email')} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5">NIF</label>
            <input value={form.nif} onChange={set('nif')} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5">STAT</label>
            <input value={form.stat} onChange={set('stat')} className={inputCls} />
          </div>
        </div>

        {/* ===== MARGES DE PRIX ===== */}
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
          <h4 className="text-xs font-bold text-emerald-800 mb-1">Marge de prix</h4>
          <p className="text-[11px] text-emerald-700 mb-3">
            Prix de vente = prix d'achat chez ce fournisseur + la marge. Il se calcule automatiquement dans les achats.
          </p>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5">Détail (%)</label>
              <input type="number" min={0} step="0.5" value={form.margin} onChange={setMargin('margin')} className={`${inputCls} font-bold text-emerald-700`} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">Revendeur (%)</label>
              <input type="number" min={0} step="0.5" value={form.marginRevendeur} onChange={setMargin('marginRevendeur')} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">Grossiste (%)</label>
              <input type="number" min={0} step="0.5" value={form.marginGrossiste} onChange={setMargin('marginGrossiste')} className={inputCls} />
            </div>
          </div>

          <div className="mt-3 text-[11px] text-emerald-900 bg-white border border-emerald-100 rounded-lg p-2.5">
            <strong>Exemple</strong> : produit acheté {formatMoney(EXAMPLE)} →
            vente détail <strong>{formatMoney(priceFromMargin(EXAMPLE, form.margin))}</strong>,
            revendeur <strong>{formatMoney(priceFromMargin(EXAMPLE, form.marginRevendeur))}</strong>,
            grossiste <strong>{formatMoney(priceFromMargin(EXAMPLE, form.marginGrossiste))}</strong>
          </div>

          {marginsChanged && (
            <div className="mt-3 text-[11px] bg-yellow-50 border border-yellow-200 text-yellow-900 rounded-lg p-2.5">
              {linkedProducts.length > 0 ? (
                <>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" className="mt-0.5" checked={applyToProducts} onChange={(e) => setApplyToProducts(e.target.checked)} />
                    <span>
                      <strong>Mettre à jour automatiquement</strong> les prix de vente de{' '}
                      <strong>{linkedProducts.length} produit(s)</strong> de ce fournisseur
                      (prix d'achat × nouvelle marge).
                    </span>
                  </label>
                  <p className="mt-1.5 ml-5 text-yellow-800">
                    Ex. : {linkedProducts.slice(0, 3).map(p => `${p.name} ${formatMoney(p.price)} → ${formatMoney(priceFromMargin(p.buyPrice, form.margin))}`).join(' · ')}
                    {linkedProducts.length > 3 ? ' …' : ''}
                  </p>
                </>
              ) : (
                <>Aucun produit rattaché : la marge s'appliquera aux prochains achats chez ce fournisseur.</>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}