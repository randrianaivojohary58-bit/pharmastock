import { useState, useMemo, useRef } from 'react';
import Modal from './Modal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { formatMoney } from '../../utils/format';
import { parseProductText, normalizeProductRows, downloadTemplate, sheetRowsToText } from '../../utils/importProducts';
import { Download, FileUp } from 'lucide-react';

export default function ImportProductsModal({ isOpen, onClose }) {
  const { products, addProductsBulk } = useData();
  const { showToast } = useToast();
  const fileRef = useRef(null);

  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [fileName, setFileName] = useState('');

  const rows = useMemo(
    () => normalizeProductRows(parseProductText(text), products),
    [text, products]
  );
  const okRows = rows.filter(r => r.status === 'ok');
  const skipRows = rows.filter(r => r.status === 'skip');
  const errorRows = rows.filter(r => r.status === 'error');

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const name = file.name.toLowerCase();
    try {
      if (name.endsWith('.xlsx')) {
        // Fichier Excel : première feuille -> texte (chargé à la demande)
        const { readSheet } = await import('read-excel-file/browser');
        const sheetRows = await readSheet(file);
        setText(sheetRowsToText(sheetRows));
      } else if (name.endsWith('.xls')) {
        showToast('Format non pris en charge', "Ouvrez le fichier dans Excel et enregistrez-le en .xlsx, puis réessayez.", 'error');
        return;
      } else {
        setText(await file.text());
      }
      setFileName(file.name);
    } catch (err) {
      console.error('Erreur lecture fichier:', err);
      showToast('Erreur', "Impossible de lire ce fichier. Vérifiez qu'il s'agit bien d'un fichier Excel (.xlsx) ou CSV.", 'error');
    }
  };

  const handleClose = () => { setText(''); setFileName(''); onClose(); };

  const handleImport = async () => {
    if (!okRows.length) return;
    setSaving(true);
    try {
      const res = await addProductsBulk(okRows.map(r => r.data));
      showToast('Succès', `${res.created} produit(s) importé(s)${res.skipped ? `, ${res.skipped} ignoré(s)` : ''}`);
      setText('');
      setFileName('');
      onClose();
    } catch (err) {
      showToast('Erreur', err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const badge = (status) => {
    if (status === 'ok') return 'bg-emerald-100 text-emerald-700';
    if (status === 'skip') return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  };
  const label = (status) => (status === 'ok' ? 'À importer' : status === 'skip' ? 'Ignoré' : 'Erreur');

  return (
    <Modal
      isOpen={isOpen} onClose={handleClose}
      title="Importer des produits" label="CATALOGUE" maxWidth="max-w-5xl"
      footer={
        <>
          <button onClick={handleClose} className="px-4 py-2 border border-gray-200 rounded-lg text-xs">Annuler</button>
          <button
            onClick={handleImport}
            disabled={!okRows.length || saving}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Import en cours...' : `Importer ${okRows.length} produit(s)`}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-900 space-y-1">
          <p><strong>1.</strong> Remplissez vos produits dans Excel (une ligne par produit), puis <strong>chargez le fichier Excel (.xlsx)</strong> ou <strong>copiez les cellules</strong> et collez-les ci-dessous. Les fichiers CSV marchent aussi.</p>
          <p><strong>2.</strong> Vous pouvez aussi coller seulement une <strong>liste de noms</strong>, un par ligne.</p>
          <p><strong>3.</strong> Colonnes : code (facultatif), nom, type, conditionnement, gamme, tva, prix_achat, prix_vente, prix_grossiste, prix_revendeur, rayon, allee, etagere.</p>
          <p className="text-emerald-700">Seule la première feuille du fichier Excel est lue. Le code est généré automatiquement s'il est vide. Si le prix de vente est vide, il est calculé à partir du prix d'achat avec la marge par défaut. Le stock n'est pas importé : il entre par les achats, avec le lot et la date de péremption.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={downloadTemplate} className="h-9 px-3 bg-white border border-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" /> Télécharger le modèle
          </button>
          <button onClick={() => fileRef.current?.click()} className="h-9 px-3 bg-white border border-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50 flex items-center gap-2">
            <FileUp className="w-4 h-4" /> Charger un fichier Excel ou CSV
          </button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.txt,text/csv" className="hidden" onChange={handleFile} />
          {fileName && <span className="h-9 flex items-center text-xs text-gray-500">Fichier : <strong className="ml-1 text-gray-700">{fileName}</strong></span>}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="Collez ici vos produits copiés depuis Excel..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
        />

        {rows.length > 0 && (
          <>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold">{okRows.length} à importer</span>
              {skipRows.length > 0 && <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-bold">{skipRows.length} ignoré(s)</span>}
              {errorRows.length > 0 && <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 font-bold">{errorRows.length} erreur(s)</span>}
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="max-h-72 overflow-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 text-gray-600 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">Ligne</th>
                      <th className="px-3 py-2 text-left">Code</th>
                      <th className="px-3 py-2 text-left">Nom</th>
                      <th className="px-3 py-2 text-left">Type</th>
                      <th className="px-3 py-2 text-left">Cond.</th>
                      <th className="px-3 py-2 text-left">Gamme</th>
                      <th className="px-3 py-2 text-right">P. achat</th>
                      <th className="px-3 py-2 text-right">P. vente</th>
                      <th className="px-3 py-2 text-left">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(r => (
                      <tr key={r.line} className={`border-t border-gray-100 ${r.status !== 'ok' ? 'bg-gray-50 text-gray-500' : ''}`}>
                        <td className="px-3 py-1.5">{r.line}</td>
                        <td className="px-3 py-1.5 font-mono">{r.data.code || <span className="text-gray-400">auto</span>}</td>
                        <td className="px-3 py-1.5 font-semibold">{r.data.name || '—'}</td>
                        <td className="px-3 py-1.5">{r.data.type}</td>
                        <td className="px-3 py-1.5">{r.data.conditionnement}</td>
                        <td className="px-3 py-1.5">{r.data.category || '—'}</td>
                        <td className="px-3 py-1.5 text-right">{formatMoney(r.data.buyPrice)}</td>
                        <td className="px-3 py-1.5 text-right">{formatMoney(r.data.price)}</td>
                        <td className="px-3 py-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge(r.status)}`}>{label(r.status)}</span>
                          {r.message && <span className="block text-[10px] text-gray-500 mt-0.5">{r.message}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}