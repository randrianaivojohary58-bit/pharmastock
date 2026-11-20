import { Menu } from 'lucide-react';

export default function Topbar({ onMenuClick }) {
  return (
    // J'ai remplacé "h-20" par "h-10" (40px) et réduit le padding vertical
    <header className="h-10 flex items-center justify-start px-6 sticky top-0 z-20 pointer-events-none">
      
      <div className="flex items-center gap-4 pointer-events-auto">
        {/* Bouton menu pour mobile - j'ai légèrement réduit sa taille pour qu'il rentre dans 40px */}
        <button 
          onClick={onMenuClick} 
          className="lg:hidden w-8 h-8 border border-gray-200 bg-white rounded-lg flex items-center justify-center shadow-sm"
        >
          <Menu className="w-4 h-4 text-gray-600" />
        </button>
      </div>

    </header>
  );
}