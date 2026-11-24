import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

// Les comptes Supabase Auth utilisent un email technique construit à partir du nom d'utilisateur
const EMAIL_DOMAIN = 'salamasava.app';
// Les espaces deviennent des points : "jean jacques" -> jean.jacques@salamasava.app
const toEmail = (username) =>
  `${username.trim().toLowerCase().replace(/\s+/g, '.')}@${EMAIL_DOMAIN}`;

const ROLE_LABELS = {
  admin: 'Administrateur',
  magasinier: 'Magasinier',
  caissier: 'Caissier',
};

// Charge le profil (rôle, nom) lié au compte Supabase Auth
async function loadProfile(authUser) {
  const { data, error } = await supabase
    .from('profiles')
    .select('username, full_name, role, avatar')
    .eq('auth_id', authUser.id)
    .single();

  if (error || !data) return null;

  return {
    username: data.username,
    name: data.full_name,
    role: ROLE_LABELS[data.role] || 'Caissier',
    roleKey: data.role,
    avatar: data.avatar || (data.full_name || data.username).substring(0, 2).toUpperCase(),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ancien système : on supprime l'utilisateur stocké en clair dans le navigateur
    localStorage.removeItem('pharmastock_user');

    let active = true;

    // Restaure la session existante (Supabase la garde et la renouvelle tout seul)
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      if (data.session) {
        const p = await loadProfile(data.session.user);
        if (!active) return;
        if (p) {
          setUser(p);
          setProfile(p);
        } else {
          await supabase.auth.signOut();
        }
      }
      setLoading(false);
    });

    // Déconnexion détectée (session expirée, autre onglet...)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signIn(username, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: toEmail(username),
      password,
    });

    if (error || !data?.user) {
      throw new Error('Identifiants incorrects');
    }

    const sessionUser = await loadProfile(data.user);
    if (!sessionUser) {
      // Compte Auth sans profil : accès refusé
      await supabase.auth.signOut();
      throw new Error('Identifiants incorrects');
    }

    setUser(sessionUser);
    setProfile(sessionUser);
    return sessionUser;
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    sessionStorage.removeItem('lastRoute'); // revient au dashboard à la prochaine connexion
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);