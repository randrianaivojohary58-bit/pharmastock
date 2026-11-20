import { useData } from '../context/DataContext';
import KpiCards from '../components/dashboard/KpiCards';
import FideleAlerts from '../components/dashboard/FideleAlerts';
import PeremptionAlerts from '../components/dashboard/PeremptionAlerts';
import SalesChart from '../components/dashboard/SalesChart';
import TopProducts from '../components/dashboard/TopProducts';
import { useAuth } from '../context/AuthContext';
import { Plus, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { sales, products, clients } = useData();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const userRole = profile?.roleKey || 'caissier';

  return (
    // J'ai supprimé "max-w-7xl mx-auto" pour que ça prenne 100% de la largeur
    <div className="w-full space-y-6 pb-10">
      
      {/* 1. EN-TÊTE DE BIENVENUE */}
      <div className="bg-gradient-to-br from-emerald-900 to-emerald-700 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-[10px] font-bold tracking-widest text-emerald-300">TABLEAU DE BORD</span>
          <h2 className="text-2xl md:text-3xl font-bold mt-1">Bonjour {profile?.name?.split(' ')[0]} 👋</h2>
          <p className="text-emerald-100 text-sm mt-2">Voici l'état de votre pharmacie aujourd'hui.</p>
        </div>
        
        {/* BOUTONS D'ACTION RAPIDE AVEC PERMISSIONS */}
        <div className="flex flex-wrap gap-3 relative z-10">
          {(userRole === 'admin' || userRole === 'caissier') && (
            <button 
              onClick={() => navigate('/ventes')} 
              className="h-11 px-5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
            >
              <ShoppingCart className="w-4 h-4" /> Nouvelle vente
            </button>
          )}

          {(userRole === 'admin' || userRole === 'magasinier') && (
            <button 
              onClick={() => navigate('/produits')} 
              className="h-11 px-5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/30"
            >
              <Plus className="w-4 h-4" /> Ajouter produit
            </button>
          )}
        </div>
        
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      </div>

      {/* 2. CARTES KPI (Statistiques) */}
      <KpiCards sales={sales} />

      {/* 3. ZONE DES ALERTES (2 colonnes) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="h-full">
          <FideleAlerts sales={sales} clients={clients} />
        </div>
        <div className="h-full">
          <PeremptionAlerts products={products} />
        </div>
      </div>

      {/* 4. GRAPHIQUE ET TOP PRODUITS (3 colonnes) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 flex flex-col h-full">
          <SalesChart sales={sales} />
        </div>
        <div className="lg:col-span-1 flex flex-col h-full">
          <TopProducts sales={sales} />
        </div>
      </div>
      
    </div>
  );
}