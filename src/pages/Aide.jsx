import PageHeader from '../components/common/PageHeader';
import { Rocket, ShieldCheck, MapPin, DollarSign, Clock, Headset } from 'lucide-react';

const helpCards = [
  {
    icon: Rocket,
    title: 'Démarrage rapide',
    content: (
      <ol className="list-decimal ml-4 space-y-1 text-xs text-gray-600">
        <li>Créer les produits avec emplacement</li>
        <li>Enregistrer les achats fournisseurs</li>
        <li>Configurer les clients</li>
        <li>Effectuer une vente — FEFO automatique</li>
        <li>Suivre le stock par emplacement</li>
      </ol>
    )
  },
  {
    icon: ShieldCheck,
    title: 'Rôles utilisateurs',
    content: (
      <div className="space-y-2 text-xs text-gray-600">
        <p><strong>Patron</strong> — tous droits + bénéfices</p>
        <p><strong>Magasinier</strong> — stock + inventaire</p>
        <p><strong>Caissier</strong> — facturation uniquement</p>
      </div>
    )
  },
  {
    icon: MapPin,
    title: 'Emplacements',
    content: (
      <div className="space-y-2 text-xs text-gray-600">
        <p>Chaque produit a un emplacement (Rayon-Allée-Étagère).</p>
        <p>Utilisez la page <strong>Emplacements</strong> pour gérer les zones.</p>
      </div>
    )
  },
  {
    icon: DollarSign,
    title: 'Ventes & Prix',
    content: (
      <div className="space-y-2 text-xs text-gray-600">
        <p>Prix fixe par type de client :</p>
        <ul className="list-disc ml-4">
          <li>Pharmacie / Clinique / Hôpital</li>
          <li>Revendeur / Grossiste / Particulier</li>
        </ul>
      </div>
    )
  },
  {
    icon: Clock,
    title: 'Alertes automatiques',
    content: (
      <ul className="list-disc ml-4 space-y-1 text-xs text-gray-600">
        <li>Clients fidèles (échéance ≤ 5 jours)</li>
        <li>Produits à périmer (≤ 30 jours)</li>
        <li>Top 5 produits vendus</li>
        <li>CA jour / mois / année</li>
      </ul>
    )
  },
  {
    icon: Headset,
    title: 'Support',
    content: (
      <div className="space-y-2 text-xs text-gray-600">
        <p><strong>Johary R.</strong></p>
        <p>admin@pharmastock.mg</p>
        <p>+261 34 12 345 67</p>
      </div>
    )
  }
];

export default function Aide() {
  return (
    <div>
      <PageHeader title="Aide & Documentation" subtitle="Guide d'utilisation complet" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {helpCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 border-b border-emerald-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-emerald-800">{card.title}</h3>
              </div>
              <div className="p-5">{card.content}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}