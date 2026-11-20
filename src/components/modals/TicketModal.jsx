import Modal from './Modal';
import { formatMoney } from '../../utils/format';
import { formatDate } from '../../utils/dates';
import { useData } from '../../context/DataContext';

export default function TicketModal({ isOpen, onClose, sale }) {
  const { settings } = useData();
  if (!sale) return null;

  const subtotal = sale.products.reduce((s, p) => s + p.quantity * p.price, 0);
  const totalTTC = sale.products.reduce((s, p) => s + p.quantity * p.price * (1 + p.tva / 100), 0);
  const rest = totalTTC - (sale.paid || 0);

  return (
    <Modal
      isOpen={isOpen} onClose={onClose}
      title="Ticket de caisse" label="TICKET"
      maxWidth="max-w-sm"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-xs">Fermer</button>
          <button onClick={() => window.print()} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700">Imprimer</button>
        </>
      }
    >
      {/* Zone imprimable */}
      <div className="ticket-print text-black font-mono text-xs w-full max-w-[300px] mx-auto bg-white p-2">
        
        {/* En-tête avec LOGO */}
        <div className="text-center mb-4 flex flex-col items-center">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="w-16 h-16 object-contain mb-2" 
          />
          <h2 className="text-sm font-bold uppercase">{settings.company.name}</h2>
          <p className="text-[10px]">{settings.company.address}</p>
          <p className="text-[10px]">Tél : {settings.company.phone}</p>
          <p className="text-[10px]">NIF : {settings.company.nif}</p>
        </div>

        <div className="border-t border-dashed border-black my-2"></div>

        {/* Infos Vente */}
        <div className="text-[10px] mb-2">
          <div className="flex justify-between"><span>Date :</span><span>{formatDate(sale.date)}</span></div>
          <div className="flex justify-between"><span>Ticket :</span><span>{sale.number}</span></div>
          <div className="flex justify-between"><span>Client :</span><span>{sale.client}</span></div>
          <div className="flex justify-between"><span>Caissier :</span><span>{sale.userName || 'Inconnu'}</span></div>
        </div>

        <div className="border-t border-dashed border-black my-2"></div>

        {/* Liste des produits */}
        <table className="w-full text-[10px] mb-2">
          <thead>
            <tr className="border-b border-black">
              <th className="text-left py-1">Article</th>
              <th className="text-center">Qté</th>
              <th className="text-right">Prix</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.products.map((p, i) => (
              <tr key={i}>
                <td className="py-1 truncate max-w-[100px]">{p.name}</td>
                <td className="text-center">{p.quantity}</td>
                <td className="text-right">{formatMoney(p.price)}</td>
                <td className="text-right">{formatMoney(p.quantity * p.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-dashed border-black my-2"></div>

        {/* Totaux */}
        <div className="space-y-1 text-[10px]">
          <div className="flex justify-between"><span>Sous-total HT</span><span>{formatMoney(subtotal)}</span></div>
          <div className="flex justify-between"><span>TVA</span><span>{formatMoney(totalTTC - subtotal)}</span></div>
          <div className="flex justify-between font-bold text-sm mt-1"><span>TOTAL TTC</span><span>{formatMoney(totalTTC)}</span></div>
          <div className="flex justify-between"><span>Payé ({sale.payment})</span><span>{formatMoney(sale.paid || 0)}</span></div>
          {rest > 0 && (
            <div className="flex justify-between font-bold"><span>RESTE À PAYER</span><span>{formatMoney(rest)}</span></div>
          )}
        </div>

        <div className="border-t border-dashed border-black my-4"></div>

        {/* Pied de page */}
        <div className="text-center text-[10px]">
          <p>Merci de votre visite !</p>
          <p className="mt-1">À bientôt</p>
        </div>
      </div>
    </Modal>
  );
}