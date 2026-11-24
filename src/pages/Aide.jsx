import { useMemo, useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import {
  Rocket, ShieldCheck, MapPin, DollarSign, Clock, Headset, MonitorPlay, FileText,
  Search, ChevronDown, X, Mail, Phone, HelpCircle, BookOpen,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Données                                                            */
/* ------------------------------------------------------------------ */

const ROLES = [
  { id: 'all', label: 'Tous' },
  { id: 'admin', label: 'Admin' },
  { id: 'magasinier', label: 'Magasinier' },
  { id: 'caissier', label: 'Caissier' },
];

const ROLE_BADGE = {
  admin: 'bg-purple-50 text-purple-700 border-purple-200',
  magasinier: 'bg-sky-50 text-sky-700 border-sky-200',
  caissier: 'bg-amber-50 text-amber-700 border-amber-200',
};

const ALL_ROLES = ['admin', 'magasinier', 'caissier'];

const QUICK_START = [
  { title: 'Produits', text: 'Créez les produits avec leurs prix : détail, revendeur et grossiste.', who: 'Admin, Magasinier' },
  { title: 'Achats', text: 'Enregistrez les achats fournisseurs pour alimenter le stock.', who: 'Admin, Magasinier' },
  { title: 'Clients', text: 'Ajoutez les clients en précisant leur type : pharmacie, grossiste, particulier…', who: 'Tous les rôles' },
  { title: 'Ventes', text: 'Préparez la vente, puis encaissez-la à la caisse.', who: 'Magasinier puis Caissier' },
  { title: 'Suivi', text: 'Surveillez le stock et les alertes de péremption (FEFO).', who: 'Tous les rôles' },
];

const SECTIONS = [
  {
    id: 'roles',
    icon: ShieldCheck,
    title: 'Rôles utilisateurs',
    summary: 'Qui peut faire quoi dans le logiciel.',
    roles: ALL_ROLES,
    keywords: 'admin patron magasinier caissier accès droits permissions menu',
    content: (
      <div className="space-y-3 text-sm text-gray-600">
        <p>
          <strong className="text-gray-800">Admin / Patron</strong> : accès total (caisse, ventes, achats,
          rapports, journal, paramètres, utilisateurs).
        </p>
        <p>
          <strong className="text-gray-800">Magasinier</strong> : gère le stock, les produits, les lots, les
          emplacements, les achats et les inventaires. Il prépare les ventes mais ne les encaisse pas.
        </p>
        <p>
          <strong className="text-gray-800">Caissier</strong> : encaisse les ventes préparées par le magasinier,
          fait des ventes directes et suit les créances.
        </p>
        <p className="text-xs text-gray-500">
          Les pages du menu dépendent de votre rôle. Si une page manque, c'est que votre rôle n'y a pas accès.
        </p>
      </div>
    ),
  },
  {
    id: 'caisse',
    icon: MonitorPlay,
    title: 'Espace Caisse et encaissement',
    summary: 'La vente se fait en deux étapes.',
    roles: ['admin', 'magasinier', 'caissier'],
    keywords: 'caisse encaissement paiement attente à encaisser montant reçu vente préparation',
    content: (
      <div className="space-y-3 text-sm text-gray-600">
        <ol className="space-y-2">
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">1</span>
            <span>
              <strong className="text-gray-800">Préparation (Magasinier)</strong> : il crée la vente. Le paiement
              reste « En attente ».
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">2</span>
            <span>
              <strong className="text-gray-800">Encaissement (Caissier)</strong> : il retrouve la vente dans « À
              encaisser », saisit le montant reçu et valide le paiement.
            </span>
          </li>
        </ol>
        <p className="text-xs text-gray-500">L'Espace Caisse est réservé à l'Admin et au Caissier.</p>
      </div>
    ),
  },
  {
    id: 'prix',
    icon: DollarSign,
    title: 'Ventes et prix',
    summary: 'Le prix change selon le type de client.',
    roles: ALL_ROLES,
    keywords: 'prix grossiste revendeur détail particulier pharmacie clinique hôpital client type tarif',
    content: (
      <div className="space-y-3 text-sm text-gray-600">
        <p>Le prix s'adapte automatiquement au type de client choisi :</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="py-2 pr-4 font-semibold">Type de client</th>
                <th className="py-2 font-semibold">Prix appliqué</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr><td className="py-2 pr-4">Grossiste</td><td className="py-2 font-medium text-gray-800">Prix grossiste</td></tr>
              <tr><td className="py-2 pr-4">Pharmacie, clinique, hôpital, revendeur</td><td className="py-2 font-medium text-gray-800">Prix revendeur</td></tr>
              <tr><td className="py-2 pr-4">Particulier</td><td className="py-2 font-medium text-gray-800">Prix de vente normal (détail)</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
  {
    id: 'impression',
    icon: FileText,
    title: 'Impression : facture et ticket',
    summary: 'Choisissez le document au moment de l\'encaissement.',
    roles: ['admin', 'caissier'],
    keywords: 'impression facture ticket a4 80mm thermique réimprimer historique imprimante',
    content: (
      <div className="space-y-3 text-sm text-gray-600">
        <ul className="list-disc space-y-1 pl-5">
          <li><strong className="text-gray-800">Facture A4</strong> : document complet avec en-tête, logo et mentions légales.</li>
          <li><strong className="text-gray-800">Ticket de caisse 80 mm</strong> : format réduit pour les imprimantes thermiques.</li>
        </ul>
        <p>Vous pouvez réimprimer ces documents à tout moment depuis l'historique de la caisse.</p>
      </div>
    ),
  },
  {
    id: 'creances',
    icon: DollarSign,
    title: 'Créances et clients fidèles',
    summary: 'Suivre ce que les clients doivent encore payer.',
    roles: ['admin', 'caissier'],
    keywords: 'créances dette impayé échéance fidèle paiement différé crédit',
    content: (
      <div className="space-y-3 text-sm text-gray-600">
        <p>
          La page <strong className="text-gray-800">Créances</strong> liste les ventes non soldées. Les clients
          fidèles dont l'échéance approche (5 jours ou moins) apparaissent dans les alertes du tableau de bord.
        </p>
        <p>Enregistrez chaque règlement dès sa réception pour garder les soldes à jour.</p>
      </div>
    ),
  },
  {
    id: 'peremption',
    icon: Clock,
    title: 'Lots, péremption et FEFO',
    summary: 'Les produits qui expirent en premier sortent en premier.',
    roles: ['admin', 'magasinier'],
    keywords: 'lot péremption expiration fefo date alerte 30 jours périmé',
    content: (
      <div className="space-y-3 text-sm text-gray-600">
        <p>
          Chaque achat crée un <strong className="text-gray-800">lot</strong> avec sa date de péremption. Le
          logiciel applique la règle <strong className="text-gray-800">FEFO</strong> (First Expired, First Out) :
          on sort d'abord le lot qui périme le plus tôt.
        </p>
        <p>Les produits à 30 jours ou moins de la péremption sont signalés dans les alertes.</p>
      </div>
    ),
  },
  {
    id: 'inventaires',
    icon: BookOpen,
    title: 'Inventaires et mouvements',
    summary: 'Comparer le stock réel au stock du logiciel.',
    roles: ['admin', 'magasinier'],
    keywords: 'inventaire comptage écart stock mouvements entrée sortie historique traçabilité',
    content: (
      <div className="space-y-3 text-sm text-gray-600">
        <p>
          Utilisez <strong className="text-gray-800">Inventaires</strong> pour compter le stock réel et corriger les
          écarts. Chaque entrée, sortie ou correction est conservée dans la page{' '}
          <strong className="text-gray-800">Mouvements</strong>, ce qui permet de retracer l'origine d'une différence.
        </p>
      </div>
    ),
  },
  {
    id: 'emplacements',
    icon: MapPin,
    title: 'Emplacements de stockage',
    summary: 'Retrouver un produit rapidement.',
    roles: ['admin', 'magasinier'],
    keywords: 'emplacement rayon allée étagère zone rangement',
    content: (
      <div className="space-y-3 text-sm text-gray-600">
        <p>Chaque produit est rangé à un emplacement précis : Rayon, Allée, Étagère.</p>
        <p>Organisez vos zones dans la page <strong className="text-gray-800">Emplacements</strong> pour faciliter la recherche.</p>
      </div>
    ),
  },
  {
    id: 'alertes',
    icon: Clock,
    title: 'Alertes du tableau de bord',
    summary: 'Ce que le tableau de bord surveille pour vous.',
    roles: ALL_ROLES,
    keywords: 'alertes tableau de bord dashboard chiffre affaires top 5 échéance péremption',
    content: (
      <ul className="list-disc space-y-1 pl-5 text-sm text-gray-600">
        <li>Clients fidèles avec échéance proche (5 jours ou moins).</li>
        <li>Produits proches de la péremption (30 jours ou moins).</li>
        <li>Top 5 des produits les plus vendus.</li>
        <li>Chiffre d'affaires du jour, du mois et de l'année.</li>
      </ul>
    ),
  },
];

const FAQ = [
  {
    q: 'Je ne vois pas une page dans le menu.',
    a: 'Le menu dépend de votre rôle. Par exemple, la Caisse est réservée à l\'Admin et au Caissier. Demandez à l\'administrateur de vérifier votre rôle dans la page Utilisateurs.',
  },
  {
    q: 'Une vente reste « En attente ».',
    a: 'C\'est normal : elle a été préparée par le magasinier. Le caissier doit la valider dans « À encaisser » en saisissant le montant reçu.',
  },
  {
    q: 'Le prix proposé n\'est pas celui que j\'attendais.',
    a: 'Le prix dépend du type du client sélectionné. Vérifiez le type du client (grossiste, pharmacie, particulier…) et les prix saisis dans la fiche du produit.',
  },
  {
    q: 'Comment réimprimer une facture ou un ticket ?',
    a: 'Ouvrez l\'historique de la caisse, retrouvez la vente, puis choisissez Facture A4 ou Ticket 80 mm.',
  },
  {
    q: 'Le stock affiché ne correspond pas au stock réel.',
    a: 'Faites un inventaire pour enregistrer l\'écart, puis consultez la page Mouvements pour retrouver l\'origine de la différence.',
  },
];

const GLOSSARY = [
  { term: 'FEFO', def: 'Le lot qui expire en premier est vendu en premier.' },
  { term: 'Lot', def: 'Groupe de produits reçus ensemble, avec la même date de péremption.' },
  { term: 'Créance', def: 'Somme qu\'un client doit encore payer.' },
  { term: 'Bon de sortie', def: 'Document qui prépare une sortie de stock avant l\'encaissement.' },
  { term: 'Inventaire', def: 'Comptage du stock réel pour le comparer à celui du logiciel.' },
  { term: 'Mouvement', def: 'Toute entrée, sortie ou correction de stock.' },
];

/* ------------------------------------------------------------------ */
/*  Composants                                                         */
/* ------------------------------------------------------------------ */

function RoleBadges({ roles }) {
  if (roles.length === ALL_ROLES.length) {
    return (
      <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-600">
        Tous les rôles
      </span>
    );
  }
  return roles.map((r) => (
    <span key={r} className={`rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${ROLE_BADGE[r]}`}>
      {r}
    </span>
  ));
}

function Accordion({ id, icon: Icon, title, summary, roles, open, onToggle, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`aide-${id}`}
        className="flex w-full items-center gap-3 p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-inset"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-gray-800">{title}</span>
          <span className="block truncate text-xs text-gray-500">{summary}</span>
          <span className="mt-1.5 flex flex-wrap gap-1">
            <RoleBadges roles={roles} />
          </span>
        </span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div id={`aide-${id}`} className="border-t border-gray-100 bg-gray-50/60 p-5">
          {children}
        </div>
      )}
    </div>
  );
}

function FaqItem({ q, a, open, onToggle }) {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 py-3 text-left text-sm font-medium text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        {q}
        <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="pb-4 text-sm leading-relaxed text-gray-600">{a}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function Aide() {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('all');
  const [openSections, setOpenSections] = useState(() => new Set(['caisse']));
  const [openFaq, setOpenFaq] = useState(null);

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  const matches = (text) => text.toLowerCase().includes(q);

  const sections = useMemo(
    () =>
      SECTIONS.filter((s) => {
        if (role !== 'all' && !s.roles.includes(role)) return false;
        if (!searching) return true;
        return matches(`${s.title} ${s.summary} ${s.keywords}`);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q, role]
  );

  const faq = useMemo(
    () => (searching ? FAQ.filter((f) => matches(`${f.q} ${f.a}`)) : FAQ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q]
  );

  const glossary = useMemo(
    () => (searching ? GLOSSARY.filter((g) => matches(`${g.term} ${g.def}`)) : GLOSSARY),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q]
  );

  const toggleSection = (id) =>
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const allOpen = sections.length > 0 && sections.every((s) => openSections.has(s.id));
  const toggleAll = () => setOpenSections(allOpen ? new Set() : new Set(sections.map((s) => s.id)));

  const nothingFound = searching && sections.length === 0 && faq.length === 0 && glossary.length === 0;

  return (
    <div className="space-y-8">
      <PageHeader title="Aide & Documentation" subtitle="Guide d'utilisation complet" />

      {/* Recherche et filtre par rôle */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher : facture, péremption, caisse, prix…"
            aria-label="Rechercher dans l'aide"
            className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-12 pr-11 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Effacer la recherche"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">Afficher l'aide pour :</span>
          {ROLES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r.id)}
              aria-pressed={role === r.id}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                role === r.id
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Démarrage rapide (sequence réelle) */}
      {!searching && (
        <section aria-labelledby="demarrage">
          <div className="mb-3 flex items-center gap-2">
            <Rocket className="h-5 w-5 text-emerald-600" />
            <h2 id="demarrage" className="text-lg font-bold text-gray-800">Démarrage rapide</h2>
          </div>
          <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {QUICK_START.map((step, i) => (
              <li key={step.title} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="font-semibold text-gray-800">{step.title}</span>
                </div>
                <p className="text-xs leading-relaxed text-gray-600">{step.text}</p>
                <p className="mt-2 text-[11px] font-medium text-emerald-700">{step.who}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Guides par sujet */}
      {sections.length > 0 && (
        <section aria-labelledby="guides">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="guides" className="text-lg font-bold text-gray-800">
              Guides par sujet
              <span className="ml-2 text-sm font-normal text-gray-400">({sections.length})</span>
            </h2>
            <button
              type="button"
              onClick={toggleAll}
              className="text-xs font-medium text-emerald-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              {allOpen ? 'Tout replier' : 'Tout déplier'}
            </button>
          </div>
          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
            {sections.map((s) => (
              <Accordion
                key={s.id}
                id={s.id}
                icon={s.icon}
                title={s.title}
                summary={s.summary}
                roles={s.roles}
                open={searching || openSections.has(s.id)}
                onToggle={() => toggleSection(s.id)}
              >
                {s.content}
              </Accordion>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {faq.length > 0 && (
        <section aria-labelledby="faq">
          <div className="mb-3 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-emerald-600" />
            <h2 id="faq" className="text-lg font-bold text-gray-800">Questions fréquentes</h2>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white px-5 shadow-sm">
            {faq.map((f, i) => (
              <FaqItem
                key={f.q}
                q={f.q}
                a={f.a}
                open={searching || openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Glossaire */}
      {glossary.length > 0 && (
        <section aria-labelledby="glossaire">
          <div className="mb-3 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-600" />
            <h2 id="glossaire" className="text-lg font-bold text-gray-800">Glossaire</h2>
          </div>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {glossary.map((g) => (
              <div key={g.term} className="rounded-xl border border-gray-200 bg-white p-4">
                <dt className="text-sm font-bold text-emerald-700">{g.term}</dt>
                <dd className="mt-1 text-xs leading-relaxed text-gray-600">{g.def}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Aucun résultat */}
      {nothingFound && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="font-semibold text-gray-800">Aucun résultat pour « {query} »</p>
          <p className="mt-1 text-sm text-gray-500">
            Essayez un autre mot (par exemple « facture » ou « stock »), ou contactez le support ci-dessous.
          </p>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="mt-4 rounded-full bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700"
          >
            Effacer la recherche
          </button>
        </div>
      )}

      {/* Support */}
      <section aria-labelledby="support" className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Headset className="h-5 w-5" />
            </span>
            <div>
              <h2 id="support" className="font-bold text-emerald-900">Besoin d'aide ?</h2>
              <p className="text-sm text-emerald-800">Johary RANDRIANAIVO, support technique</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              href="mailto:randrianaivojohary58@gmail.com"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Mail className="h-4 w-4" />
              Envoyer un email
            </a>
            <a
              href="tel:+261347551308"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              <Phone className="h-4 w-4" />
              +261 34 75 513 08
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}