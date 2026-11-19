import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Lock, User } from 'lucide-react';

export default function Login() {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(username, password);
    } catch (err) {
      setError(err.message || 'Identifiants incorrects. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-500 flex items-center justify-center p-5">
      
      {/* On ajoute min-h-[650px] pour forcer le conteneur à être plus haut */}
      <div className="w-full max-w-4xl min-h-[650px] bg-white rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2">
        
        {/* PARTIE GAUCHE - BRANDING AVEC LOGO */}
        <div className="bg-gradient-to-br from-emerald-900 to-emerald-700 text-white p-12 flex flex-col justify-center items-center text-center">
          <div className="w-40 h-40 mb-8 flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="Logo Salama Sava" 
              className="max-w-full max-h-full object-contain drop-shadow-2xl" 
            />
          </div>
          <h1 className="text-4xl font-extrabold tracking-wider mb-3">SALAMA SAVA</h1>
          <p className="text-emerald-200 text-sm tracking-widest">PHARMASTOCK MANAGER</p>
        </div>

        {/* PARTIE DROITE - FORMULAIRE */}
        {/* p-12 et justify-between pour répartir le contenu sur toute la hauteur */}
        <div className="p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-emerald-800 mb-2">Connexion</h2>
            <p className="text-sm text-gray-500">Entrez vos identifiants pour accéder à votre espace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Nom d'utilisateur</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex: admin"
                  required
                  className="w-full h-12 pl-12 pr-4 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-12 pl-12 pr-4 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Connexion...
                </span>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Se connecter
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}