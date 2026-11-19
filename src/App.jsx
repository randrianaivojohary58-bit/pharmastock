import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './context/ToastContext';
import MainLayout from './components/layout/MainLayout';
import PublicLayout from './components/layout/PublicLayout';
import RoleGuard from './components/layout/RoleGuard'; // <-- NOUVEAU
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Produits from './pages/Produits';
import Lots from './pages/Lots';
import Emplacements from './pages/Emplacements';
import Achats from './pages/Achats';
import Ventes from './pages/Ventes';
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
      {/* Publiques */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/aide" element={<PublicLayout><Aide /></PublicLayout>} />

      {/* Privées avec MainLayout */}
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        
        {/* Tous les rôles */}
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
     

        {/* Admin + Caissier */}
        <Route path="ventes" element={<RoleGuard roles={['admin', 'caissier']}><Ventes /></RoleGuard>} />
        <Route path="clients" element={<RoleGuard roles={['admin', 'caissier']}><Clients /></RoleGuard>} />
        <Route path="creances" element={<RoleGuard roles={['admin', 'caissier']}><Creances /></RoleGuard>} />

        {/* Admin uniquement */}
        <Route path="rapports" element={<RoleGuard roles={['admin']}><Rapports /></RoleGuard>} />
        <Route path="journal" element={<RoleGuard roles={['admin']}><Journal /></RoleGuard>} />
        <Route path="parametres" element={<RoleGuard roles={['admin']}><Parametres /></RoleGuard>} />
        <Route path="utilisateurs" element={<RoleGuard roles={['admin']}><Utilisateurs /></RoleGuard>} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <DataProvider>
            <AppRoutes />
          </DataProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}