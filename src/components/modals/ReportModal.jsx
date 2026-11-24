import { useState, useEffect } from 'react';
import Modal from './Modal';
import CustomSelect from '../common/CustomSelect';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { formatMoney } from '../../utils/format';
import { getSupplierMargins, getSellPrices } from '../../utils/pricing';

const TYPES = ['Comprimé', 'Sirop', 'Injectable', 'Suppositoire', 'Pommade', 'Gouttes', 'Consommables', 'Autre'];
const CONDS = ['Chassie (carton)', 'Boîte', 'Flacon', 'Tube', 'Sachet', 'Ampoule', 'Pot', 'Blister', 'Étui'];

const newLine = () => ({ productName: '', quantity: 1, price: 0, type: 'Comprimé', conditionnement: 'Boîte' });

export default function PurchaseModal({ isOpen, onClose, purchase }) {
  const { products, suppliers, addPurchase, addProduct, updateProductPrices } = useData();
  const { showToast } = useToast();
  const isEdit = !!purchase;

  const [form, setForm] = useState({
    supplier: '', date: new Date().toISOString().split('T')[0], number: '', status: 'Reçu',
    tvaRate: 20, remiseRate: 0, lines: []
  });

  const productNames = products.map(p => p.name).sort();

  // Marge du fournisseur choisi -> prix de vente calculés automatiquement
  const [applyMargin, setApplyMargin] = useState(true);
  const selectedSupplier = suppliers.find(s => s.name === form.supplier);
  const margins = getSupplierMargins(selectedSupplier);

  // Un produit est "nouveau" si son nom n'existe pas encore dans le catalogue
  const isNewProduct = (name) =>
    !!name && !!name.trim() &&
    !products.some(p => p.name.toLowerCase() === name.trim().toLowerCase());

  useEffect(() => {
    if (purchase) {
      setForm({
        supplier: purchase.supplier, date: purchase.date, number: purchase.number,
        status: purchase.status, tvaRate: purchase.tvaRate, remiseRate: purchase.remiseRate,
        lines: purchase.products.map(p => ({
          productName: p.name,
          quantity: p.quantity,
          price: p.price,
          type: 'Comprimé',
          conditionnement: 'Boîte'
        }))
      });
    } else {
      setForm({ 
        supplier: '', 
        date: new Date().toISOString().split('T')[0], 
        number: '', 
        status: 'Reçu', 
        tvaRate: 20, 
        remiseRate: 0, 
        lines: [newLine()]
      });
    }
  }, [purchase, isOpen]);

  const addLine = () => setForm({ ...form, lines: [...form.lines, newLine()] });
  const removeLine = (i) => form.lines.length > 1 && setForm({ ...form, lines: form.lines.filter((_, idx) => idx !== i) });
  
  const updateLine = (i, field, value) => {
    const newLines = [...form.lines];
    newLines[i] = { ...newLines[i], [field]: value };
    setForm({ ...form, lines: newLines });
  };

  const subtotal = form.lines.reduce((s, l) => s + (l.quantity || 0) * (l.price || 0), 0);
  const remise = subtotal * (form.remiseRate / 100);
  const afterRemise = subtotal - remise;
  const tva = afterRemise * (form.tvaRate / 100);
  const total = afterRemise + tva;

  const handleSave = async () => {
    if (!form.supplier || !form.number) { showToast('Attention', 'Fournisseur et N° facture requis', 'error'); return; }
    const validLines = form.lines.filter(l => l.productName && l.quantity > 0 && l.price > 0);
    if (!validLines.length) { showToast('Attention', 'Ajoutez au moins un produit avec prix', 'error'); return; }

    const supplierObj = suppliers.find(s => s.name === form.supplier);
    if (!supplierObj) { showToast('Erreur', 'Fournisseur introuvable', 'error'); return; }

    const purchaseProducts = [];
    const existingToUpdate = [];
    
    try {
      for (const line of validLines) {
        // Chercher le produit par son nom
        let product = products.find(p => p.name.toLowerCase() === line.productName.trim().toLowerCase());
        const wasExisting = !!product;
        
        if (!product) {
          // Si le produit n'existe pas, on le crée
          const newCode = `NEW-${Date.now()}-${line.productName.trim().substring(0, 3).toUpperCase()}`;
          const sellPrices = getSellPrices(line.price, margins);
          
          // addProduct retourne maintenant l'objet créé
          const createdProduct = await addProduct({
            code: newCode,
            name: line.productName.trim(),
            type: line.type || 'Autre',                  // type choisi dans la ligne d'achat
            conditionnement: line.conditionnement || 'Boîte',
            category: '',
            tva: form.tvaRate,
            buyPrice: line.price,
            price: sellPrices.price,                    // marge du fournisseur
            priceGrossiste: sellPrices.priceGrossiste,
            priceRevendeur: sellPrices.priceRevendeur,
            stock: 0, 
            rayon: '', allee: '', etagere: '', expiry: ''
          });

          product = createdProduct;
        }

        // Sécurité anti-crash si product est toujours undefined
        if (!product) {
          throw new Error(`Impossible de trouver ou créer le produit: ${line.productName}`);
        }

        if (wasExisting) existingToUpdate.push({ id: product.id, price: line.price });

        purchaseProducts.push({
          productId: product.id,
          name: product.name,
          quantity: line.quantity,
          price: line.price,
          expiry: '2028-12-31'
        });
      }

      const purchaseData = {
        number: form.number, date: form.date, supplier: form.supplier,
        supplierId: supplierObj.id,
        tvaRate: form.tvaRate, remiseRate: form.remiseRate, status: form.status, products: purchaseProducts
      };

      if (isEdit) {
        showToast('Info', 'Modification non implémentée');
      } else {
        await addPurchase(purchaseData);

        // Produits existants : nouveau prix d'achat + prix de vente recalculés avec la marge du fournisseur
        // (seulement si l'achat est reçu)
        if (applyMargin && form.status === 'Reçu') {
          for (const item of existingToUpdate) {
            await updateProductPrices(item.id, { buyPrice: item.price, ...getSellPrices(item.price, margins) });
          }
        }
        showToast('Succès', 'Achat enregistré');
      }
      onClose();
    } catch (err) {
      showToast('Erreur', err.message, 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Modifier l\'achat' : 'Nouvel achat'} label="ACHAT"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-xs">Annuler</button>
          <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs">Enregistrer</button>
        </>
      }
    >
      <div className="space-y-5">
        
        <div className="flex justify-between items-center bg-indigo-50 p-3 rounded-xl border border-indigo-100">
          <div>
            <p className="text-xs font-bold text-indigo-900">Remplissage automatique</p>
            <p className="text-[10px] text-indigo-600">Scannez une facture pour remplir le formulaire</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <CustomSelect label="Fournisseur *" options={suppliers.map(s => s.name)} value={form.supplier} onChange={(v) => setForm({ ...form, supplier: v })} placeholder="Rechercher fournisseur..." />
          <div>
            <label className="block text-xs font-medium mb-1.5">Date facture *</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5">N° Facture *</label>
            <input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5">Statut</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs">
              <option>Reçu</option><option>En attente</option><option>Annulé</option>
            </select>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-emerald-800">
              {selectedSupplier ? <>Marge de <strong>{selectedSupplier.name}</strong></> : 'Marge par défaut'} :{' '}
              détail <strong>{margins.margin} %</strong> · revendeur <strong>{margins.marginRevendeur} %</strong> · grossiste <strong>{margins.marginGrossiste} %</strong>
            </p>
            <label className="flex items-center gap-2 text-[11px] text-emerald-900 cursor-pointer">
              <input type="checkbox" checked={applyMargin} onChange={(e) => setApplyMargin(e.target.checked)} />
              Mettre à jour les prix de vente des produits existants
            </label>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs font-bold">Produits</h4>
            <button onClick={addLine} className="text-xs text-emerald-600 font-semibold hover:underline">+ Ajouter ligne</button>
          </div>
          <div className="space-y-2">
            {form.lines.map((line, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <input 
                    list="product-names"
                    value={line.productName || ''} 
                    onChange={(e) => updateLine(i, 'productName', e.target.value)} 
                    placeholder="Rechercher ou saisir un nouveau produit..."
                    className="w-full h-9 px-2 border border-gray-200 rounded-lg text-xs" 
                  />
                  <datalist id="product-names">
                    {productNames.map(name => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </div>
                <div className="col-span-2">
                  <input type="number" min={1} value={line.quantity} onChange={(e) => updateLine(i, 'quantity', Number(e.target.value))} placeholder="Qté" className="w-full h-9 px-2 border border-gray-200 rounded-lg text-xs" />
                </div>
                <div className="col-span-3">
                  <input type="number" min={0} value={line.price} onChange={(e) => updateLine(i, 'price', Number(e.target.value))} placeholder="Prix achat" className="w-full h-9 px-2 border border-gray-200 rounded-lg text-xs" />
                  {line.price > 0 && (
                    <div className="mt-1 text-[10px] text-emerald-700 font-semibold">
                      Vente : {formatMoney(getSellPrices(line.price, margins).price)} (+{margins.margin} %)
                    </div>
                  )}
                </div>
                <div className="col-span-1 text-xs font-bold text-emerald-700">{formatMoney((line.quantity || 0) * (line.price || 0))}</div>
                <button onClick={() => removeLine(i)} className="col-span-1 h-9 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100">×</button>

                {isNewProduct(line.productName) && (
                  <div className="col-span-12 flex flex-wrap items-center gap-2 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
                    <span className="text-[10px] font-bold text-orange-700">Nouveau produit :</span>
                    <select
                      value={line.type || 'Comprimé'}
                      onChange={(e) => updateLine(i, 'type', e.target.value)}
                      className="h-8 px-2 border border-orange-200 rounded-lg text-xs bg-white"
                    >
                      {TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <select
                      value={line.conditionnement || 'Boîte'}
                      onChange={(e) => updateLine(i, 'conditionnement', e.target.value)}
                      className="h-8 px-2 border border-orange-200 rounded-lg text-xs bg-white"
                    >
                      {CONDS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1.5">TVA %</label>
            <select value={form.tvaRate} onChange={(e) => setForm({ ...form, tvaRate: Number(e.target.value) })} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs">
              <option value={0}>0%</option><option value={10}>10%</option><option value={20}>20%</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5">Remise %</label>
            <input type="number" value={form.remiseRate} onChange={(e) => setForm({ ...form, remiseRate: Number(e.target.value) })} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-xs">
          <div className="flex justify-between"><span>Total HT</span><strong>{formatMoney(subtotal)}</strong></div>
          <div className="flex justify-between text-orange-600"><span>Remise</span><strong>- {formatMoney(remise)}</strong></div>
          <div className="flex justify-between"><span>TVA ({form.tvaRate}%)</span><strong>{formatMoney(tva)}</strong></div>
          <div className="flex justify-between border-t-2 border-emerald-500 pt-2 text-base"><span className="font-bold">Total TTC</span><strong className="text-emerald-700">{formatMoney(total)}</strong></div>
        </div>
      </div>
    </Modal>
  );
}