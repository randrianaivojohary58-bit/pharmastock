import { useRef } from 'react';
import Modal from './Modal';
import { formatMoney } from '../../utils/format';
import { formatDate } from '../../utils/dates';
import { useData } from '../../context/DataContext';
import { isOverdue } from '../../utils/salesStats';

export default function TicketModal({ isOpen, onClose, sale }) {
  const { settings, products: catalog } = useData();
  const printRef = useRef(null);

  if (!sale) return null;

  // Sécurisation des données
  const company = settings?.company || {};
  const products = sale.products || [];
  const paid = Number(sale.paid) || 0;

  const subtotal = products.reduce(
    (s, p) => s + (Number(p.quantity) || 0) * (Number(p.price) || 0),
    0
  );
  const totalTTCBrut = products.reduce(
    (s, p) =>
      s +
      (Number(p.quantity) || 0) *
        (Number(p.price) || 0) *
        (1 + (Number(p.tva) || 0) / 100),
    0
  );
  // Remise en % appliquée sur le HT, avant TVA
  const remiseRate = Math.min(Math.max(Number(sale.remiseRate) || 0, 0), 100);
  const remiseAmount = subtotal * remiseRate / 100;
  const totalTTC = totalTTCBrut * (1 - remiseRate / 100);
  const tvaAmount = totalTTC - (subtotal - remiseAmount);
  const rest = totalTTC - paid;
  const cartons = products.reduce((s, p) => s + (Number(p.quantity) || 0), 0);

  // ---- Type de document ----
  const isProforma = !!sale.isProforma || sale.status === 'En attente';
  const hasRest = !isProforma && rest > 0.5;
  const isCredit = hasRest && sale.payment === 'Crédit';
  const late = isOverdue(sale);

  let statusLabel = 'PAYÉ';
  if (isProforma) statusLabel = 'PROFORMA - NON PAYÉ';
  else if (isCredit && paid <= 0) statusLabel = 'VENTE À CRÉDIT';
  else if (hasRest) statusLabel = 'PAIEMENT PARTIEL';

  // Numéro de lot lisible (le lot enregistré en base est un UUID)
  const getLotNumber = (p) => {
    const product = catalog?.find(prod => prod.id === p.productId);
    const lot = product?.lots?.find(l => l._db_id === p.lot || l.id === p.lot || l.id === p.lotLabel);
    return lot ? lot.id : (p.lotLabel || '');
  };

  // Impression isolée
  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    const win = window.open('', '_blank', 'width=420,height=720');
    if (!win) {
      alert("Veuillez autoriser les pop-ups pour imprimer le ticket.");
      return;
    }

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${isProforma ? 'Proforma' : 'Ticket'} ${sale.number || ''}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            @page { size: 80mm auto; margin: 0; }
            body {
              width: 80mm;
              padding: 4mm;
              font-family: 'Courier New', monospace;
              font-size: 11px;
              color: #000;
              background: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .small { font-size: 9.5px; }
            .dashed { border-top: 1px dashed #000; margin: 4px 0; }
            .row { display: flex; justify-content: space-between; margin: 1.5px 0; }
            img.logo { width: 18mm; height: 18mm; object-fit: contain; display: block; margin: 0 auto 3px; }
            h1 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
            h2 { font-size: 12px; text-transform: uppercase; margin: 4px 0; }
            table { width: 100%; border-collapse: collapse; font-size: 9.5px; }
            th { text-align: left; border-bottom: 1px solid #000; padding: 2px 0; }
            td { padding: 1.5px 0; vertical-align: top; }
            .qty { text-align: center; }
            .right { text-align: right; }
            .grand { font-size: 13px; font-weight: bold; }
            .footer { margin-top: 6px; font-size: 9px; }
          </style>
        </head>
        <body>${content.innerHTML}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 300);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isProforma ? 'Ticket proforma' : 'Ticket de caisse'}
      label={isProforma ? 'PROFORMA' : 'TICKET'}
      maxWidth="max-w-sm"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-lg text-xs hover:bg-gray-50"
          >
            Fermer
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs hover:bg-purple-700"
          >
            Imprimer
          </button>
        </>
      }
    >
      {/* Aperçu du ticket — le contenu ci-dessous est aussi utilisé pour l'impression */}
      <div className="flex justify-center bg-gray-100 p-3 rounded-lg">
        <div
          ref={printRef}
          className="ticket text-black font-mono bg-white p-3 shadow"
          style={{ width: '72mm', fontSize: '11px' }}
        >
          {/* En-tête entreprise */}
          <div className="center">
            <img
              src="/logo.png"
              alt="Logo"
              className="logo"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <h1 className="bold">{company.name || 'MON ENTREPRISE'}</h1>
            {company.address && (
              <div className="small">{company.address}</div>
            )}
            {company.phone && (
              <div className="small">Tél : {company.phone}</div>
            )}
            {company.email && <div className="small">{company.email}</div>}
            {company.nif && <div className="small">NIF : {company.nif}</div>}
            {company.stat && <div className="small">STAT : {company.stat}</div>}
          </div>

          <div className="dashed" />

          <div className="center bold" style={{ fontSize: '12px' }}>
            {isProforma ? 'TICKET PROFORMA' : 'TICKET DE CAISSE'}
          </div>

          {/* Pastille de statut (styles en ligne : fonctionne à l'écran et à l'impression) */}
          <div
            className="center bold"
            style={{
              border: '1.5px solid #000',
              padding: '2px 4px',
              margin: '4px 0',
              fontSize: '10.5px',
              letterSpacing: '0.5px',
              textAlign: 'center',
              fontWeight: 'bold'
            }}
          >
            {statusLabel}
          </div>

          <div className="small" style={{ marginTop: '4px' }}>
            <div className="row">
              <span>N° :</span>
              <span className="bold">{sale.number || '—'}</span>
            </div>
            <div className="row">
              <span>Date :</span>
              <span>{formatDate(sale.date)}</span>
            </div>
            <div className="row">
              <span>Client :</span>
              <span>{sale.client || 'Client comptant'}</span>
            </div>
            <div className="row">
              <span>{isProforma ? 'Établi par :' : 'Caissier :'}</span>
              <span>{sale.userName || 'Inconnu'}</span>
            </div>
          </div>

          <div className="dashed" />

          {/* Articles */}
          <table>
            <thead>
              <tr>
                <th style={{ width: '48%' }}>Article</th>
                <th className="qty">Qté</th>
                <th className="right">P.U.</th>
                <th className="right">Total</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="center">
                    Aucun article
                  </td>
                </tr>
              ) : (
                products.map((p, i) => {
                  const lineTotal =
                    (Number(p.quantity) || 0) *
                    (Number(p.price) || 0) *
                    (1 + (Number(p.tva) || 0) / 100);
                  const lotNumber = getLotNumber(p);
                  return (
                    <tr key={i}>
                      <td>
                        {p.name || p.productName || 'Produit'}
                        {lotNumber && (
                          <div style={{ fontSize: '8.5px' }}>Lot : {lotNumber}</div>
                        )}
                      </td>
                      <td className="qty">{p.quantity || 0}</td>
                      <td className="right">{formatMoney(p.price || 0)}</td>
                      <td className="right">{formatMoney(lineTotal)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <div className="dashed" />

          {/* Totaux */}
          <div className="small">
            <div className="row">
              <span>Cartons :</span>
              <span className="bold">{cartons}</span>
            </div>
            <div className="row">
              <span>Sous-total HT :</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            {remiseRate > 0 && (
              <div className="row bold">
                <span>Remise ({remiseRate} %) :</span>
                <span>- {formatMoney(remiseAmount)}</span>
              </div>
            )}
            <div className="row">
              <span>TVA :</span>
              <span>{formatMoney(tvaAmount)}</span>
            </div>
            <div className="dashed" />
            <div className="row grand">
              <span>TOTAL TTC :</span>
              <span>{formatMoney(totalTTC)}</span>
            </div>

            {!isProforma && (
              <div className="row">
                <span>Payé ({sale.payment || 'Espèces'}) :</span>
                <span>{formatMoney(paid)}</span>
              </div>
            )}
            {hasRest && (
              <div className="row bold">
                <span>RESTE À PAYER :</span>
                <span>{formatMoney(rest)}</span>
              </div>
            )}
            {hasRest && sale.echeance && (
              <div className="row bold">
                <span>À régler avant le :</span>
                <span>{formatDate(sale.echeance)}{late ? ' (dépassée)' : ''}</span>
              </div>
            )}
            {!isProforma && rest < -0.5 && (
              <div className="row">
                <span>Monnaie rendue :</span>
                <span>{formatMoney(Math.abs(rest))}</span>
              </div>
            )}
          </div>

          <div className="dashed" />

          {/* Pied de page */}
          <div className="center footer">
            {isProforma ? (
              <>
                <div className="bold">Document non valable comme reçu</div>
                <div>Le stock n'est pas réservé</div>
                <div>avant validation du paiement</div>
              </>
            ) : hasRest ? (
              <>
                <div className="bold">Merci de régler le solde</div>
                {sale.echeance && <div>avant le {formatDate(sale.echeance)}</div>}
              </>
            ) : (
              <>
                <div className="bold">Merci de votre visite !</div>
                <div>À bientôt</div>
              </>
            )}
            <div style={{ marginTop: '3px' }}>***</div>
            {company.slogan && (
              <div style={{ marginTop: '2px', fontSize: '9px' }}>
                {company.slogan}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}