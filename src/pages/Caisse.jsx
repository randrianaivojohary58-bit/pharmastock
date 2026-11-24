import { useState } from 'react';
import { useData } from '../context/DataContext';
import PageHeader from '../components/common/PageHeader';
import SaleModal from '../components/modals/SaleModal';
import InvoiceModal from '../components/modals/InvoiceModal';
import TicketModal from '../components/modals/TicketModal';
import { Receipt, DollarSign, FileText, Search, User, Calendar, Star, Clock } from 'lucide-react';
import { formatMoney } from '../utils/format';
import { formatDate } from '../utils/dates';
import { saleTotal, saleRest, isOverdue, CREDIT_DAYS } from '../utils/salesStats';

export default function Caisse() {
  const { sales, clients } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editSale, setEditSale] = useState(null);
  const [startAsCredit, setStartAsCredit] = useState(false);

  const [lastSale, setLastSale] = useState(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);

  // États de recherche
  const [searchPending, setSearchPending] = useState('');
  const [searchCredit, setSearchCredit] = useState('');
  const [searchPaid, setSearchPaid] = useState('');

  // État du filtre de période
  const [periodFilter, setPeriodFilter] = useState('all'); // 'all', 'today', 'week', 'month'

  // Fonction utilitaire pour vérifier si une date correspond à la période choisie
  const isDateInPeriod = (dateString) => {
    if (periodFilter === 'all') return true;

    const date = new Date(dateString);
    const now = new Date();

    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const n = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (periodFilter === 'today') {
      return d.getTime() === n.getTime();
    }

    if (periodFilter === 'week') {
      const day = n.getDay() || 7;
      const startOfWeek = new Date(n);
      startOfWeek.setDate(n.getDate() - day + 1);
      return d >= startOfWeek && d <= n;
    }

    if (periodFilter === 'month') {
      return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
    }

    return true;
  };

  const matches = (sale, q) =>
    (sale.number || '').toLowerCase().includes(q.toLowerCase()) ||
    (sale.client || '').toLowerCase().includes(q.toLowerCase()) ||
    (sale.userName || '').toLowerCase().includes(q.toLowerCase());

  // --- Infos client fidèle / retards ---
  const isFideleSale = (sale) => !!clients.find(c => c.name === sale.client)?.fidele;
  const clientOverdueCount = (sale) => sales.filter(s => s.client === sale.client && isOverdue(s)).length;

  // --- SECTION 1 : PROFORMAS À VALIDER (stock non déduit) ---
  const pendingSales = sales.filter(s => s.status === 'En attente' && isDateInPeriod(s.date));
  const filteredPendingSales = pendingSales.filter(s => matches(s, searchPending));

  // --- SECTION 2 : CRÉDITS À ENCAISSER (déjà livrés, reste à payer) ---
  // Le filtre de période ne s'applique pas : une dette impayée doit toujours rester visible
  const creditSales = sales
    .filter(s => s.status === 'Partielle')
    .sort((a, b) => (a.echeance || '9999').localeCompare(b.echeance || '9999'));
  const filteredCreditSales = creditSales.filter(s => matches(s, searchCredit));
  const totalCreditRest = creditSales.reduce((a, s) => a + saleRest(s), 0);

  // --- SECTION 3 : HISTORIQUE ---
  const paidSales = sales.filter(s => {
    if (s.status !== 'Payée') return false;
    if (periodFilter === 'today' || periodFilter === 'all') return true;
    return isDateInPeriod(s.date);
  });
  const filteredPaidSales = paidSales.filter(s => matches(s, searchPaid));

  const handleOpenCaisse = (sale = null, credit = false) => {
    setEditSale(sale);
    setStartAsCredit(credit);
    setModalOpen(true);
  };

  const handleSaleComplete = (saleData, docType) => {
    setLastSale(saleData);
    setModalOpen(false);

    if (docType === 'Ticket') {
      setTicketOpen(true);
    } else {
      setInvoiceOpen(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <PageHeader title="Espace Caisse" subtitle="Encaissement, crédits et tickets" />

      {/* BARRE DE FILTRAGE PAR PÉRIODE */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
          <Calendar className="w-4 h-4 text-emerald-600" />
          Période :
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'today', label: "Aujourd'hui" },
            { id: 'week', label: "Cette semaine" },
            { id: 'month', label: "Ce mois" },
            { id: 'all', label: "Tout" }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setPeriodFilter(p.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                periodFilter === p.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6 mt-6">

        {/* SECTION 1 : PROFORMAS À VALIDER */}
        <div className="bg-white rounded-3xl p-6 border border-orange-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-orange-800 flex items-center gap-2">
                <Receipt className="w-4 h-4" /> Proformas à valider ({filteredPendingSales.length})
              </h3>
              <p className="text-[10px] text-orange-700 mt-0.5">Le stock est déduit à la validation (paiement ou crédit)</p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher (Facture, Client...)"
                value={searchPending}
                onChange={(e) => setSearchPending(e.target.value)}
                className="h-9 pl-9 pr-3 w-full sm:w-72 bg-orange-50 border border-orange-100 rounded-lg text-xs outline-none focus:ring-2 focus:ring-orange-300 transition-all text-gray-700"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {filteredPendingSales.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <Receipt className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs">{searchPending || periodFilter !== 'all' ? "Aucun résultat pour ces critères" : "Aucune proforma en attente"}</p>
              </div>
            ) : (
              filteredPendingSales.map(sale => {
                const fidele = isFideleSale(sale);
                const late = clientOverdueCount(sale);
                const canCredit = fidele && late === 0;
                return (
                  <div key={sale.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-orange-50 rounded-xl border border-orange-100 hover:bg-orange-100 transition-colors">
                    <div>
                      <strong className="block text-xs text-orange-900">{sale.number}</strong>
                      <span className="text-[10px] text-orange-700 flex items-center gap-1 flex-wrap">
                        {sale.client}
                        {fidele && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                        — Magasinier: {sale.userName}
                      </span>
                      {fidele && late > 0 && (
                        <span className="text-[10px] font-bold text-red-600">Crédit bloqué : {late} facture(s) en retard</span>
                      )}
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <strong className="block text-sm text-orange-900 mr-1">{formatMoney(saleTotal(sale))}</strong>
                      {fidele && (
                        <button
                          onClick={() => handleOpenCaisse(sale, true)}
                          disabled={!canCredit}
                          title={canCredit ? `Livrer maintenant, paiement sous ${CREDIT_DAYS} jours` : 'Ce client a des factures en retard'}
                          className="px-3 py-1.5 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-lg text-xs font-bold hover:bg-yellow-200 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Crédit {CREDIT_DAYS} j
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenCaisse(sale)}
                        className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-bold hover:bg-orange-600 shadow-sm"
                      >
                        Encaisser
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* SECTION 2 : CRÉDITS À ENCAISSER */}
        <div className="bg-white rounded-3xl p-6 border border-yellow-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-yellow-800 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Crédits à encaisser ({filteredCreditSales.length})
              </h3>
              <p className="text-[10px] text-yellow-700 mt-0.5">
                Marchandise déjà livrée · reste à payer total : <strong>{formatMoney(totalCreditRest)}</strong>
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher (Facture, Client...)"
                value={searchCredit}
                onChange={(e) => setSearchCredit(e.target.value)}
                className="h-9 pl-9 pr-3 w-full sm:w-72 bg-yellow-50 border border-yellow-100 rounded-lg text-xs outline-none focus:ring-2 focus:ring-yellow-300 transition-all text-gray-700"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {filteredCreditSales.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <Clock className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs">{searchCredit ? "Aucun résultat pour ces critères" : "Aucun crédit en cours"}</p>
              </div>
            ) : (
              filteredCreditSales.map(sale => {
                const late = isOverdue(sale);
                return (
                  <div key={sale.id} className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 rounded-xl border transition-colors ${
                    late ? 'bg-red-50 border-red-200 hover:bg-red-100' : 'bg-yellow-50 border-yellow-100 hover:bg-yellow-100'
                  }`}>
                    <div>
                      <strong className="block text-xs text-gray-900">{sale.number}</strong>
                      <span className="text-[10px] text-gray-700">
                        {sale.client} — Total {formatMoney(saleTotal(sale))} · Payé {formatMoney(sale.paid || 0)}
                      </span>
                      <span className={`block text-[10px] font-bold ${late ? 'text-red-600' : 'text-yellow-700'}`}>
                        {sale.echeance ? `Échéance : ${formatDate(sale.echeance)}${late ? ' — EN RETARD' : ''}` : 'Sans échéance'}
                      </span>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <span className="block text-[10px] text-gray-500">Reste à payer</span>
                        <strong className={`block text-sm ${late ? 'text-red-700' : 'text-yellow-800'}`}>{formatMoney(saleRest(sale))}</strong>
                      </div>
                      <button
                        onClick={() => handleOpenCaisse(sale)}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-sm"
                      >
                        Encaisser
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* SECTION 3 : HISTORIQUE DES ENCAISSEMENTS */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" /> Historique des encaissements ({filteredPaidSales.length})
            </h3>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher (Facture, Client, Caissier...)"
                value={searchPaid}
                onChange={(e) => setSearchPaid(e.target.value)}
                className="h-9 pl-9 pr-3 w-full sm:w-72 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-300 transition-all text-gray-700"
              />
            </div>
          </div>

          {filteredPaidSales.length === 0 ? (
            <p className="text-xs text-gray-500 py-4 text-center">
              {searchPaid || periodFilter !== 'all' ? "Aucun résultat pour ces critères" : "Aucune vente encaissée"}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {filteredPaidSales.map(sale => (
                <div key={sale.id} className="flex flex-col justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <strong className="block text-xs text-emerald-700">{sale.number}</strong>
                      <span className="text-[10px] text-gray-500">{formatDate(sale.date)}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">Payée</span>
                  </div>

                  <div className="mb-3">
                    <span className="text-xs font-semibold text-gray-800">{sale.client}</span>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500">
                      <User className="w-3 h-3" /> Encaissé par : {sale.userName || 'Inconnu'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-200 pt-2">
                    <strong className="text-sm text-gray-800">{formatMoney(saleTotal(sale))}</strong>
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setLastSale(sale); setInvoiceOpen(true); }}
                        className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                        title="Voir Facture"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setLastSale(sale); setTicketOpen(true); }}
                        className="p-1.5 bg-purple-50 text-purple-600 rounded hover:bg-purple-100"
                        title="Voir Ticket"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* MODALES */}
      <SaleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        sale={editSale}
        startAsCredit={startAsCredit}
        onSuccess={handleSaleComplete}
      />

      <InvoiceModal
        isOpen={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        sale={lastSale}
      />

      <TicketModal
        isOpen={ticketOpen}
        onClose={() => setTicketOpen(false)}
        sale={lastSale}
      />
    </div>
  );
}