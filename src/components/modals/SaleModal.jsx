import { useState, useEffect } from 'react';
import Modal from './Modal';
import CustomSelect from '../common/CustomSelect';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatMoney } from '../../utils/format';
import { formatDate } from '../../utils/dates';
import { getLotPromo, applyPromo } from '../../utils/promotions';
import { todayStr, addDaysStr, isOverdue, CREDIT_DAYS } from '../../utils/salesStats';
import { FileText, Receipt, Lock, AlertCircle, Clock, Star } from 'lucide-react';

// Prix selon le type de client, avec la promotion éventuelle du LOT choisi
const getPriceForClient = (product, clientType, lotId) => {
  if (!product) return 0;
  return applyPromo(getBasePrice(product, clientType), getLotPromo(product, lotId));
};

const getBasePrice = (product, clientType) => {
  if (!product) return 0;
  const type = (clientType || '').trim().toLowerCase();
  if (type === 'grossiste') return product.priceGrossiste || product.price;
  if (['revendeur', 'pharmacie', 'clinique', 'hôpital', 'hopital'].includes(type)) return product.priceRevendeur || product.price;
  return product.price;
};

export default function SaleModal({ isOpen, onClose, sale, onSuccess, startAsCredit = false }) {
  const { products, clients, sales, addSale, updateSale } = useData();
  const { profile } = useAuth();
  const { showToast } = useToast();
  const isEdit = !!sale;

  const isMagasinier = profile?.roleKey === 'magasinier';
  const isCaissier = profile?.roleKey === 'caissier';

  const [docType, setDocType] = useState('Facture');
  const [productSearch, setProductSearch] = useState('');
  const [activeProductSelect, setActiveProductSelect] = useState(null);

  const [form, setForm] = useState({
    client: '', date: todayStr(),
    payment: 'Espèces', paid: 0, remise: 0, echeance: '', lines: []
  });

  const clientOptions = clients.map(c => `${c.name} (${c.type})`);
  const selectedClientName = form.client.split(' (')[0];
  const selectedClient = clients.find(c => c.name === selectedClientName);
  const clientType = selectedClient?.type || '';

  // ===== CRÉDIT CLIENT FIDÈLE =====
  const isFidele = !!selectedClient?.fidele;
  const isCredit = form.payment === 'Crédit';

  // Factures déjà livrées, non soldées et en retard pour ce client
  const overdueSales = sales.filter(s =>
    s.client === selectedClientName && isOverdue(s) && s.id !== sale?.id
  );

  const creditProblem = !isCredit ? '' :
    !form.client ? 'Sélectionnez d\'abord un client.' :
    !isFidele ? 'Le paiement à crédit est réservé aux clients fidèles.' :
    overdueSales.length > 0 ? `Ce client a ${overdueSales.length} facture(s) en retard de paiement.` : '';

  // Quantité déjà réservée dans des proformas non payées
  const getReservedQty = (productId) => {
    if (!sales) return 0;
    return sales
      .filter(s => s.status === 'En attente' && !s.stockDeduit && s.id !== sale?.id)
      .flatMap(s => s.products || [])
      .filter(p => p.productId === productId)
      .reduce((sum, p) => sum + (p.quantity || 0), 0);
  };

  useEffect(() => {
    if (sale) {
      setForm({
        client: `${sale.client} (${sale.clientType})`,
        date: sale.date,
        // "En attente" n'est pas un moyen de paiement : on propose Espèces par défaut
        payment: startAsCredit && sale.status === 'En attente'
          ? 'Crédit'
          : (sale.payment === 'En attente' ? 'Espèces' : sale.payment),
        paid: sale.paid,
        remise: sale.remiseRate || 0,
        // le délai de 15 jours démarre à la validation, pas à la date de la proforma
        echeance: startAsCredit && sale.status === 'En attente'
          ? addDaysStr(todayStr(), CREDIT_DAYS)
          : (sale.echeance || ''),
        lines: sale.products.map(p => {
          const product = products.find(prod => prod.id === p.productId);
          const lotObj = product?.lots.find(lo => lo._db_id === p.lot || lo.id === p.lot);
          const lotId = lotObj ? lotObj.id : (p.lot || '');
          return {
            productId: p.productId,
            lot: lotId,
            quantity: p.quantity,
            price: getPriceForClient(product, sale.clientType, lotId)
          };
        })
      });
    } else {
      setForm({
        client: '',
        date: todayStr(),
        payment: isMagasinier ? 'En attente' : 'Espèces',
        paid: 0,
        remise: 0,
        echeance: '',
        lines: [{ productId: '', lot: '', quantity: 1, price: 0 }]
      });
    }
  }, [sale, isOpen, products, isMagasinier, startAsCredit]);

  useEffect(() => {
    if (!clientType) return;
    setForm(prev => {
      let hasChanged = false;
      const newLines = prev.lines.map(line => {
        if (!line.productId) return line;
        const product = products.find(p => p.id === line.productId);
        if (!product) return line;
        const newPrice = getPriceForClient(product, clientType, line.lot);
        if (newPrice !== line.price) {
          hasChanged = true;
          return { ...line, price: newPrice };
        }
        return line;
      });
      return hasChanged ? { ...prev, lines: newLines } : prev;
    });
  }, [clientType, products]);

  const addLine = () => setForm({ ...form, lines: [...form.lines, { productId: '', lot: '', quantity: 1, price: 0 }] });
  const removeLine = (i) => form.lines.length > 1 && setForm({ ...form, lines: form.lines.filter((_, idx) => idx !== i) });

  const updateLine = (i, field, value) => {
    const newLines = [...form.lines];
    newLines[i] = { ...newLines[i], [field]: value };

    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      const lots = product?.lots.filter(l => l.stock > 0).sort((a, b) => new Date(a.expiry) - new Date(b.expiry)) || [];
      newLines[i].lot = lots[0]?.id || '';
      if (product) newLines[i].price = getPriceForClient(product, clientType, newLines[i].lot);
    }

    if (field === 'lot') {
      const product = products.find(p => p.id === newLines[i].productId);
      const selectedLot = product?.lots.find(l => l.id === value);
      if (selectedLot && newLines[i].quantity > selectedLot.stock) {
        newLines[i].quantity = selectedLot.stock;
      }
      // Le prix suit le lot choisi (promotion éventuelle du lot)
      if (product) newLines[i].price = getPriceForClient(product, clientType, value);
    }

    setForm({ ...form, lines: newLines });
  };

  const getLineInfo = (line) => {
    const product = products.find(p => p.id === line.productId);
    if (!product) return { price: 0, tva: 0, total: 0, stock: 0, remaining: 0, lotStock: 0, lotRemaining: 0, hasLots: false, reserved: 0, available: 0 };

    const price = line.price || product.price;
    const total = line.quantity * price;
    const stock = product.stock || 0;
    const remaining = Math.max(stock - line.quantity, 0);

    const selectedLot = product.lots?.find(l => l.id === line.lot);
    const lotStock = selectedLot?.stock || 0;
    const lotRemaining = Math.max(lotStock - line.quantity, 0);

    const availableLots = product.lots?.filter(l => l.stock > 0) || [];
    const hasLots = availableLots.length > 0;

    const reserved = getReservedQty(line.productId);
    const available = Math.max(stock - reserved, 0);

    return { price, tva: product.tva, total, stock, remaining, lotStock, lotRemaining, hasLots, reserved, available };
  };

  const subtotalHT = form.lines.reduce((s, l) => s + getLineInfo(l).total, 0);
  // Remise en % : appliquée sur le HT, avant TVA
  const remiseRate = Math.min(Math.max(Number(form.remise) || 0, 0), 100);
  const remiseAmount = subtotalHT * remiseRate / 100;
  const totalTVA = form.lines.reduce((s, l) => s + getLineInfo(l).total * (getLineInfo(l).tva / 100), 0) * (1 - remiseRate / 100);
  const totalTTC = subtotalHT - remiseAmount + totalTVA;
  const rest = Math.max(totalTTC - form.paid, 0);

  const isCaisseMode = isEdit && isCaissier;

  // Le bouton Proforma n'apparaît qu'en création, ou en modification d'une vente encore "En attente"
  const canPrintProforma = !isCaisseMode && (!isEdit || sale?.status === 'En attente');

  // Statut d'une vente selon ce qui a été payé
  //  - tout payé                       → Payée
  //  - acompte                         → Partielle
  //  - crédit accordé (client fidèle)  → Partielle même à 0 : la marchandise est livrée, le stock est déduit
  //  - sinon                           → En attente (proforma)
  const computeStatus = (paid, total) => {
    if (total > 0 && paid + 0.5 >= total) return 'Payée';
    if (paid > 0) return 'Partielle';
    if (isCredit && isFidele) return 'Partielle';
    return 'En attente';
  };

  // Vérifie les règles de crédit. Ne bloque JAMAIS l'enregistrement d'un paiement
  // sur une vente déjà à crédit (statut Partielle).
  const validateCredit = (total) => {
    const needsCredit = isCredit && form.paid + 0.5 < total && sale?.status !== 'Partielle';
    if (!needsCredit) return true;
    if (creditProblem) { showToast('Crédit refusé', creditProblem, 'error'); return false; }
    if (!form.echeance) { showToast('Attention', "Indiquez la date d'échéance", 'error'); return false; }
    if (form.echeance < form.date) { showToast('Attention', "L'échéance doit être après la date de vente", 'error'); return false; }
    return true;
  };

  // En caisse, les 15 jours démarrent aujourd'hui (jour de la livraison) ; sinon à la date de vente
  const creditBase = isCaisseMode ? todayStr() : form.date;

  const handlePaymentChange = (value) => {
    setForm(prev => ({
      ...prev,
      payment: value,
      echeance:
        value === 'Crédit' ? (prev.echeance || addDaysStr(creditBase, CREDIT_DAYS))
        : (prev.payment === 'Crédit' ? '' : prev.echeance)
    }));
  };

  // Validation + construction des données (partagé entre "Enregistrer" et "Proforma")
  const buildSaleData = (asProforma = false) => {
    if (!form.client) { showToast('Attention', 'Sélectionnez un client', 'error'); return null; }

    // Un même produit ne peut apparaître que sur une seule ligne
    const ids = form.lines.map(l => l.productId).filter(Boolean);
    if (new Set(ids).size !== ids.length) {
      showToast('Attention', 'Le même produit est présent sur plusieurs lignes', 'error');
      return null;
    }

    for (const line of form.lines) {
      if (!line.productId) continue;
      const info = getLineInfo(line);
      if (!info.hasLots) {
        showToast('Attention', `Le produit "${products.find(p => p.id === line.productId)?.name}" n'a plus de stock.`, 'error');
        return null;
      }
      if (line.quantity > info.available) {
        showToast('Stock insuffisant', `Disponible : ${info.available} ctn (${info.reserved} réservé(s) en proforma)`, 'error');
        return null;
      }
    }

    const validLines = form.lines.filter(l => l.productId && l.quantity > 0);
    if (!validLines.length) { showToast('Attention', 'Ajoutez un produit', 'error'); return null; }

    const clientObj = clients.find(c => c.name === selectedClientName);
    if (!clientObj) { showToast('Erreur', 'Client introuvable', 'error'); return null; }

    const forcePending = asProforma || isMagasinier;
    if (!forcePending && !validateCredit(totalTTC)) return null;

    const saleProducts = validLines.map(l => {
      const product = products.find(p => p.id === l.productId);
      const lotObj = product?.lots.find(lo => lo.id === l.lot);
      return {
        productId: l.productId,
        name: product?.name || 'Produit inconnu',
        lot: lotObj?._db_id || null,   // UUID pour Supabase
        lotLabel: l.lot,               // numéro lisible pour l'affichage
        quantity: l.quantity,
        price: l.price || product?.price || 0,
        tva: product?.tva || 0
      };
    });

    const status = forcePending ? 'En attente' : computeStatus(form.paid, totalTTC);
    const paidAmount = forcePending ? 0 : form.paid;

    return {
      number: sale ? sale.number : `VTE-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`,
      date: form.date,
      client: selectedClientName,
      clientType: clientObj.type,
      clientId: clientObj.id,
      products: saleProducts,
      remiseRate,
      payment: forcePending ? 'En attente' : form.payment,
      status,
      paid: paidAmount,
      echeance: forcePending ? null : (form.echeance || null)
    };
  };

  const persistSale = async (saleData, successMsg) => {
    if (isEdit) {
      await updateSale(sale.id, saleData);
      showToast('Succès', 'Vente mise à jour');
    } else {
      await addSale(saleData);
      showToast('Succès', successMsg);
    }
  };

  // 🧾 Bouton "Facture proforma" : enregistre en "En attente" puis ouvre le document
  const handleProforma = async () => {
    const saleData = buildSaleData(true);
    if (!saleData) return;
    try {
      await persistSale(saleData, `Proforma ${saleData.number} créée`);
      if (onSuccess) onSuccess(saleData, 'Proforma');
      onClose();
    } catch (err) {
      showToast('Erreur', err.message, 'error');
    }
  };

  const handleSave = async () => {
    if (!form.client) { showToast('Attention', 'Sélectionnez un client', 'error'); return; }

    // 🔒 MODE CAISSE : validation du paiement uniquement
    if (isCaisseMode) {
      if (!sale) {
        showToast('Erreur', 'Action non autorisée', 'error');
        return;
      }
      if (!validateCredit(totalTTC)) return;

      const saleData = {
        number: sale.number,
        date: sale.date,
        client: sale.client,
        clientType: sale.clientType,
        clientId: sale.clientId,
        products: sale.products.map(p => ({
          productId: p.productId,
          name: p.name,
          lot: p.lot, // déjà l'UUID en provenance de la DB
          quantity: p.quantity,
          price: p.price,
          tva: p.tva
        })),
        payment: form.payment,
        status: computeStatus(form.paid, totalTTC),
        paid: form.paid,
        remiseRate,
        echeance: form.echeance || null
      };
      try {
        await updateSale(sale.id, saleData);
        showToast('Succès', saleData.status === 'Partielle' && form.paid === 0 ? 'Vente à crédit enregistrée' : 'Paiement enregistré');
        if (onSuccess) onSuccess(saleData, docType);
        onClose();
      } catch (err) {
        showToast('Erreur', err.message, 'error');
      }
      return;
    }

    const saleData = buildSaleData(false);
    if (!saleData) return;

    try {
      await persistSale(saleData, saleData.status === 'En attente' ? `Proforma ${saleData.number} créée` : `Vente ${saleData.number} enregistrée`);
      if (onSuccess) onSuccess(saleData, docType);
      onClose();
    } catch (err) {
      showToast('Erreur', err.message, 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen} onClose={onClose}
      title={isCaisseMode ? 'Encaissement' : (isEdit ? 'Modifier la vente' : 'Nouvelle proforma')}
      label="VENTE" maxWidth="max-w-4xl"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-xs">Annuler</button>

          {canPrintProforma && (
            <button
              onClick={handleProforma}
              className="px-4 py-2 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg text-xs font-semibold hover:bg-orange-100 flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" /> Facture proforma
            </button>
          )}

          <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700 font-semibold shadow-sm">
            {isCaisseMode ? 'Valider le paiement' : (isMagasinier ? 'Envoyer à la caisse' : 'Enregistrer la vente')}
          </button>
        </>
      }
    >
      <div className="space-y-6">
        {isMagasinier && !isEdit && (
          <div className="bg-orange-50 border border-orange-200 text-orange-800 text-xs p-3 rounded-xl flex gap-2">
            <Clock className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Proforma — en attente de paiement.</strong><br />
              En tant que magasinier, vous préparez la marchandise. Le stock ne sera pas déduit tant que le caissier n'aura pas validé.
            </div>
          </div>
        )}

        {isCaisseMode && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs p-3 rounded-xl flex gap-2 items-center">
            <Lock className="w-4 h-4 shrink-0" />
            <div>
              <strong>Encaissement.</strong> Saisissez le <strong>total déjà payé</strong> par le client. Le stock est déduit à la première validation.
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-x-5 gap-y-5">
          {isCaisseMode ? (
            <div>
              <label className="block text-xs font-medium mb-2">Client</label>
              <div className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs flex items-center font-semibold text-gray-700">
                {form.client}
              </div>
            </div>
          ) : (
            <CustomSelect label="Client *" options={clientOptions} value={form.client} onChange={(v) => setForm({ ...form, client: v })} placeholder="Rechercher client..." />
          )}

          <div>
            <label className="block text-xs font-medium mb-2">Date vente *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              disabled={isCaisseMode}
              className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          {isFidele && (
            <div className="col-span-2 flex items-center gap-2 text-[11px] bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg px-3 py-2">
              <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500 shrink-0" />
              <span>
                <strong>Client fidèle</strong> : peut payer à crédit sous {CREDIT_DAYS} jours.
                {overdueSales.length > 0 && <strong className="text-red-600"> {overdueSales.length} facture(s) en retard.</strong>}
              </span>
            </div>
          )}

          {!isMagasinier && (
            <>
              <div className="col-span-2 bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800">Document à imprimer :</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDocType('Facture')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${docType === 'Facture' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}
                  >
                    <FileText className="w-4 h-4" /> Facture
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocType('Ticket')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${docType === 'Ticket' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}
                  >
                    <Receipt className="w-4 h-4" /> Ticket
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-2">Paiement</label>
                <select value={form.payment} onChange={(e) => handlePaymentChange(e.target.value)} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs">
                  <option>Espèces</option><option>Virement</option><option>Chèque</option><option>Mobile Money</option><option>Crédit</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-2">{isCredit ? 'Acompte payé (facultatif)' : 'Montant payé'}</label>
                <input
                  type="number"
                  value={form.paid}
                  onChange={(e) => setForm({ ...form, paid: Number(e.target.value) })}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-2">Remise (%)</label>
                <input
                  type="number" min={0} max={100} step="0.5"
                  value={form.remise}
                  onChange={(e) => setForm({ ...form, remise: e.target.value === '' ? '' : Number(e.target.value) })}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs font-bold text-orange-600 focus:ring-2 focus:ring-orange-400 outline-none"
                />
              </div>
              <div className="flex items-end">
                <div className={`w-full h-10 px-3 rounded-lg border text-xs flex items-center justify-between ${
                  remiseAmount > 0 ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-gray-50 border-gray-200 text-gray-400'
                }`}>
                  <span>Remise accordée (HT)</span>
                  <strong>- {formatMoney(remiseAmount)}</strong>
                </div>
              </div>

              {isCredit && (
                <div className={`col-span-2 rounded-xl border p-3 flex flex-wrap items-center justify-between gap-3 ${
                  creditProblem ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <div>
                    <p className={`text-xs font-bold ${creditProblem ? 'text-red-700' : 'text-emerald-800'}`}>Paiement à crédit</p>
                    <p className={`text-[11px] ${creditProblem ? 'text-red-600' : 'text-emerald-700'}`}>
                      {creditProblem || `La marchandise est livrée maintenant. Reste à payer : ${formatMoney(rest)}.`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium">Échéance *</label>
                    <input
                      type="date"
                      value={form.echeance}
                      min={form.date}
                      onChange={(e) => setForm({ ...form, echeance: e.target.value })}
                      className="h-9 px-2 border border-gray-200 rounded-lg text-xs bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, echeance: addDaysStr(creditBase, CREDIT_DAYS) })}
                      className="h-9 px-3 bg-white border border-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50"
                    >
                      +{CREDIT_DAYS} j
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold">Produits</h4>
            {!isCaisseMode && (
              <button onClick={addLine} className="text-xs text-emerald-600 font-semibold hover:underline">+ Ajouter</button>
            )}
          </div>
          <div className="space-y-3">
            {form.lines.map((line, i) => {
              const product = products.find(p => p.id === line.productId);
              const lots = product?.lots.filter(l => l.stock > 0).sort((a, b) => new Date(a.expiry) - new Date(b.expiry)) || [];
              const info = getLineInfo(line);

              // Produits déjà choisis sur les AUTRES lignes : on ne les propose plus
              const usedIds = form.lines
                .filter((_, idx) => idx !== i)
                .map(l => l.productId)
                .filter(Boolean);
              const query = productSearch.trim().toLowerCase();
              const availableProducts = products.filter(p => {
                if (usedIds.includes(p.id)) return false;
                if (!query) return true;
                return [p.name, p.code, p.barcode, p.dci, p.reference]
                  .some(value => String(value || '').toLowerCase().includes(query));
              });

              if (isCaisseMode) {
                return (
                  <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                      <strong className="block text-xs text-gray-800">{product?.name || 'Produit inconnu'}</strong>
                      <span className="text-[10px] text-gray-500">Lot: {line.lot || '—'} — Qté: {line.quantity}</span>
                    </div>
                    <strong className="text-sm text-emerald-700">{formatMoney(info.total)}</strong>
                  </div>
                );
              }

              return (
                <div key={i} className="grid grid-cols-12 gap-3 items-start">
                  <div className="col-span-4 relative">
                    <input
                      type="text"
                      value={activeProductSelect === i ? productSearch : (product?.name || '')}
                      onFocus={() => {
                        setActiveProductSelect(i);
                        setProductSearch('');
                      }}
                      onChange={(e) => {
                        setActiveProductSelect(i);
                        setProductSearch(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setActiveProductSelect(null);
                          setProductSearch('');
                        }
                      }}
                      placeholder="Rechercher ou sélectionner un produit..."
                      autoComplete="off"
                      className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                    {activeProductSelect === i && (
                      <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl">
                        {availableProducts.map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              updateLine(i, 'productId', p.id);
                              setActiveProductSelect(null);
                              setProductSearch('');
                            }}
                            className={`w-full px-3 py-2.5 text-left hover:bg-emerald-50 border-b border-gray-100 last:border-0 ${
                              line.productId === p.id ? 'bg-emerald-50' : ''
                            }`}
                          >
                            <span className="flex items-center gap-2 text-xs font-semibold text-gray-800">
                              {p.name}
                              {(p.lots || []).some(l => l.stock > 0 && l.promoRate > 0) && (
                                <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-[9px] font-bold">
                                  LOT EN PROMO
                                </span>
                              )}
                            </span>
                            <span className="block mt-0.5 text-[10px] text-gray-500">
                              {p.code || p.barcode || p.dci || 'Produit'} · Stock : {p.stock || 0}
                            </span>
                          </button>
                        ))}
                        {availableProducts.length === 0 && (
                          <p className="px-3 py-4 text-center text-xs text-gray-500">
                            Aucun produit trouvé
                          </p>
                        )}
                      </div>
                    )}
                    {product && (
                      <div className="mt-1.5 text-[10px] text-gray-500">
                        Stock: <strong className="text-emerald-700">{info.stock}</strong> · Dispo: <strong className={info.available === 0 ? 'text-red-600' : 'text-emerald-700'}>{info.available}</strong>
                      </div>
                    )}
                  </div>

                  <div className="col-span-3">
                    {product && !info.hasLots ? (
                      <div className="w-full h-10 px-3 border border-red-200 bg-red-50 rounded-lg text-[10px] text-red-600 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Épuisé
                      </div>
                    ) : (
                      <select value={line.lot || ''} onChange={(e) => updateLine(i, 'lot', e.target.value)} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" disabled={!product}>
                        <option value="">Lot FEFO</option>
                        {lots.map(l => (
                          <option key={l.id} value={l.id}>
                            {l.id} ({formatDate(l.expiry)}) - {l.stock}{l.promoRate > 0 ? ` · PROMO -${l.promoRate}%` : ''}
                          </option>
                        ))}
                      </select>
                    )}
                    {product && getLotPromo(product, line.lot) > 0 && (
                      <div className="mt-1.5 px-2 py-1 bg-orange-50 border border-orange-200 rounded text-[10px] text-orange-700 font-semibold">
                        Promo lot -{getLotPromo(product, line.lot)}% :{' '}
                        <span className="line-through text-gray-400 font-normal">{formatMoney(getBasePrice(product, clientType))}</span>
                        {' '}→ {formatMoney(line.price)}
                      </div>
                    )}
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number" min={1} max={info.lotStock}
                      value={line.quantity}
                      onChange={(e) => updateLine(i, 'quantity', Number(e.target.value))}
                      className={`w-full h-10 px-3 border rounded-lg text-xs ${line.quantity > info.lotStock ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                    />
                  </div>
                  <div className="col-span-2 pt-3">
                    <span className="text-xs font-bold text-emerald-700">{formatMoney(info.total)}</span>
                  </div>
                  <button onClick={() => removeLine(i)} className="col-span-1 h-10 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100">×</button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-5 space-y-3 text-xs">
          <div className="flex justify-between"><span>Sous-total HT</span><strong>{formatMoney(subtotalHT)}</strong></div>
          {remiseRate > 0 && (
            <div className="flex justify-between text-orange-600">
              <span>Remise ({remiseRate} %)</span><strong>- {formatMoney(remiseAmount)}</strong>
            </div>
          )}
          <div className="flex justify-between"><span>TVA</span><strong>{formatMoney(totalTVA)}</strong></div>
          <div className="flex justify-between border-t-2 border-emerald-500 pt-2 text-base"><span className="font-bold">Total TTC</span><strong className="text-emerald-700">{formatMoney(totalTTC)}</strong></div>
          {!isMagasinier && (form.paid > 0 || isCredit) && (
            <>
              <div className="flex justify-between"><span>Déjà payé</span><strong>{formatMoney(form.paid)}</strong></div>
              <div className={`flex justify-between ${rest > 0 ? 'text-orange-600' : 'text-emerald-700'}`}>
                <span className="font-bold">Reste à payer{isCredit && form.echeance ? ` (avant le ${formatDate(form.echeance)})` : ''}</span>
                <strong>{formatMoney(rest)}</strong>
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}