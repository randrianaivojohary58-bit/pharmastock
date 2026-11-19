import { Menu, Search, Bell, Plus } from 'lucide-react';

export default function Topbar({ title, subtitle, onMenuClick, onNewSale }) {
  return (
    <header className="h-20 bg-white/95 backdrop-blur border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden w-10 h-10 border border-gray-200 bg-white rounded-lg flex items-center justify-center">
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex w-60 h-10 bg-gray-50 border border-gray-200 rounded-lg items-center px-3">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="flex-1 bg-transparent border-0 outline-0 ml-2 text-xs"
          />
        </div>
        <button className="relative w-10 h-10 border border-gray-200 bg-white rounded-lg flex items-center justify-center">
          <Bell className="w-4 h-4 text-gray-600" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        <button
          onClick={onNewSale}
          className="h-10 px-4 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 hover:shadow-lg shadow-emerald-500/25 transition-shadow"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nouvelle vente</span>
        </button>
      </div>
    </header>
  );
}