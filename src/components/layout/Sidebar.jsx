import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../common/ConfirmModal';
import {
  LayoutDashboard, Package, Boxes, MapPin, ShoppingCart, DollarSign,
  Users, Building2, Warehouse, ClipboardList, CreditCard, ArrowLeftRight,
  BarChart3, ScrollText, HelpCircle, Settings, X, LogOut, Save,
  ChevronLeft, ChevronRight
} from 'lucide-react';

const menuSections = [
  {
    title: 'PRINCIPAL',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
      { to: '/produits', icon: Package, label: 'Produits', roles: ['admin', 'magasinier'] },
      { to: '/lots', icon: Boxes, label: 'Lots & Péremption', roles: ['admin', 'magasinier'] },
      { to: '/emplacements', icon: MapPin, label: 'Emplacements', roles: ['admin', 'magasinier'] }
    ]
  },
  {
    title: 'COMMERCE',
    items: [
      { to: '/achats', icon: ShoppingCart, label: 'Achats', roles: ['admin', 'magasinier'] },
      { to: '/ventes', icon: DollarSign, label: 'Ventes', roles: ['admin', 'caissier'] },
      { to: '/clients', icon: Users, label: 'Clients', roles: ['admin', 'caissier'] },
      { to: '/fournisseurs', icon: Building2, label: 'Fournisseurs', roles: ['admin', 'magasinier'] }
    ]
  },
  {
    title: 'STOCK',
    items: [
      { to: '/stock', icon: Warehouse, label: 'Stock & Dépôts' },
      { to: '/inventaires', icon: ClipboardList, label: 'Inventaires', roles: ['admin', 'magasinier'] },
      { to: '/creances', icon: CreditCard, label: 'Créances', roles: ['admin', 'caissier'] },
      { to: '/mouvements', icon: ArrowLeftRight, label: 'Mouvements' }
    ]
  },
  {
    title: 'ADMINISTRATION',
    items: [
      { to: '/rapports', icon: BarChart3, label: 'Rapports', roles: ['admin'] },
      { to: '/journal', icon: ScrollText, label: 'Journal', roles: ['admin'] },
      { to: '/utilisateurs', icon: Users, label: 'Utilisateurs', roles: ['admin'] },
      { to: '/aide', icon: HelpCircle, label: 'Aide' },
      { to: '/parametres', icon: Settings, label: 'Paramètres', roles: ['admin'] }
    ]
  }
];

// On reçoit isCollapsed et setIsCollapsed en props
export default function Sidebar({ isOpen, onClose, isCollapsed, setIsCollapsed }) {
  const { profile, signOut } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const canSee = (item) => {
    if (!item.roles) return true;
    return item.roles.includes(profile?.roleKey);
  };

  const handleLogoutClick = () => setShowLogoutConfirm(true);
  
  const handleConfirmLogout = async () => {
    setShowLogoutConfirm(false);
    await signOut();
  };

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />
      )}
      
      <aside 
        className={`bg-[#0a1f1a] text-white fixed top-0 bottom-0 left-0 z-40 flex flex-col transition-all duration-300 
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
          ${isCollapsed ? 'w-[80px]' : 'w-[270px]'}`}
      >
        
        {/* HEADER */}
        <div className={`h-20 flex items-center border-b border-white/10 ${isCollapsed ? 'justify-center px-0' : 'px-5'}`}>
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mr-3 shadow-lg overflow-hidden shrink-0">
            <img 
              src="/logo.png" 
              alt="Salama Sava" 
              className="w-full h-full object-contain p-1"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          
          {!isCollapsed && (
            <div className="flex flex-col whitespace-nowrap">
              <strong className="text-sm tracking-wider">SALAMA SAVA</strong>
              <span className="text-emerald-300 text-[10px] tracking-widest mt-0.5">PHARMASTOCK</span>
            </div>
          )}
          
          <button onClick={onClose} className="ml-auto lg:hidden text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BOUTON RÉDUIRE (Desktop) */}
        <button 
          onClick={toggleSidebar}
          className="hidden lg:flex absolute -right-3 top-24 w-6 h-6 bg-emerald-500 text-white rounded-full items-center justify-center shadow-md hover:bg-emerald-400 transition-colors z-50 border-2 border-[#0a1f1a]"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* CARTE UTILISATEUR */}
        <div className={`mx-4 mt-4 p-3 bg-[#132f28] border border-emerald-500/20 rounded-xl flex items-center relative ${isCollapsed ? 'justify-center' : ''}`}>
          {!isCollapsed ? (
            <>
              <div className="whitespace-nowrap">
                <strong className="text-xs block">{profile?.name || 'Utilisateur'}</strong>
                <span className="text-gray-400 text-[10px]">{profile?.role || 'Admin'}</span>
              </div>
              <span className="w-2 h-2 bg-emerald-400 rounded-full absolute right-3 top-4 shadow-[0_0_0_3px_rgba(52,211,153,0.2)]" />
            </>
          ) : (
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              {profile?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>

        {/* MENU */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide">
          {menuSections.map((section, si) => {
            const visibleItems = section.items.filter(canSee);
            if (visibleItems.length === 0) return null;

            return (
              <div key={si} className="mt-4">
                {!isCollapsed && (
                  <span className="block px-3 text-[9px] font-bold tracking-widest text-[#4a6b62] mb-2 whitespace-nowrap">
                    {section.title}
                  </span>
                )}
                {isCollapsed && <div className="h-4" />}

                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      title={isCollapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        `flex items-center rounded-lg my-1 transition-all group ${
                          isCollapsed ? 'justify-center h-12 w-12 mx-auto' : 'gap-3 h-11 px-3'
                        } ${
                          isActive
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/30'
                            : 'text-gray-400 hover:text-white hover:bg-emerald-500/10'
                        }`
                      }
                    >
                      <Icon className={`shrink-0 ${isCollapsed ? 'w-6 h-6' : 'w-4 h-4'}`} />
                      {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-white/10 space-y-1">
          <button 
            title={isCollapsed ? "Sauvegarder" : undefined}
            className={`flex items-center w-full rounded-lg text-xs transition-colors text-gray-400 hover:text-white hover:bg-emerald-500/10 ${
              isCollapsed ? 'justify-center h-12 w-12 mx-auto' : 'gap-2 h-10 px-3'
            }`}
          >
            <Save className={`shrink-0 ${isCollapsed ? 'w-6 h-6' : 'w-4 h-4'}`} />
            {!isCollapsed && <span>Sauvegarder</span>}
          </button>
          
          <button
            onClick={handleLogoutClick}
            title={isCollapsed ? "Déconnexion" : undefined}
            className={`flex items-center w-full rounded-lg text-xs transition-colors text-gray-400 hover:text-red-400 hover:bg-red-500/10 ${
              isCollapsed ? 'justify-center h-12 w-12 mx-auto' : 'gap-2 h-10 px-3'
            }`}
          >
            <LogOut className={`shrink-0 ${isCollapsed ? 'w-6 h-6' : 'w-4 h-4'}`} />
            {!isCollapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Déconnexion"
        message="Voulez-vous vraiment vous déconnecter de l'application ?"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}