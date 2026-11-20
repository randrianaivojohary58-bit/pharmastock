import { useState } from 'react';
import { Plus, FileText, Edit, Trash2, DollarSign, User, Receipt } from 'lucide-react'; // Ajout de Receipt
import { useData } from '../context/DataContext';
import PageHeader from '../components/common/PageHeader';
import SearchBar from '../components/common/SearchBar';
import MiniStat from '../components/common/MiniStat';
import SaleModal from '../components/modals/SaleModal';
import InvoiceModal from '../components/modals/InvoiceModal';
import TicketModal from '../components/modals/TicketModal'; // <-- NOUVEL IMPORT
import ConfirmModal from '../components/common/ConfirmModal';
import { formatMoney } from '../utils/format';
import { formatDate } from '../utils/dates';

export default function Ventes() {
  const { sales, deleteSale } = useData();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [ticket, setTicket] = useState(null); // <-- NOUVEL ETAT
  const [edit, setEdit] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const filtered = sales.filter(s =>
    (s.number || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.client || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalMonth = sales.reduce((s, sale) =>
    s + (sale.products || []).reduce((a, p) => a + (p.quantity || 0) * (p.price || 0) * (1 + (p.tva || 0) / 100), 0), 0
  );
  const cartons = sales.reduce((s, sale) =>
    s + (sale.products || []).reduce((a, p) => a + (p.quantity || 0), 0), 0
  );

  const handleDelete = async () => {
    if (deleteId) {
      await deleteSale(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Ventes"
        subtitle="Historique des ventes réalisées"
        action={
          <button onClick={() => { setEdit(null); setModalOpen(true); }}
            className="h-10 px-4 bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-emerald-700">
            <Plus className="w-4 h-4" /> Nouvelle vente
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <MiniStat label="Ventes du mois" value={formatMoney(totalMonth)} />
        <MiniStat label="Nombre de ventes" value={sales.length} />
        <MiniStat label="Cartons vendus" value={cartons} />
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
                  <td colSpan={12} className="p-8 text-center text-gray-500">
                    <DollarSign className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    Aucune vente enregistrée
                  </td>
                </tr>
              ) : (
                filtered.map(sale => {
                  const productsList = sale.products || [];
                  const total = productsList.reduce((a, p) => a + (p.quantity || 0) * (p.price || 0) * (1 + (p.tva || 0) / 100), 0);
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
                      <td className="px-4 py-3 font-bold text-emerald-700">{formatMoney(total)}</td>
                      <td className="px-4 py-3 text-gray-600">{sale.payment || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{sale.echeance ? formatDate(sale.echeance) : '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-emerald-600" />
                          <span className="text-gray-600">{sale.userName || 'Inconnu'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          sale.status === 'Payée' ? 'bg-emerald-100 text-emerald-700' :
                          sale.status === 'En attente' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                        }`}>{sale.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          {/* BOUTON TICKET AJOUTÉ ICI */}
                          <button onClick={() => setTicket(sale)} className="w-7 h-7 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 flex items-center justify-center" title="Ticket de caisse">
                            <Receipt className="w-3 h-3" />
                          </button>
                          <button onClick={() => setInvoice(sale)} className="w-7 h-7 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 flex items-center justify-center" title="Facture">
                            <FileText className="w-3 h-3" />
                          </button>
                          <button onClick={() => { setEdit(sale); setModalOpen(true); }} className="w-7 h-7 bg-orange-50 text-orange-600 rounded hover:bg-orange-100 flex items-center justify-center" title="Modifier">
                            <Edit className="w-3 h-3" />
                          </button>
                          <button onClick={() => setDeleteId(sale.id)} className="w-7 h-7 bg-red-50 text-red-600 rounded hover:bg-red-100 flex items-center justify-center" title="Supprimer">
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

      <SaleModal isOpen={modalOpen} onClose={() => setModalOpen(false)} sale={edit} />
      <InvoiceModal isOpen={!!invoice} onClose={() => setInvoice(null)} sale={invoice} />
      {/* MODALE TICKET AJOUTÉE ICI */}
      <TicketModal isOpen={!!ticket} onClose={() => setTicket(null)} sale={ticket} />
      
      <ConfirmModal
        isOpen={!!deleteId}
        title="Supprimer la vente ?"
        message="Voulez-vous vraiment supprimer cette vente ? Le stock sera restitué."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}