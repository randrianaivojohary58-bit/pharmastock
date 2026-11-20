import Modal from './Modal';
import { formatMoney } from '../../utils/format';
import { formatDate } from '../../utils/dates';
import { convertNumberToWords } from '../../utils/numberToWords';
import { useData } from '../../context/DataContext';

export default function InvoiceModal({ isOpen, onClose, sale }) {
  const { clients, settings } = useData();
  if (!sale) return null;

  const subtotal = sale.products.reduce((s, p) => s + p.quantity * p.price, 0);
  const totalTTC = sale.products.reduce((s, p) => s + p.quantity * p.price * (1 + p.tva / 100), 0);
  const vat = totalTTC - subtotal;
  const rest = totalTTC - (sale.paid || 0);
  const totalWords = convertNumberToWords(Math.round(totalTTC));
  const client = clients.find(c => c.name === sale.client);

  return (
    <Modal
      isOpen={isOpen} onClose={onClose}
      title={`Facture ${sale.number}`} label="FACTURE"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-xs">Fermer</button>
          <button onClick={() => window.print()} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs">Imprimer</button>
        </>
      }
    >
      <div className="invoice-print text-gray-800">
        <div className="flex justify-between items-start pb-5 border-b-2 border-emerald-500 mb-5">
          
          {/* --- MODIFICATION DE L'EN-TÊTE AVEC LE LOGO --- */}
          <div className="flex items-center gap-4">
            {/* Remplacement du cercle vert par l'image du logo */}
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-16 h-16 object-contain" 
              onError={(e) => {
                e.target.style.display = 'none'; // Cache l'image si elle n'est pas trouvée
                e.target.nextSibling.style.display = 'flex'; // Affiche le fallback (le cercle)
              }}
            />
            {/* Fallback : le cercle vert s'affiche si l'image est introuvable */}
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white hidden items-center justify-center text-2xl font-bold">
              ℞
            </div>

            <div>
              <h2 className="text-lg font-bold text-emerald-700">{settings.company.name}</h2>
              <p className="text-xs text-gray-500">Grossiste Pharmaceutique</p>
              <p className="text-xs text-gray-500">{settings.company.address}</p>
              <p className="text-xs text-gray-500">NIF : {settings.company.nif} — STAT : {settings.company.stat}</p>
            </div>
          </div>

          <div className="text-right">
            <h3 className="text-xl font-bold text-emerald-700 tracking-wider">FACTURE</h3>
            <p className="text-sm font-bold mt-1">{sale.number}</p>
            <p className="text-xs text-gray-600">Date : {formatDate(sale.date)}</p>
            <p className="text-xs text-gray-600">Paiement : {sale.payment}</p>
            {sale.echeance && <p className="text-xs text-red-600 font-bold mt-1">Échéance : {formatDate(sale.echeance)}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-gray-50 p-4 rounded-lg">
            <strong className="block text-[10px] text-emerald-600 uppercase tracking-wider mb-2">Client</strong>
            <p className="text-xs"><strong>{sale.client}</strong></p>
            <p className="text-xs">{client?.address}</p>
            <p className="text-xs">Tél : {client?.phone}</p>
            <p className="text-xs">NIF : {client?.nif}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <strong className="block text-[10px] text-emerald-600 uppercase tracking-wider mb-2">Type client</strong>
            <p className="text-xs">{sale.clientType}</p>
          </div>
        </div>

        <table className="w-full text-xs mb-5">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-left">Désignation</th>
              <th className="p-2 text-center">Qté</th>
              <th className="p-2 text-right">Prix unit.</th>
              <th className="p-2 text-center">TVA</th>
              <th className="p-2 text-right">Total TTC</th>
            </tr>
          </thead>
          <tbody>
            {sale.products.map((p, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="p-2 font-medium">{p.name}</td>
                <td className="p-2 text-center">{p.quantity}</td>
                <td className="p-2 text-right">{formatMoney(p.price)}</td>
                <td className="p-2 text-center">{p.tva}%</td>
                <td className="p-2 text-right font-bold">{formatMoney(p.quantity * p.price * (1 + p.tva / 100))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto w-80 text-xs space-y-1">
          <div className="flex justify-between"><span>Sous-total HT</span><strong>{formatMoney(subtotal)}</strong></div>
          <div className="flex justify-between"><span>TVA</span><strong>{formatMoney(vat)}</strong></div>
          <div className="flex justify-between border-t-2 border-emerald-500 pt-2 text-lg">
            <span className="font-bold">TOTAL TTC</span>
            <strong className="text-emerald-700">{formatMoney(totalTTC)}</strong>
          </div>
          <div className="flex justify-between"><span>Payé ({sale.payment})</span><strong className="text-emerald-600">{formatMoney(sale.paid || 0)}</strong></div>
          {rest > 0 && (
            <div className="flex justify-between"><span>Reste à payer</span><strong className="text-red-600">{formatMoney(rest)}</strong></div>
          )}
        </div>

        <div className="mt-5 p-3 bg-emerald-50 border-2 border-dashed border-emerald-500 rounded-lg text-xs italic">
          Arrêté le montant total de la présente facture à la somme de{' '}
          <strong className="not-italic text-emerald-700">{totalWords} ariary</strong>
        </div>

        <div className="grid grid-cols-2 gap-10 mt-10">
          <div className="text-center border-t border-gray-300 pt-2">
            <div className="h-14" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Signature du Client</span>
          </div>
          <div className="text-center border-t border-gray-300 pt-2">
            <div className="h-14" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Signature du Responsable</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}