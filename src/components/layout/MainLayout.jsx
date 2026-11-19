import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import SaleModal from '../modals/SaleModal';

const pageInfo = {
  '/dashboard': { title: 'Tableau de bord', subtitle: 'Vue générale de votre activité' },
  '/produits': { title: 'Produits', subtitle: 'Gestion du catalogue pharmaceutique' },
  '/lots': { title: 'Lots & Péremptions', subtitle: 'Suivi FEFO des lots' },
  '/emplacements': { title: 'Emplacements', subtitle: 'Gestion des zones de stockage' },
  '/achats': { title: 'Achats', subtitle: 'Gestion des approvisionnements' },
  '/ventes': { title: 'Ventes', subtitle: 'Historique des ventes' },
  '/clients': { title: 'Clients', subtitle: 'Gestion des clients' },
  '/fournisseurs': { title: 'Fournisseurs', subtitle: 'Gestion des fournisseurs' },
  '/stock': { title: 'Stock & Dépôts', subtitle: 'Vue globale des stocks' },
  '/inventaires': { title: 'Inventaires', subtitle: 'Contrôle physique' },
  '/creances': { title: 'Créances', subtitle: 'Suivi des paiements' },
  '/mouvements': { title: 'Mouvements', subtitle: 'Historique entrées/sorties' },
  '/rapports': { title: 'Rapports', subtitle: 'Analyse de votre activité' },
  '/journal': { title: 'Journal', subtitle: 'Historique des opérations' },
  '/aide': { title: 'Aide', subtitle: 'Guide d\'utilisation' },
  '/parametres': { title: 'Paramètres', subtitle: 'Configuration' }
};

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const location = useLocation();
  const info = pageInfo[location.pathname] || { title: 'Page', subtitle: '' };

  return (
    <div className="min-h-screen flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-[270px]">
        <Topbar
          title={info.title}
          subtitle={info.subtitle}
          onMenuClick={() => setSidebarOpen(true)}
          onNewSale={() => setSaleModalOpen(true)}
        />
        <main className="p-6 pb-12">
          <Outlet />
        </main>
      </div>
      <SaleModal isOpen={saleModalOpen} onClose={() => setSaleModalOpen(false)} />
    </div>
  );
}