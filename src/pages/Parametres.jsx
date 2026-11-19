import { useState } from 'react';
import { Building2, Percent, Clock, HandCoins, Boxes, Database } from 'lucide-react';
import { useData } from '../context/DataContext';
import PageHeader from '../components/common/PageHeader';
import ParamModal from '../components/modals/ParamModal';

export default function Parametres() {
  const { settings, setSettings } = useData();
  const [modalType, setModalType] = useState(null);

  const cards = [
    {
      type: 'company', icon: Building2, title: 'Informations entreprise',
      value: `${settings.company.name} • ${settings.company.address}`
    },
    {
      type: 'tva', icon: Percent, title: 'TVA & taxes',
      value: `TVA par défaut : ${settings.tvaRate}%`
    },
    {
      type: 'delay', icon: Clock, title: 'Paiement différé',
      value: `Délai par défaut : ${settings.delayDays} jours`
    },
    {
      type: 'remise', icon: HandCoins, title: 'Remise caisse',
      value: `Remise par défaut : ${settings.remiseRate}%`
    },
    {
      type: 'fefo', icon: Boxes, title: 'Gestion FEFO',
      value: settings.fefoEnabled ? 'Activé' : 'Désactivé'
    }
  ];

  return (
    <div>
      <PageHeader title="Paramètres" subtitle="Configuration du logiciel" />

      <div className="grid grid-cols-1 gap-3">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.type} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold">{card.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{card.value}</p>
              </div>
              <button onClick={() => setModalType(card.type)}
                className="text-xs text-emerald-600 font-semibold hover:underline">
                Modifier
              </button>
            </div>
          );
        })}
      </div>

      <ParamModal isOpen={!!modalType} onClose={() => setModalType(null)} type={modalType} />
    </div>
  );
}