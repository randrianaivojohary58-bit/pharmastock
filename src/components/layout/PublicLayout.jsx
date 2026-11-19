import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { LogIn } from 'lucide-react';

export default function PublicLayout({ children }) {
  const { user } = useAuth();

  // Si connecté → design normal avec la sidebar
  if (user) {
    return (
      <div className="min-h-screen flex">
        <Sidebar isOpen={false} onClose={() => {}} />
        <div className="flex-1 lg:ml-[270px]">
          <Topbar 
            title="Aide & Documentation" 
            subtitle="Guide d'utilisation" 
            onMenuClick={() => {}} 
            onNewSale={() => {}} 
          />
          <main className="p-6 pb-12">{children}</main>
        </div>
      </div>
    );
  }

  // Si non connecté → header simple
  return (
    <div className="min-h-screen bg-[#f4f9f6]">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
            <span className="text-white font-bold text-xl">℞</span>
          </div>
          <div>
            <strong className="block text-sm">PHARMASTOCK</strong>
            <span className="text-[10px] text-emerald-600 tracking-widest">MANAGER</span>
          </div>
        </div>
        <Link
          to="/login"
          className="h-10 px-4 bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-emerald-700 transition-colors"
        >
          <LogIn className="w-4 h-4" />
          Se connecter
        </Link>
      </header>
      <main className="max-w-6xl mx-auto p-6">{children}</main>
    </div>
  );
}