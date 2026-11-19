import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('pharmastock_user');
    if (saved) {
      const u = JSON.parse(saved);
      setUser(u);
      setProfile(u);
    }
    setLoading(false);
  }, []);

  async function signIn(username, password) {
    // Chercher l'utilisateur dans Supabase
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username.toLowerCase())
      .eq('password', password) // ATTENTION : En production, utilisez un hash (bcrypt)
      .single();

    if (error || !data) {
      throw new Error('Identifiants incorrects');
    }

    // On formatte l'utilisateur pour qu'il corresponde à ce que l'app attend
    const sessionUser = {
      username: data.username,
      name: data.full_name,
      role: data.role === 'admin' ? 'Administrateur' : data.role === 'magasinier' ? 'Magasinier' : 'Caissier',
      roleKey: data.role,
      avatar: data.avatar || data.full_name.substring(0, 2).toUpperCase()
    };

    setUser(sessionUser);
    setProfile(sessionUser);
    localStorage.setItem('pharmastock_user', JSON.stringify(sessionUser));
    return sessionUser;
  }

  async function signOut() {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('pharmastock_user');
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);