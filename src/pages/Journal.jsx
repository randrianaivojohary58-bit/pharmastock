import { useData } from '../context/DataContext';
import PageHeader from '../components/common/PageHeader';
import { CheckCircle, UserPlus, ShoppingCart, Package, MapPin } from 'lucide-react';
import { formatDate } from '../utils/dates';

const iconMap = {
  Vente: ShoppingCart,
  Client: UserPlus,
  Achat: ShoppingCart,
  Produit: Package,
  Lot: Package,
  Emplacement: MapPin,
  Inventaire: CheckCircle
};

export default function Journal() {
  const { journal } = useData();

  return (
    <div>
      <PageHeader title="Journal" subtitle="Historique des opérations" />

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        {journal.length === 0 ? (
          <p className="text-center text-xs text-gray-500 py-8">Aucune opération enregistrée</p>
        ) : (
          journal.map((j, i) => {
            const Icon = iconMap[j.type] || CheckCircle;
            return (
              <div key={i} className="flex gap-4 pb-5 mb-5 border-b border-gray-100 last:border-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-sm">{j.title}</strong>
                  <p className="text-xs text-gray-600 mt-1">{j.description}</p>
                  <small className="block text-[10px] text-gray-400 mt-1">{formatDate(j.date)}</small>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}