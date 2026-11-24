
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Lock, User, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';

export default function Login() {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [shake, setShake] = useState(false);

  const canSubmit = username.trim().length > 0 && password.length > 0 && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(username.trim(), password);
    } catch (err) {
      setError("Identifiants incorrects. Veuillez vérifier votre nom d'utilisateur et votre mot de passe.");
      // Petit effet de secousse pour attirer l'attention sur l'erreur
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyUp = (e) => {
    if (e.getModifierState) {
      setCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-500 flex items-center justify-center p-5">

      <div className={`w-full max-w-4xl min-h-[650px] bg-white rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2 ${shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>

        {/* PARTIE GAUCHE - BRANDING AVEC LOGO */}
        <div className="bg-gradient-to-br from-emerald-900 to-emerald-700 text-white p-12 flex flex-col justify-center items-center text-center">
          <div className="w-40 h-40 mb-8 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Logo Salama Sava"
              className="max-w-full max-h-full object-contain drop-shadow-2xl"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <h1 className="text-4xl font-extrabold tracking-wider mb-3">SALAMA SAVA</h1>
          <p className="text-emerald-200 text-sm tracking-widest">PHARMASTOCK MANAGER</p>

          <div className="mt-10 flex items-center gap-2 text-emerald-200/70 text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Connexion sécurisée</span>
          </div>
        </div>

        {/* PARTIE DROITE - FORMULAIRE */}
        <div className="p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-emerald-800 mb-2">Connexion</h2>
            <p className="text-sm text-gray-500">Entrez vos identifiants pour accéder à votre espace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* CHAMP NOM D'UTILISATEUR */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2 text-gray-700">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Entrez votre identification"
                  required
                  aria-invalid={!!error}
                  aria-describedby={error ? 'login-error' : undefined}
                  className="w-full h-12 pl-12 pr-4 border border-gray-200 rounded-xl text-sm
                             focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* CHAMP MOT DE PASSE AVEC OEIL */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-700">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={handleKeyUp}
                  onKeyDown={handleKeyUp}
                  onBlur={() => setCapsLockOn(false)}
                  placeholder="••••••••"
                  required
                  aria-invalid={!!error}
                  aria-describedby={error ? 'login-error' : (capsLockOn ? 'caps-warning' : undefined)}
                  className="w-full h-12 pl-12 pr-12 border border-gray-200 rounded-xl text-sm
                             focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* AVERTISSEMENT VERROU MAJUSCULES */}
              {capsLockOn && (
                <p id="caps-warning" className="mt-2 text-xs text-amber-600 flex items-center gap-1.5 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Verr Maj est activé
                </p>
              )}
            </div>

            {/* MESSAGE D'ERREUR */}
            {error && (
              <div id="login-error" role="alert"
                   className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">
                  <p className="font-semibold">Échec de la connexion</p>
                  <p className="text-xs text-red-600 mt-1">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-bold
                         flex items-center justify-center gap-2 hover:shadow-lg hover:brightness-105 active:scale-[0.98]
                         transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:active:scale-100 mt-4"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></span>
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

          <p className="mt-8 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Salama Sava — Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
}