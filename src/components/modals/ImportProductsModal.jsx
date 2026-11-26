import { useState, useMemo, useRef } from 'react';
import Modal from './Modal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { formatMoney } from '../../utils/format';
import {
  readTable, guessMapping, rowsFromTable, normalizeProductRows,
  downloadTemplate, sheetRowsToText, FIELD_OPTIONS, TYPES
} from '../../utils/importProducts';
import { Download, FileUp } from 'lucide-react';

export default function ImportProductsModal({ isOpen, onClose }) {
  const { products, addProductsBulk } = useData();
  const { showToast } = useToast();
  const fileRef = useRef(null);

  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [saving, setSaving] = useState(false);

  // Réglages choisis par l'utilisateur
  const [custom, setCustom] = useState(null);            // { text, map } : rôles modifiés à la main
  const [headerOverride, setHeaderOverride] = useState(null);
  const [nameAsCode, setNameAsCode] = useState(true);
  const [defaultType, setDefaultType] = useState(TYPES.includes('Autre') ? 'Autre' : TYPES[0]);

  const table = useMemo(() => readTable(text), [text]);
  const guessed = useMemo(() => guessMapping(table), [table]);

  const hasHeader = headerOverride ?? guessed.hasHeader;
  const mapping = custom && custom.text === text ? custom.map : guessed.map;
  const hasCodeColumn = mapping.includes('code');

  const setColumnRole = (index, key) => {
    const next = [...mapping];
    // un rôle n'est utilisé que par une seule colonne
    if (key) next.forEach((k, i) => { if (k === key) next[i] = null; });
    next[index] = key || null;
    setCustom({ text, map: next });
  };

  const rows = useMemo(
    () => normalizeProductRows(
      rowsFromTable(table, mapping, hasHeader),
      products,
      { nameAsCode: nameAsCode && !hasCodeColumn, defaultType }
    ),
    [table, mapping, hasHeader, products, nameAsCode, hasCodeColumn, defaultType]
  );
  const okRows = rows.filter(r => r.status === 'ok');
  const skipRows = rows.filter(r => r.status === 'skip');
  const errorRows = rows.filter(r => r.status === 'error');
  const hasName = mapping.includes('name');

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
      setHeaderOverride(null);
      setFileName(file.name);
    } catch (err) {
      console.error('Erreur lecture fichier:', err);
      showToast('Erreur', "Impossible de lire ce fichier. Vérifiez qu'il s'agit bien d'un fichier Excel (.xlsx) ou CSV.", 'error');
    }
  };

  const reset = () => { setText(''); setFileName(''); setCustom(null); setHeaderOverride(null); };
  const handleClose = () => { reset(); onClose(); };

  const handleImport = async () => {
    if (!okRows.length) return;
    setSaving(true);
    try {
      const res = await addProductsBulk(okRows.map(r => r.data));
      showToast('Succès', `${res.created} produit(s) importé(s)${res.skipped ? `, ${res.skipped} ignoré(s)` : ''}`);
      reset();
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

  const dataRows = hasHeader ? table.slice(1) : table;

  return (
    <Modal
      isOpen={isOpen} onClose={handleClose}
      title="Importer des produits" label="CATALOGUE" maxWidth="max-w-5xl"
      footer={
        <>
          <button onClick={handleClose} className="px-4 py-2 border border-gray-200 rounded-lg text-xs">Annuler</button>
          <button
            onClick={handleImport}
            disabled={!okRows.length || saving || !hasName}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Import en cours...' : `Importer ${okRows.length} produit(s)`}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-900 space-y-1">
          <p><strong>1.</strong> Chargez votre fichier Excel (.xlsx) ou CSV, ou collez les cellules copiées depuis Excel. Une ligne par produit.</p>
          <p><strong>2.</strong> Vérifiez le rôle de chaque colonne dans le tableau « Colonnes du fichier » : vous pouvez le changer.</p>
          <p className="text-emerald-700">Le stock n'est pas importé : il entre par les achats, avec le lot et la date de péremption. Seule la première feuille Excel est lue.</p>
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
          rows={4}
          placeholder="Ou collez ici vos produits copiés depuis Excel..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
        />

        {table.length > 0 && (
          <>
            {/* ===== COLONNES DU FICHIER ===== */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
                <strong className="text-xs text-gray-700">Colonnes du fichier</strong>
                <label className="flex items-center gap-2 text-[11px] text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={hasHeader} onChange={(e) => setHeaderOverride(e.target.checked)} />
                  La première ligne contient les titres
                </label>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-white">
                      {mapping.map((k, i) => (
                        <th key={i} className="px-2 py-2 text-left align-top min-w-[150px]">
                          <select
                            value={k || ''}
                            onChange={(e) => setColumnRole(i, e.target.value)}
                            className={`w-full h-8 px-2 border rounded-lg text-xs font-semibold ${
                              k ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-gray-200 text-gray-400'
                            }`}
                          >
                            {FIELD_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                          </select>
                          {hasHeader && <div className="mt-1 text-[10px] text-gray-400 truncate">{table[0][i]}</div>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataRows.slice(0, 4).map((r, ri) => (
                      <tr key={ri} className="border-t border-gray-100 text-gray-600">
                        {mapping.map((_, ci) => <td key={ci} className="px-2 py-1.5 truncate max-w-[220px]">{r[ci] || ''}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {!hasName && (
              <p className="text-xs text-red-600 font-semibold">
                Choisissez la colonne « Nom du produit » pour pouvoir importer.
              </p>
            )}

            {/* ===== OPTIONS ===== */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
              {!hasCodeColumn && (
                <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                  <input type="checkbox" checked={nameAsCode} onChange={(e) => setNameAsCode(e.target.checked)} />
                  Utiliser le <strong>nom du produit comme code</strong> (sinon : PRD-0001, PRD-0002...)
                </label>
              )}
              <label className="flex items-center gap-2 text-gray-700">
                Type par défaut :
                <select value={defaultType} onChange={(e) => setDefaultType(e.target.value)} className="h-8 px-2 border border-gray-200 rounded-lg text-xs">
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </label>
            </div>

            {/* ===== APERÇU ===== */}
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
                      <th className="px-3 py-2 text-left">Produit</th>
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