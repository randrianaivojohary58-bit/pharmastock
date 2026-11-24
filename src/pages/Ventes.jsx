import { useState } from 'react';
import { Plus, FileText, Edit, Trash2, DollarSign, User, Receipt } from 'lucide-react';
import { useData } from '../context/DataContext';
import PageHeader from '../components/common/PageHeader';
import SearchBar from '../components/common/SearchBar';
import MiniStat from '../components/common/MiniStat';
import SaleModal from '../components/modals/SaleModal';
import InvoiceModal from '../components/modals/InvoiceModal';
import TicketModal from '../components/modals/TicketModal';
import ConfirmModal from '../components/common/ConfirmModal';
import { formatMoney } from '../utils/format';
import { formatDate } from '../utils/dates';
import { saleTotal, saleRest, isCounted, isOverdue, todayStr } from '../utils/salesStats';

export default function Ventes() {
  const { sales, deleteSale } = useData();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [edit, setEdit] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const filtered = sales.filter(s =>
    (s.number || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.client || '').toLowerCase().includes(search.toLowerCase())
  );

  // Ventes du mois : uniquement les ventes encaissées ou livrées (pas les proformas)
  const month = todayStr().slice(0, 7);
  const monthSales = sales.filter(s => isCounted(s) && (s.date || '').startsWith(month));
  const totalMonth = monthSales.reduce((a, s) => a + saleTotal(s), 0);
  const cartons = monthSales.reduce((a, s) => a + (s.products || []).reduce((b, p) => b + (p.quantity || 0), 0), 0);
  const totalRest = sales.reduce((a, s) => a + saleRest(s), 0);

  const handleDelete = async () => {
    if (deleteId) {
      await deleteSale(deleteId);
      setDeleteId(null);
    }
  };

  // Appelé par SaleModal après un enregistrement réussi
  const handleSaleComplete = (saleData, docType) => {
    if (docType === 'Proforma') {
      setInvoice({ ...saleData, isProforma: true });
    } else if (docType === 'Ticket') {
      setTicket(saleData);
    } else {
      setInvoice(saleData);
    }
  };

  const getStatusClass = (status) => {
    if (status === 'Payée') return 'bg-emerald-100 text-emerald-700';
    if (status === 'En attente') return 'bg-orange-100 text-orange-700';
    if (status === 'Partielle') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div>
      <PageHeader
        title="Ventes"
        subtitle="Historique des ventes réalisées"
        action={
          <button
            onClick={() => { setEdit(null); setModalOpen(true); }}
            className="h-10 px-4 bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4" /> Nouvelle vente
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <MiniStat label="Ventes du mois" value={formatMoney(totalMonth)} />
        <MiniStat label="Nombre de ventes (mois)" value={monthSales.length} />
        <MiniStat label="Cartons vendus (mois)" value={cartons} />
        <MiniStat label="Reste à payer (crédits)" value={formatMoney(totalRest)} />
      </div>

      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Rechercher une vente..." />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Facture</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Date</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Client</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Type</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Produits</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Cartons</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Total</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Reste à payer</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Paiement</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Échéance</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Utilisateur</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Statut</th>
                <th className="px-4 py-3 text-center font-bold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={13} className="p-8 text-center text-gray-500">
                    <DollarSign className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    Aucune vente enregistrée
                  </td>
                </tr>
              ) : (
                filtered.map(sale => {
                  const productsList = sale.products || [];
                  const total = saleTotal(sale);
                  const rest = saleRest(sale);
                  const overdue = isOverdue(sale);
                  const isPending = sale.status === 'En attente';
                  const cartonsCount = productsList.reduce((a, p) => a + (p.quantity || 0), 0);

                  return (
                    <tr key={sale.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-emerald-700 font-bold">{sale.number}</td>
                      <td className="px-4 py-3">{formatDate(sale.date)}</td>
                      <td className="px-4 py-3"><strong>{sale.client}</strong></td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">{sale.clientType || '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{productsList.length} produit(s)</td>
                      <td className="px-4 py-3 font-bold">{cartonsCount}</td>
                      <td className="px-4 py-3 font-bold text-emerald-700">
                        {formatMoney(total)}
                        {sale.remiseRate > 0 && (
                          <span className="block text-[10px] font-semibold text-orange-600">Remise -{sale.remiseRate} %</span>
                        )}
                      </td>
                      <td className={`px-4 py-3 font-bold ${rest > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                        {rest > 0 ? formatMoney(rest) : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{sale.payment || '—'}</td>
                      <td className="px-4 py-3">
                        {sale.echeance && sale.status !== 'Payée' ? (
                          <span className={overdue ? 'text-red-600 font-bold' : 'text-gray-600'}>
                            {formatDate(sale.echeance)}{overdue ? ' (retard)' : ''}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-emerald-600" />
                          <span className="text-gray-600">{sale.userName || 'Inconnu'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusClass(sale.status)}`}>
                          {sale.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => setTicket(sale)}
                            className="w-7 h-7 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 flex items-center justify-center"
                            title="Ticket de caisse"
                          >
                            <Receipt className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setInvoice(isPending ? { ...sale, isProforma: true } : sale)}
                            className="w-7 h-7 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 flex items-center justify-center"
                            title={isPending ? 'Facture proforma' : 'Facture'}
                          >
                            <FileText className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => { setEdit(sale); setModalOpen(true); }}
                            className="w-7 h-7 bg-orange-50 text-orange-600 rounded hover:bg-orange-100 flex items-center justify-center"
                            title="Modifier"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setDeleteId(sale.id)}
                            className="w-7 h-7 bg-red-50 text-red-600 rounded hover:bg-red-100 flex items-center justify-center"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SaleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        sale={edit}
        onSuccess={handleSaleComplete}
      />
      <InvoiceModal isOpen={!!invoice} onClose={() => setInvoice(null)} sale={invoice} />
      <TicketModal isOpen={!!ticket} onClose={() => setTicket(null)} sale={ticket} />

      <ConfirmModal
        isOpen={!!deleteId}
        title="Supprimer la vente ?"
        message="Voulez-vous vraiment supprimer cette vente ? Le stock sera restitué s'il a déjà été déduit."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}