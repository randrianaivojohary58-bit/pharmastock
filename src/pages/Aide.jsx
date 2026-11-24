import PageHeader from '../components/common/PageHeader';
import { Rocket, ShieldCheck, MapPin, DollarSign, Clock, Headset, MonitorPlay, FileText } from 'lucide-react';

const helpCards = [
  {
    icon: Rocket,
    title: 'Démarrage rapide',
    content: (
      <ol className="list-decimal ml-4 space-y-1 text-xs text-gray-600">
        <li><strong>Configurer les produits</strong> (avec leurs prix de vente, grossiste et revendeur)</li>
        <li><strong>Enregistrer les achats</strong> fournisseurs pour alimenter le stock</li>
        <li><strong>Créer les clients</strong> (en précisant leur type : Pharmacie, Grossiste, Particulier, etc.)</li>
        <li><strong>Vendre via l'Espace Caisse</strong> ou préparer un bon de sortie via le profil Magasinier</li>
        <li><strong>Suivre le stock</strong> et les alertes de péremption (FEFO)</li>
      </ol>
    )
  },
  {
    icon: ShieldCheck,
    title: 'Rôles utilisateurs',
    content: (
      <div className="space-y-2 text-xs text-gray-600">
        <p><strong>Admin / Patron</strong> — Accès total (caisse, ventes, achats, rapports, utilisateurs).</p>
        <p><strong>Magasinier</strong> — Gère le stock, les produits, les achats et prépare les ventes (sans les encaisser).</p>
        <p><strong>Caissier</strong> — Accès à l'Espace Caisse pour encaisser les ventes préparées par le magasinier ou faire des ventes directes.</p>
      </div>
    )
  },
  {
    icon: MonitorPlay,
    title: 'Espace Caisse & Encaissement',
    content: (
      <div className="space-y-2 text-xs text-gray-600">
        <p>Le flux de vente est divisé en deux étapes :</p>
        <ul className="list-disc ml-4 space-y-1">
          <li><strong>Préparation (Magasinier) :</strong> Il crée la vente, mais le paiement est mis "En attente".</li>
          <li><strong>Encaissement (Caissier) :</strong> Il retrouve la vente dans "À encaisser", saisit le montant reçu et valide le paiement.</li>
        </ul>
      </div>
    )
  },
  {
    icon: DollarSign,
    title: 'Ventes & Prix',
    content: (
      <div className="space-y-2 text-xs text-gray-600">
        <p>Le prix s'adapte automatiquement au type de client sélectionné :</p>
        <ul className="list-disc ml-4">
          <li><strong>Prix Grossiste</strong> pour les grossistes.</li>
          <li><strong>Prix Revendeur</strong> pour les pharmacies, cliniques, hôpitaux et revendeurs.</li>
          <li><strong>Prix de vente normal (Détail)</strong> pour les particuliers.</li>
        </ul>
      </div>
    )
  },
  {
    icon: FileText,
    title: 'Impression (Facture / Ticket)',
    content: (
      <div className="space-y-2 text-xs text-gray-600">
        <p>Lors de l'encaissement, vous pouvez choisir le document à imprimer :</p>
        <ul className="list-disc ml-4">
          <li><strong>Facture A4</strong> : Document complet avec en-tête, logo et mentions légales.</li>
          <li><strong>Ticket de caisse 80mm</strong> : Format réduit pour les imprimantes thermiques.</li>
        </ul>
        <p className="mt-2">Vous pouvez réimprimer ces documents à tout moment depuis l'historique de la caisse.</p>
      </div>
    )
  },
  {
    icon: Clock,
    title: 'Alertes automatiques',
    content: (
      <ul className="list-disc ml-4 space-y-1 text-xs text-gray-600">
        <li>Clients fidèles avec échéance proche (≤ 5 jours).</li>
        <li>Produits proches de la péremption (≤ 30 jours).</li>
        <li>Top 5 des produits les plus vendus.</li>
        <li>Chiffre d'affaires du jour, du mois et de l'année.</li>
      </ul>
    )
  },
  {
    icon: MapPin,
    title: 'Gestion des Emplacements',
    content: (
      <div className="space-y-2 text-xs text-gray-600">
        <p>Chaque produit est assigné à un emplacement spécifique (Rayon-Allée-Étagère).</p>
        <p>Utilisez la page <strong>Emplacements</strong> pour organiser vos zones de stockage et faciliter la recherche de produits.</p>
      </div>
    )
  },
  {
    icon: Headset,
    title: 'Support Technique',
    content: (
      <div className="space-y-2 text-xs text-gray-600">
        <p><strong>Contact :</strong> Johary RANDRIANAIVO</p>
        <p><strong>Email :</strong> randrianaivojohary58@gmail.com</p>
        <p><strong>Téléphone :</strong> +261 34 75 513 08</p>
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