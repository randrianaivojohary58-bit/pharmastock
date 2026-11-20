import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login() {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // <-- Nouvel état

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(username, password);
    } catch (err) {
      // Message d'erreur sécurisé (on ne précise pas si c'est le nom ou le mot de passe qui est faux)
      setError('Identifiants incorrects. Veuillez vérifier votre nom d\'utilisateur et votre mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-500 flex items-center justify-center p-5">
      
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
        <div className="p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-emerald-800 mb-2">Connexion</h2>
            <p className="text-sm text-gray-500">Entrez vos identifiants pour accéder à votre espace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* CHAMP NOM D'UTILISATEUR */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Nom d'utilisateur</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Entrez votre identification" // <-- Modifié
                  required
                  className="w-full h-12 pl-12 pr-4 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                />
              </div>
            </div>
            
            {/* CHAMP MOT DE PASSE AVEC OEIL */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type={showPassword ? "text" : "password"} // <-- Bascule dynamique
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-12 pl-12 pr-12 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                />
                {/* BOUTON OEIL */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* MESSAGE D'ERREUR AMÉLIORÉ */}
            {error && (
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">
                  <p className="font-semibold">Échec de la connexion</p>
                  <p className="text-xs text-red-600 mt-1">{error}</p>
                </div>
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