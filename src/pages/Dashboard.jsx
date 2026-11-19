import { useData } from '../context/DataContext';
import KpiCards from '../components/dashboard/KpiCards';
import FideleAlerts from '../components/dashboard/FideleAlerts';
import PeremptionAlerts from '../components/dashboard/PeremptionAlerts';
import SalesChart from '../components/dashboard/SalesChart';
import TopProducts from '../components/dashboard/TopProducts';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { sales, products, clients } = useData();
  const { profile } = useAuth();

  return (
    <div>
      <div className="bg-gradient-to-br from-emerald-900 to-emerald-700 rounded-3xl p-8 text-white mb-5 shadow-xl">
        <span className="text-[10px] font-bold tracking-widest text-emerald-300">BIENVENUE</span>
        <h2 className="text-2xl font-bold mt-2">Bonjour {profile?.name?.split(' ')[0]} 👋</h2>
        <p className="text-emerald-100 text-sm mt-2">Voici un aperçu de votre activité.</p>
      </div>

      <KpiCards sales={sales} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <FideleAlerts sales={sales} clients={clients} />
        <PeremptionAlerts products={products} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <SalesChart sales={sales} />
        </div>
        <TopProducts sales={sales} />
      </div>
    </div>
  );
}