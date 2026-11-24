import { useEffect } from 'react';
import { MemoryRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './context/ToastContext';
import MainLayout from './components/layout/MainLayout';
import PublicLayout from './components/layout/PublicLayout';
import RoleGuard from './components/layout/RoleGuard';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Produits from './pages/Produits';
import Lots from './pages/Lots';
import Emplacements from './pages/Emplacements';
import Achats from './pages/Achats';
import Ventes from './pages/Ventes';
import Caisse from './pages/Caisse';
import Clients from './pages/Clients';
import Fournisseurs from './pages/Fournisseurs';
import Stock from './pages/Stock';
import Inventaires from './pages/Inventaires';
import Creances from './pages/Creances';
import Mouvements from './pages/Mouvements';
import Rapports from './pages/Rapports';
import Journal from './pages/Journal';
import Aide from './pages/Aide';
import Parametres from './pages/Parametres';
import Utilisateurs from './pages/Utilisateurs';

// Mémorise la page courante pour la retrouver après un rafraîchissement (F5)
function PersistLocation() {
  const location = useLocation();
  useEffect(() => {
    sessionStorage.setItem('lastRoute', location.pathname);
  }, [location]);
  return null;
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Chargement...</div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/aide" element={<PublicLayout><Aide /></PublicLayout>} />

      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />

        <Route path="dashboard" element={<Dashboard />} />
        <Route path="stock" element={<Stock />} />
        <Route path="mouvements" element={<Mouvements />} />

        {/* Admin + Magasinier */}
        <Route path="produits" element={<RoleGuard roles={['admin', 'magasinier']}><Produits /></RoleGuard>} />
        <Route path="lots" element={<RoleGuard roles={['admin', 'magasinier']}><Lots /></RoleGuard>} />
        <Route path="emplacements" element={<RoleGuard roles={['admin', 'magasinier']}><Emplacements /></RoleGuard>} />
        <Route path="achats" element={<RoleGuard roles={['admin', 'magasinier']}><Achats /></RoleGuard>} />
        <Route path="fournisseurs" element={<RoleGuard roles={['admin', 'magasinier']}><Fournisseurs /></RoleGuard>} />
        <Route path="inventaires" element={<RoleGuard roles={['admin', 'magasinier']}><Inventaires /></RoleGuard>} />

        {/* Ventes : Accessible à tous */}
        <Route path="ventes" element={<RoleGuard roles={['admin', 'magasinier', 'caissier']}><Ventes /></RoleGuard>} />

        {/* Clients : Admin, Magasinier et Caissier */}
        <Route path="clients" element={<RoleGuard roles={['admin', 'magasinier', 'caissier']}><Clients /></RoleGuard>} />

        {/* Caisse : Uniquement Admin et Caissier */}
        <Route path="caisse" element={<RoleGuard roles={['admin', 'caissier']}><Caisse /></RoleGuard>} />

        <Route path="creances" element={<RoleGuard roles={['admin', 'caissier']}><Creances /></RoleGuard>} />

        <Route path="rapports" element={<RoleGuard roles={['admin']}><Rapports /></RoleGuard>} />
        <Route path="journal" element={<RoleGuard roles={['admin']}><Journal /></RoleGuard>} />
        <Route path="parametres" element={<RoleGuard roles={['admin']}><Parametres /></RoleGuard>} />
        <Route path="utilisateurs" element={<RoleGuard roles={['admin']}><Utilisateurs /></RoleGuard>} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function getInitialRoute() {
  try {
    return sessionStorage.getItem('lastRoute') || '/dashboard';
  } catch {
    return '/dashboard';
  }
}

export default function App() {
  return (
    <MemoryRouter initialEntries={[getInitialRoute()]}>
      <PersistLocation />
      <AuthProvider>
        <ToastProvider>
          <DataProvider>
            <AppRoutes />
          </DataProvider>
        </ToastProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}