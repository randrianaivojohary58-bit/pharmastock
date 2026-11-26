import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, ShoppingCart, Truck } from 'lucide-react';
import KpiCards from '../components/dashboard/KpiCards';
import SalesTable from '../components/dashboard/SalesTable';
import StockAlerts from '../components/dashboard/StockAlerts';
import FideleAlerts from '../components/dashboard/FideleAlerts';
import PeremptionAlerts from '../components/dashboard/PeremptionAlerts';
import SalesChart from '../components/dashboard/SalesChart';
import TopProducts from '../components/dashboard/TopProducts';
import { isCounted } from '../utils/salesStats';

export default function Dashboard() {
  const { sales, products, clients } = useData();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const userRole = profile?.roleKey || 'caissier';
  const canCash = userRole === 'admin' || userRole === 'caissier';

  // Seules les ventes encaissées (Payée / Partielle) comptent dans le CA, le graphique et le top produits
  const countedSales = sales.filter(isCounted);
  const pendingSales = sales.filter(s => s.status === 'En attente');

  const todayLabel = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="w-full space-y-5 pb-10">

      {/* En-tête simple */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Tableau de bord</h2>
          <p className="text-xs text-gray-500">
            Bonjour {profile?.name?.split(' ')[0] || ''} · <span className="capitalize">{todayLabel}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('/ventes')}
            className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" /> {userRole === 'magasinier' ? 'Nouvelle proforma' : 'Nouvelle vente'}
          </button>
          {canCash && (
            <button
              onClick={() => navigate('/caisse')}
              className="h-9 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold"
            >
              Aller à la caisse
            </button>
          )}
          {(userRole === 'admin' || userRole === 'magasinier') && (
            <>
              <button
                onClick={() => navigate('/achats')}
                className="h-9 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-2"
              >
                <Truck className="w-4 h-4" /> Nouvel achat
              </button>
              <button
                onClick={() => navigate('/produits')}
                className="h-9 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Nouveau produit
              </button>
            </>
          )}
        </div>
      </div>

      {/* Chiffres clés */}
      <KpiCards sales={sales} products={products} />

      {/* Évolution des ventes + top produits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        <div className="lg:col-span-2 flex flex-col">
          <SalesChart sales={countedSales} />
        </div>
        <div className="lg:col-span-1 flex flex-col">
          <TopProducts sales={countedSales} />
        </div>
      </div>

      {/* Dernières ventes + proformas à encaisser */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        <SalesTable
          title="Dernières ventes"
          subtitle="Les 8 plus récentes (proformas incluses)"
          sales={sales}
          limit={8}
          seeAllPath="/ventes"
          seeAllLabel="Toutes les ventes"
        />
        <SalesTable
          title="Proformas à encaisser"
          subtitle={`${pendingSales.length} en attente · stock non déduit`}
          sales={pendingSales}
          limit={8}
          seeAllPath={canCash ? '/caisse' : '/ventes'}
          seeAllLabel={canCash ? 'Aller à la caisse' : 'Voir les ventes'}
          emptyText="Aucune proforma en attente"
        />
      </div>

      {/* Stock + péremption */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        <StockAlerts products={products} />
        <PeremptionAlerts products={products} />
      </div>

      {/* Relances clients */}
      <FideleAlerts sales={sales} clients={clients} />

    </div>
  );
}