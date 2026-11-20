import { useState, useEffect } from 'react';
import Modal from './Modal';
import CustomSelect from '../common/CustomSelect';
import AiScanner from '../common/AiScanner'; // <-- IMPORT AJOUTÉ
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { formatMoney } from '../../utils/format';

export default function PurchaseModal({ isOpen, onClose, purchase }) {
  const { products, suppliers, addPurchase } = useData();
  const { showToast } = useToast();
  const isEdit = !!purchase;

  const [form, setForm] = useState({
    supplier: '', date: new Date().toISOString().split('T')[0], number: '', status: 'Reçu',
    tvaRate: 20, remiseRate: 0, lines: []
  });

  const supplierOptions = suppliers.map(s => s.name);

  useEffect(() => {
    if (isOpen) {
      if (purchase) {
        setForm({
          supplier: purchase.supplier, date: purchase.date, number: purchase.number,
          status: purchase.status, tvaRate: purchase.tvaRate, remiseRate: purchase.remiseRate,
          lines: purchase.products.map(p => ({ 
            productId: p.productId, 
            quantity: p.quantity, 
            price: p.price 
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
          lines: [{ productId: '', quantity: 1, price: 0 }] 
        });
      }
    }
  }, [purchase, isOpen]);

  // --- NOUVELLE FONCTION POUR L'IA ---
  const handleAiData = (data) => {
    // 1. Chercher le fournisseur
    const matchedSupplier = suppliers.find(s => 
      s.name.toLowerCase().includes((data.supplier || '').toLowerCase()) ||
      (data.supplier || '').toLowerCase().includes(s.name.toLowerCase())
    );

    // 2. Chercher les produits
    const mappedLines = (data.products || []).map(aiProduct => {
      const matchedProduct = products.find(p => 
        p.name.toLowerCase().includes((aiProduct.name || '').toLowerCase()) ||
        (aiProduct.name || '').toLowerCase().includes(p.name.toLowerCase())
      );
      return {
        productId: matchedProduct ? matchedProduct.id : '',
        quantity: aiProduct.quantity || 1,
        price: aiProduct.price || 0
      };
    });

    // 3. Mettre à jour le formulaire
    setForm({
      supplier: matchedSupplier ? matchedSupplier.name : (data.supplier || ''),
      date: data.date || new Date().toISOString().split('T')[0],
      number: data.number || '',
      status: 'Reçu',
      tvaRate: data.tvaRate || 20,
      remiseRate: data.remiseRate || 0,
      lines: mappedLines.length > 0 ? mappedLines : [{ productId: '', quantity: 1, price: 0 }]
    });
  };

  const addLine = () => setForm({ ...form, lines: [...form.lines, { productId: '', quantity: 1, price: 0 }] });
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
    const validLines = form.lines.filter(l => l.productId && l.quantity > 0 && l.price > 0);
    if (!validLines.length) { showToast('Attention', 'Ajoutez au moins un produit avec prix', 'error'); return; }

    const supplierObj = suppliers.find(s => s.name === form.supplier);
    if (!supplierObj) { showToast('Erreur', 'Fournisseur introuvable', 'error'); return; }

    const purchaseProducts = validLines.map(l => {
      const product = products.find(p => p.id === l.productId);
      return { productId: l.productId, name: product?.name, quantity: l.quantity, price: l.price, expiry: '2028-12-31' };
    });

    const purchaseData = {
      number: form.number, date: form.date, supplier: form.supplier,
      supplierId: supplierObj.id,
      tvaRate: form.tvaRate, remiseRate: form.remiseRate, status: form.status, products: purchaseProducts
    };

    try {
      if (isEdit) {
        showToast('Info', 'Modification non implémentée');
      } else {
        await addPurchase(purchaseData);
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
        
        {/* --- BOUTON SCANNER AJOUTÉ ICI --- */}
        {!isEdit && (
          <div className="flex justify-between items-center bg-indigo-50 p-3 rounded-xl border border-indigo-100">
            <div>
              <p className="text-xs font-bold text-indigo-900">Remplissage automatique</p>
              <p className="text-[10px] text-indigo-600">Scannez une facture pour remplir le formulaire</p>
            </div>
            <AiScanner onDataExtracted={handleAiData} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <CustomSelect label="Fournisseur *" options={supplierOptions} value={form.supplier} onChange={(v) => setForm({ ...form, supplier: v })} placeholder="Rechercher fournisseur..." />
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

        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs font-bold">Produits</h4>
            <button onClick={addLine} className="text-xs text-emerald-600 font-semibold hover:underline">+ Ajouter ligne</button>
          </div>
          <div className="space-y-2">
            {form.lines.map((line, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <select value={line.productId} onChange={(e) => updateLine(i, 'productId', e.target.value)} className={`w-full h-9 px-2 border rounded-lg text-xs ${!line.productId ? 'border-orange-300 bg-orange-50' : 'border-gray-200'}`}>
                    <option value="">Sélectionner</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <input type="number" min={1} value={line.quantity} onChange={(e) => updateLine(i, 'quantity', Number(e.target.value))} placeholder="Qté" className="w-full h-9 px-2 border border-gray-200 rounded-lg text-xs" />
                </div>
                <div className="col-span-3">
                  <input type="number" min={0} value={line.price} onChange={(e) => updateLine(i, 'price', Number(e.target.value))} placeholder="Prix achat" className="w-full h-9 px-2 border border-gray-200 rounded-lg text-xs" />
                </div>
                <div className="col-span-1 text-xs font-bold text-emerald-700">{formatMoney((line.quantity || 0) * (line.price || 0))}</div>
                <button onClick={() => removeLine(i)} className="col-span-1 h-9 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100">×</button>
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