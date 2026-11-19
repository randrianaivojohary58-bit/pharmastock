import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Package, Boxes, MapPin, ShoppingCart, DollarSign,
  Users, Building2, Warehouse, ClipboardList, CreditCard, ArrowLeftRight,
  BarChart3, ScrollText, HelpCircle, Settings, X, LogOut, Save
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

export default function Sidebar({ isOpen, onClose }) {
  const { profile, signOut } = useAuth();

  const canSee = (item) => {
    if (!item.roles) return true;
    return item.roles.includes(profile?.roleKey);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />
      )}
      
      <aside className={`w-[270px] bg-[#0a1f1a] text-white fixed top-0 bottom-0 left-0 z-40 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* HEADER AVEC TON LOGO */}
        <div className="h-20 flex items-center px-5 border-b border-white/10">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mr-3 shadow-lg overflow-hidden">
            <img 
              src="/logo.png" 
              alt="Salama Sava" 
              className="w-full h-full object-contain p-1"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <div className="flex flex-col">
            <strong className="text-sm tracking-wider">SALAMA SAVA</strong>
            <span className="text-emerald-300 text-[10px] tracking-widest mt-0.5">PHARMASTOCK</span>
          </div>
          <button onClick={onClose} className="ml-auto lg:hidden text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CARTE UTILISATEUR */}
        <div className="mx-4 mt-4 p-3 bg-[#132f28] border border-emerald-500/20 rounded-xl flex items-center relative">
          
          <div>
            <strong className="text-xs block">{profile?.name || 'Utilisateur'}</strong>
            <span className="text-gray-400 text-[10px]">{profile?.role || 'Admin'}</span>
          </div>
          <span className="w-2 h-2 bg-emerald-400 rounded-full absolute right-3 top-4 shadow-[0_0_0_3px_rgba(52,211,153,0.2)]" />
        </div>

        {/* MENU */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {menuSections.map((section, si) => {
            const visibleItems = section.items.filter(canSee);
            if (visibleItems.length === 0) return null;

            return (
              <div key={si} className="mt-4">
                <span className="block px-3 text-[9px] font-bold tracking-widest text-[#4a6b62] mb-2">
                  {section.title}
                </span>
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 h-11 px-3 rounded-lg my-0.5 text-xs transition-colors ${
                          isActive
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/30'
                            : 'text-gray-400 hover:text-white hover:bg-emerald-500/10'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-white/10 space-y-1">
          <button className="flex items-center gap-2 w-full h-10 px-3 text-gray-400 hover:text-white hover:bg-emerald-500/10 rounded-lg text-xs transition-colors">
            <Save className="w-4 h-4" />
            <span>Sauvegarder</span>
          </button>
          <button
            onClick={signOut}
            className="flex items-center gap-2 w-full h-10 px-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg text-xs transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
}