import { useState, useEffect } from 'react';
import Modal from './Modal';
import CustomSelect from '../common/CustomSelect';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { formatMoney } from '../../utils/format';
import { formatDate } from '../../utils/dates';

export default function SaleModal({ isOpen, onClose, sale }) {
  const { products, clients, addSale } = useData();
  const { showToast } = useToast();
  const isEdit = !!sale;

  const [form, setForm] = useState({
    client: '', date: new Date().toISOString().split('T')[0], payment: 'Espèces', paid: 0, echeance: '', lines: []
  });

  const clientOptions = clients.map(c => `${c.name} (${c.type})`);

  useEffect(() => {
    if (sale) {
      setForm({
        client: `${sale.client} (${sale.clientType})`,
        date: sale.date, payment: sale.payment, paid: sale.paid,
        echeance: sale.echeance || '',
        lines: sale.products.map(p => ({ productId: p.productId, lot: p.lot, quantity: p.quantity }))
      });
    } else {
      setForm({
        client: '', date: new Date().toISOString().split('T')[0], payment: 'Espèces', paid: 0, echeance: '',
        lines: [{ productId: '', lot: '', quantity: 1 }]
      });
    }
  }, [sale, isOpen]);

  const addLine = () => setForm({ ...form, lines: [...form.lines, { productId: '', lot: '', quantity: 1 }] });
  const removeLine = (i) => form.lines.length > 1 && setForm({ ...form, lines: form.lines.filter((_, idx) => idx !== i) });

  const updateLine = (i, field, value) => {
    const newLines = [...form.lines];
    newLines[i] = { ...newLines[i], [field]: value };
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      const lots = product?.lots.filter(l => l.stock > 0).sort((a, b) => new Date(a.expiry) - new Date(b.expiry)) || [];
      newLines[i].lot = lots[0]?.id || '';
    }
    setForm({ ...form, lines: newLines });
  };

  const getLineInfo = (line) => {
    const product = products.find(p => p.id === line.productId);
    if (!product) return { price: 0, tva: 0, total: 0, stock: 0, remaining: 0 };
    
    const total = line.quantity * product.price;
    const stock = product.stock || 0;
    const remaining = Math.max(stock - line.quantity, 0);
    
    return { price: product.price, tva: product.tva, total, stock, remaining };
  };

  const subtotalHT = form.lines.reduce((s, l) => s + getLineInfo(l).total, 0);
  const totalTVA = form.lines.reduce((s, l) => s + getLineInfo(l).total * (getLineInfo(l).tva / 100), 0);
  const totalTTC = subtotalHT + totalTVA;
  const rest = Math.max(totalTTC - form.paid, 0);

  const handleSave = async () => {
    if (!form.client) { showToast('Attention', 'Sélectionnez un client', 'error'); return; }
    
    const validLines = form.lines.filter(l => l.productId && l.quantity > 0);
    if (!validLines.length) { showToast('Attention', 'Ajoutez un produit', 'error'); return; }

    // Vérifier que les quantités ne dépassent pas le stock
    for (const line of validLines) {
      const info = getLineInfo(line);
      if (line.quantity > info.stock) {
        const product = products.find(p => p.id === line.productId);
        showToast('Stock insuffisant', `${product.name} : ${info.stock} cartons disponibles`, 'error');
        return;
      }
    }

    const clientName = form.client.split(' (')[0];
    const clientObj = clients.find(c => c.name === clientName);
    if (!clientObj) { showToast('Erreur', 'Client introuvable', 'error'); return; }

    const saleProducts = validLines.map(l => {
      const product = products.find(p => p.id === l.productId);
      return { productId: l.productId, name: product.name, lot: l.lot, quantity: l.quantity, price: product.price, tva: product.tva };
    });

    let status = 'Payée';
    if (form.paid <= 0) status = 'En attente';
    else if (form.paid < totalTTC) status = 'Partielle';

    const saleData = {
      number: `VTE-${new Date().getFullYear()}-${String(136 + Math.floor(Math.random() * 900)).padStart(5, '0')}`,
      date: form.date, client: clientName, clientType: clientObj.type,
      clientId: clientObj.id,
      products: saleProducts, payment: form.payment, status, paid: form.paid,
      echeance: form.echeance || null
    };

    try {
      if (isEdit) {
        showToast('Info', 'Modification non implémentée');
      } else {
        await addSale(saleData);
        showToast('Succès', `Vente ${saleData.number} enregistrée`);
      }
      onClose();
    } catch (err) {
      showToast('Erreur', err.message, 'error');
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEdit ? 'Modifier la vente' : 'Nouvelle vente'} 
      label="VENTE"
      maxWidth="max-w-4xl"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-xs">Annuler</button>
          <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700">Enregistrer</button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <CustomSelect 
            label="Client *" 
            options={clientOptions} 
            value={form.client} 
            onChange={(v) => setForm({ ...form, client: v })} 
            placeholder="Rechercher client..." 
          />
          <div>
            <label className="block text-xs font-medium mb-1.5">Date vente *</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5">Paiement</label>
            <select value={form.payment} onChange={(e) => setForm({ ...form, payment: e.target.value })} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs">
              <option>Espèces</option><option>Virement</option><option>Chèque</option><option>Mobile Money</option><option>Crédit</option><option>Crédit 15 jours</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5">Montant payé</label>
            <input type="number" value={form.paid} onChange={(e) => setForm({ ...form, paid: Number(e.target.value) })} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs font-bold">Produits (FEFO auto)</h4>
            <button onClick={addLine} className="text-xs text-emerald-600 font-semibold hover:underline">+ Ajouter</button>
          </div>
          <div className="space-y-2">
            {form.lines.map((line, i) => {
              const product = products.find(p => p.id === line.productId);
              const lots = product?.lots.filter(l => l.stock > 0).sort((a, b) => new Date(a.expiry) - new Date(b.expiry)) || [];
              const info = getLineInfo(line);
              const isOverStock = line.quantity > info.stock;
              
              return (
                <div key={i} className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-4">
                    <select value={line.productId} onChange={(e) => updateLine(i, 'productId', e.target.value)} className="w-full h-9 px-2 border border-gray-200 rounded-lg text-xs">
                      <option value="">Sélectionner</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    {/* 👇 AFFICHAGE DU STOCK ACTUEL */}
                    {product && (
                      <div className="mt-1 text-[10px] text-gray-500">
                        Stock: <strong className="text-emerald-700">{info.stock} ctn</strong>
                      </div>
                    )}
                  </div>
                  
                  <div className="col-span-3">
                    <select value={line.lot} onChange={(e) => updateLine(i, 'lot', e.target.value)} className="w-full h-9 px-2 border border-gray-200 rounded-lg text-xs" disabled={!product}>
                      {lots.length === 0 ? <option>Lot FEFO</option> : lots.map(l => <option key={l.id} value={l.id}>{l.id} ({formatDate(l.expiry)})</option>)}
                    </select>
                  </div>
                  
                  <div className="col-span-2">
                    <input 
                      type="number" 
                      min={1} 
                      max={info.stock}
                      value={line.quantity} 
                      onChange={(e) => updateLine(i, 'quantity', Number(e.target.value))} 
                      className={`w-full h-9 px-2 border rounded-lg text-xs ${isOverStock ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} 
                    />
                    {/* 👇 AFFICHAGE DU STOCK RESTANT */}
                    {product && (
                      <div className={`mt-1 text-[10px] ${isOverStock ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                        Reste: <strong>{info.remaining} ctn</strong>
                        {isOverStock && ' (dépasse le stock)'}
                      </div>
                    )}
                  </div>
                  
                  <div className="col-span-2 pt-2">
                    <span className="text-xs font-bold text-emerald-700">{formatMoney(info.total)}</span>
                  </div>
                  
                  <button onClick={() => removeLine(i)} className="col-span-1 h-9 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100">×</button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-xs">
          <div className="flex justify-between"><span>Sous-total HT</span><strong>{formatMoney(subtotalHT)}</strong></div>
          <div className="flex justify-between"><span>TVA</span><strong>{formatMoney(totalTVA)}</strong></div>
          <div className="flex justify-between border-t-2 border-emerald-500 pt-2 text-base"><span className="font-bold">Total TTC</span><strong className="text-emerald-700">{formatMoney(totalTTC)}</strong></div>
          <div className="flex justify-between text-orange-600"><span>Reste à payer</span><strong>{formatMoney(rest)}</strong></div>
        </div>
      </div>
    </Modal>
  );
}