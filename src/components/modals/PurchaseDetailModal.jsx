import Modal from './Modal';
import { formatMoney } from '../../utils/format';
import { formatDate } from '../../utils/dates';

export default function PurchaseDetailModal({ isOpen, onClose, purchase }) {
  if (!purchase) return null;

  const subtotal = purchase.products.reduce((s, x) => s + x.quantity * x.price, 0);
  const remise = subtotal * (purchase.remiseRate / 100);
  const afterRemise = subtotal - remise;
  const tva = afterRemise * (purchase.tvaRate / 100);
  const total = afterRemise + tva;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Achat ${purchase.number}`} label="DÉTAIL ACHAT" maxWidth="max-w-4xl">
      <div className="flex justify-between mb-4">
        <div>
          <h3 className="text-emerald-700 font-bold">{purchase.supplier}</h3>
          <p className="text-xs text-gray-500">Fournisseur</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold">N° {purchase.number}</p>
          <p className="text-xs text-gray-500">Date : {formatDate(purchase.date)}</p>
        </div>
      </div>

      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-2 text-left">Désignation</th>
            <th className="p-2 text-center">Qté</th>
            <th className="p-2 text-right">P.U</th>
            <th className="p-2 text-right">Montant</th>
          </tr>
        </thead>
        <tbody>
          {purchase.products.map((p, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="p-2 font-medium">{p.name}</td>
              <td className="p-2 text-center">{p.quantity}</td>
              <td className="p-2 text-right">{formatMoney(p.price)}</td>
              <td className="p-2 text-right font-bold">{formatMoney(p.quantity * p.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 ml-auto w-72 text-xs space-y-1">
        <div className="flex justify-between"><span>Total HT</span><strong>{formatMoney(subtotal)}</strong></div>
        {purchase.remiseRate > 0 && (
          <>
            <div className="flex justify-between text-orange-600"><span>Remise ({purchase.remiseRate}%)</span><strong>- {formatMoney(remise)}</strong></div>
            <div className="flex justify-between"><span>Après remise</span><strong>{formatMoney(afterRemise)}</strong></div>
          </>
        )}
        <div className="flex justify-between"><span>TVA ({purchase.tvaRate}%)</span><strong>{formatMoney(tva)}</strong></div>
        <div className="flex justify-between border-t-2 border-emerald-500 pt-2 text-base">
          <span className="font-bold">TOTAL TTC</span>
          <strong className="text-emerald-700">{formatMoney(total)}</strong>
        </div>
      </div>
    </Modal>
  );
}