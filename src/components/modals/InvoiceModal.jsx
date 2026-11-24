import Modal from './Modal';
import { formatMoney } from '../../utils/format';
import { formatDate } from '../../utils/dates';
import { convertNumberToWords } from '../../utils/numberToWords';
import { useData } from '../../context/DataContext';
import { isOverdue } from '../../utils/salesStats';

export default function InvoiceModal({ isOpen, onClose, sale }) {
  const { clients, products, settings } = useData();
  if (!sale) return null;

  const company = settings?.company || {};
  const client = clients.find(c => c.name === sale.client);
  const lines = sale.products || [];

  // ---- Calculs ----
  const subtotal = lines.reduce((s, p) => s + p.quantity * p.price, 0);
  const remiseRate = Math.min(Math.max(Number(sale.remiseRate) || 0, 0), 100);
  const remiseAmount = subtotal * remiseRate / 100;
  const totalTTC = lines.reduce((s, p) => s + p.quantity * p.price * (1 + (p.tva || 0) / 100), 0) * (1 - remiseRate / 100);
  const vat = totalTTC - (subtotal - remiseAmount);
  const paid = sale.paid || 0;
  const rest = Math.max(totalTTC - paid, 0);
  const totalWords = convertNumberToWords(Math.round(totalTTC));

  // ---- Type de document ----
  const isProforma = !!sale.isProforma || sale.status === 'En attente';
  const docTitle = isProforma ? 'FACTURE PROFORMA' : 'FACTURE';
  const hasRest = !isProforma && rest > 0.5;
  const isCredit = hasRest && sale.payment === 'Crédit';
  const late = isOverdue(sale);

  // Pastille de statut
  let badge = { label: 'ACQUITTÉE', cls: 'text-emerald-700 border-emerald-600' };
  if (isProforma) badge = { label: 'PROFORMA — NON PAYÉE', cls: 'text-orange-600 border-orange-500' };
  else if (isCredit && paid <= 0) badge = { label: 'À CRÉDIT', cls: 'text-yellow-700 border-yellow-600' };
  else if (hasRest) badge = { label: 'PAYÉE PARTIELLEMENT', cls: 'text-yellow-700 border-yellow-600' };

  // Retrouve le numéro de lot lisible et la péremption à partir du produit
  const getLot = (p) => {
    const product = products.find(prod => prod.id === p.productId);
    const lot = product?.lots?.find(l => l._db_id === p.lot || l.id === p.lot || l.id === p.lotLabel);
    return lot ? { number: lot.id, expiry: lot.expiry } : { number: p.lotLabel || '', expiry: '' };
  };

  return (
    <Modal
      isOpen={isOpen} onClose={onClose}
      title={`${isProforma ? 'Facture proforma' : 'Facture'} ${sale.number}`}
      label={isProforma ? 'PROFORMA' : 'FACTURE'}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-xs">Fermer</button>
          <button onClick={() => window.print()} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs">Imprimer</button>
        </>
      }
    >
      {/* Conserve les couleurs de fond à l'impression */}
      <style>{`.invoice-print, .invoice-print * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }`}</style>

      <div className="invoice-print text-gray-800 text-[11px] leading-relaxed">

        {/* ===== EN-TÊTE ===== */}
        <div className="flex justify-between items-start gap-6">
          <div className="flex items-start gap-3">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-16 h-16 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="w-14 h-14 rounded-xl bg-emerald-600 text-white hidden items-center justify-center text-2xl font-bold">℞</div>

            <div>
              <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide">{company.name}</h2>
              <p className="text-gray-500">Grossiste Pharmaceutique</p>
              {company.address && <p className="text-gray-600">{company.address}</p>}
              {(company.phone || company.email) && (
                <p className="text-gray-600">
                  {company.phone && <>Tél : {company.phone}</>}
                  {company.phone && company.email && ' — '}
                  {company.email}
                </p>
              )}
              <p className="text-gray-600">NIF : {company.nif} — STAT : {company.stat}</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <h3 className="text-xl font-bold text-emerald-700 tracking-widest">{docTitle}</h3>
            <p className="text-sm font-bold font-mono mt-0.5">N° {sale.number}</p>
            <span className={`inline-block mt-2 px-3 py-1 border-2 rounded text-[10px] font-bold tracking-wider ${badge.cls}`}>
              {badge.label}
            </span>
          </div>
        </div>

        <div className="h-0.5 bg-emerald-600 mt-4 mb-4" />

        {/* ===== INFOS CLIENT + DOCUMENT ===== */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="border border-gray-300 rounded p-3">
            <strong className="block text-[9px] text-gray-500 uppercase tracking-widest mb-1.5">Facturé à</strong>
            <p className="text-xs font-bold text-gray-900">{sale.client}</p>
            {client?.address && <p>{client.address}</p>}
            {client?.phone && <p>Tél : {client.phone}</p>}
            {client?.nif && <p>NIF : {client.nif}</p>}
            {sale.clientType && <p className="text-gray-500">Type : {sale.clientType}</p>}
          </div>

          <div className="border border-gray-300 rounded p-3">
            <strong className="block text-[9px] text-gray-500 uppercase tracking-widest mb-1.5">Détails du document</strong>
            <div className="flex justify-between"><span className="text-gray-500">Date</span><strong>{formatDate(sale.date)}</strong></div>
            {!isProforma && (
              <div className="flex justify-between"><span className="text-gray-500">Mode de paiement</span><strong>{sale.payment}</strong></div>
            )}
            {!isProforma && sale.echeance && hasRest && (
              <div className="flex justify-between">
                <span className="text-gray-500">Échéance</span>
                <strong className={late ? 'text-red-600' : 'text-gray-900'}>{formatDate(sale.echeance)}{late ? ' (dépassée)' : ''}</strong>
              </div>
            )}
            {sale.userName && (
              <div className="flex justify-between"><span className="text-gray-500">Établi par</span><strong>{sale.userName}</strong></div>
            )}
          </div>
        </div>

        {/* ===== PRODUITS ===== */}
        <table className="w-full mb-5 border-collapse">
          <thead>
            <tr className="bg-gray-100 border-y border-gray-300 text-gray-600 text-[10px] uppercase tracking-wide">
              <th className="p-2 text-left w-8">N°</th>
              <th className="p-2 text-left">Désignation</th>
              <th className="p-2 text-left">Lot / Exp.</th>
              <th className="p-2 text-center">Qté</th>
              <th className="p-2 text-right">P.U. HT</th>
              <th className="p-2 text-center">TVA</th>
              <th className="p-2 text-right">Total TTC</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((p, i) => {
              const lot = getLot(p);
              return (
                <tr key={i} className="border-b border-gray-200">
                  <td className="p-2 text-gray-500">{i + 1}</td>
                  <td className="p-2 font-semibold text-gray-900">{p.name}</td>
                  <td className="p-2 text-gray-600">
                    {lot.number ? <span className="font-mono">{lot.number}</span> : '—'}
                    {lot.expiry && <span className="block text-[9px] text-gray-400">Exp. {formatDate(lot.expiry)}</span>}
                  </td>
                  <td className="p-2 text-center">{p.quantity}</td>
                  <td className="p-2 text-right">{formatMoney(p.price)}</td>
                  <td className="p-2 text-center">{p.tva || 0}%</td>
                  <td className="p-2 text-right font-bold">{formatMoney(p.quantity * p.price * (1 + (p.tva || 0) / 100))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* ===== TOTAUX ===== */}
        <div className="flex justify-between items-start gap-6">
          <div className="flex-1 text-gray-500">
            {isProforma && (
              <p className="border border-orange-300 bg-orange-50 text-orange-700 rounded p-2 text-[10px]">
                <strong>Facture proforma</strong> : document établi avant paiement. Il ne vaut pas facture acquittée.
                La facture définitive sera remise après validation du règlement.
              </p>
            )}
          </div>

          <div className="w-72 shrink-0">
            <div className="flex justify-between py-1"><span>Sous-total HT</span><strong>{formatMoney(subtotal)}</strong></div>
            {remiseRate > 0 && (
              <>
                <div className="flex justify-between py-1 text-orange-600"><span>Remise ({remiseRate} %)</span><strong>- {formatMoney(remiseAmount)}</strong></div>
                <div className="flex justify-between py-1"><span>Total HT net</span><strong>{formatMoney(subtotal - remiseAmount)}</strong></div>
              </>
            )}
            <div className="flex justify-between py-1 border-b border-gray-200"><span>TVA</span><strong>{formatMoney(vat)}</strong></div>
            <div className="flex justify-between items-center py-2 bg-emerald-50 border-y-2 border-emerald-600 px-2 -mx-2 mt-1">
              <span className="font-bold text-sm">TOTAL TTC</span>
              <strong className="text-base text-emerald-700">{formatMoney(totalTTC)}</strong>
            </div>

            {!isProforma && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between"><span>Payé{paid > 0 ? ` (${sale.payment})` : ''}</span><strong className="text-emerald-700">{formatMoney(paid)}</strong></div>
                {hasRest && (
                  <div className="flex justify-between text-red-600 font-bold text-xs">
                    <span>Reste à payer</span><strong>{formatMoney(rest)}</strong>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ===== ÉCHÉANCE (crédit) ===== */}
        {hasRest && sale.echeance && (
          <div className={`mt-4 p-3 rounded border-2 text-xs ${late ? 'border-red-500 bg-red-50 text-red-700' : 'border-yellow-500 bg-yellow-50 text-yellow-800'}`}>
            {isCredit ? 'Vente à crédit' : 'Solde restant dû'} : le reste de <strong>{formatMoney(rest)}</strong> est à régler
            avant le <strong>{formatDate(sale.echeance)}</strong>.
          </div>
        )}

        {/* ===== MONTANT EN LETTRES ===== */}
        <div className="mt-4 p-3 border border-dashed border-gray-400 rounded text-xs italic">
          {isProforma ? 'Arrêtée la présente facture proforma' : 'Arrêtée la présente facture'} à la somme de{' '}
          <strong className="not-italic text-gray-900">{totalWords} ariary</strong>
        </div>

        {/* ===== SIGNATURES ===== */}
        <div className="grid grid-cols-2 gap-10 mt-8">
          <div className="text-center border-t border-gray-400 pt-2">
            <div className="h-16" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Signature du client</span>
          </div>
          <div className="text-center border-t border-gray-400 pt-2">
            <div className="h-16" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Signature et cachet du responsable</span>
          </div>
        </div>

        <p className="text-center text-[9px] text-gray-400 mt-6">
          {company.name} — NIF {company.nif} — STAT {company.stat}
        </p>
      </div>
    </Modal>
  );
}