import { useState } from 'react';
import { useData } from '../context/DataContext';
import PageHeader from '../components/common/PageHeader';
import SearchBar from '../components/common/SearchBar'; // <-- Ajout de l'import
import { CheckCircle, UserPlus, ShoppingCart, Package, MapPin, Calendar } from 'lucide-react';
import { formatDate } from '../utils/dates';

const iconMap = {
  Vente: ShoppingCart,
  Client: UserPlus,
  Achat: ShoppingCart,
  Produit: Package,
  Lot: Package,
  Emplacement: MapPin,
  Inventaire: CheckCircle,
  Paramètres: Calendar // Optionnel : icône pour les paramètres
};

export default function Journal() {
  const { journal } = useData();
  const [searchTerm, setSearchTerm] = useState(''); // <-- État pour la recherche

  // Filtrer le journal selon la recherche
  const filteredJournal = journal.filter(j => {
    const search = searchTerm.toLowerCase();
    
    // On formate la date pour pouvoir la chercher (ex: "2026-11" ou "21/11")
    const dateStr = formatDate(j.date).toLowerCase();
    
    return (
      (j.title || '').toLowerCase().includes(search) ||
      (j.description || '').toLowerCase().includes(search) ||
      (j.type || '').toLowerCase().includes(search) ||
      dateStr.includes(search)
    );
  });

  return (
    <div>
      <PageHeader title="Journal" subtitle="Historique des opérations" />

      {/* BARRE DE RECHERCHE AJOUTÉE ICI */}
      <div className="mb-4">
        <SearchBar 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Rechercher une opération (date, type, description...)" 
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        {filteredJournal.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-gray-500">Aucune opération trouvée</p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="text-xs text-emerald-600 font-semibold mt-2 hover:underline"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        ) : (
          filteredJournal.map((j, i) => {
            const Icon = iconMap[j.type] || CheckCircle;
            return (
              <div key={i} className="flex gap-4 pb-5 mb-5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors p-2 -mx-2 rounded-lg">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <strong className="block text-sm text-gray-800">{j.title}</strong>
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                      {j.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{j.description}</p>
                  <small className="block text-[10px] text-gray-400 mt-1">{formatDate(j.date)}</small>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}