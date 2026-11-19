import { useData } from '../context/DataContext';
import { formatMoney } from '../utils/format';
import { formatDate, TODAY } from '../utils/dates';
import PageHeader from '../components/common/PageHeader';
import MiniStat from '../components/common/MiniStat';
import { FileText } from 'lucide-react';
import { useState } from 'react';
import InvoiceModal from '../components/modals/InvoiceModal';

export default function Creances() {
  const { sales } = useData();
  const [invoice, setInvoice] = useState(null);

  const unpaid = sales.filter(s => s.status !== 'Payée');
  let total = 0, pending = 0, late = 0;

  const rows = unpaid.map(s => {
    const montant = s.products.reduce((a, p) => a + p.quantity * p.price * (1 + p.tva / 100), 0);
    total += montant;
    const isLate = s.echeance && new Date(s.echeance) < TODAY;
    if (isLate) late += montant;
    else pending += montant;
    return { ...s, montant, isLate };
  });

  return (
    <div>
      <PageHeader title="Créances clients" subtitle="Suivi des paiements et montants dus" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <MiniStat label="Total créances" value={formatMoney(total)} />
        <MiniStat label="En attente" value={formatMoney(pending)} variant="warning" />
        <MiniStat label="En retard" value={formatMoney(late)} variant="danger" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Client</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Facture</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Montant</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Échéance</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Statut</th>
                <th className="px-4 py-3 text-center font-bold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center text-gray-500">Aucune créance</td></tr>
              ) : rows.map(s => (
                <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3"><strong>{s.client}</strong></td>
                  <td className="px-4 py-3 font-mono text-emerald-700">{s.number}</td>
                  <td className="px-4 py-3 font-bold">{formatMoney(s.montant)}</td>
                  <td className="px-4 py-3">{s.echeance ? formatDate(s.echeance) : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      s.isLate ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>{s.isLate ? 'En retard' : 'En attente'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setInvoice(s)}
                      className="w-7 h-7 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 flex items-center justify-center mx-auto">
                      <FileText className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <InvoiceModal isOpen={!!invoice} onClose={() => setInvoice(null)} sale={invoice} />
    </div>
  );
}