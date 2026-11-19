import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RoleGuard({ children, roles }) {
  const { profile, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  // Si aucun rôle n'est spécifié, tout le monde passe
  if (!roles) return children;

  // Vérifier si le rôle actuel est dans la liste autorisée
  const hasAccess = profile && roles.includes(profile.roleKey);

  if (!hasAccess) {
    // Si pas d'accès, on redirige vers le dashboard
    // (avec un petit message d'erreur si on veut)
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}