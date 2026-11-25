import { getSellPrices, DEFAULT_MARGINS } from './pricing';
import { PRODUCT_TYPES } from './productTypes';

// Les types viennent de la liste du projet (utils/productTypes.js)
export const TYPES = PRODUCT_TYPES;
export const CONDS = ['Chassie (carton)', 'Boîte', 'Flacon', 'Tube', 'Sachet', 'Ampoule', 'Pot', 'Blister', 'Étui'];

// Normalise un texte : sans accents, minuscules, sans espaces ni symboles
const strip = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

// Noms de colonnes acceptés (on tolère plusieurs écritures)
const HEADER_ALIASES = {
  code: 'code', reference: 'code', ref: 'code',
  nom: 'name', name: 'name', produit: 'name', designation: 'name', libelle: 'name',
  type: 'type', forme: 'type',
  conditionnement: 'conditionnement', cond: 'conditionnement',
  gamme: 'category', categorie: 'category', category: 'category', famille: 'category',
  tva: 'tva',
  prixachat: 'buyPrice', achat: 'buyPrice', pa: 'buyPrice',
  prixvente: 'price', vente: 'price', pv: 'price', prixdetail: 'price',
  prixgrossiste: 'priceGrossiste', grossiste: 'priceGrossiste',
  prixrevendeur: 'priceRevendeur', revendeur: 'priceRevendeur',
  rayon: 'rayon', allee: 'allee', etagere: 'etagere'
};

// Ordre des colonnes si le texte collé n'a pas de ligne d'en-tête
const DEFAULT_ORDER = ['code', 'name', 'type', 'conditionnement', 'category', 'tva', 'buyPrice', 'price', 'priceGrossiste', 'priceRevendeur', 'rayon', 'allee', 'etagere'];

// ---------- Lecture du texte (collé depuis Excel ou fichier CSV) ----------
const detectDelimiter = (text) => {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  const first = lines[0] || '';
  const candidates = ['\t', ';', ','].filter(d => first.includes(d));

  // 1. Un séparateur qui donne une ligne d'en-tête reconnue (nom, type, prix_achat...)
  for (const d of candidates) {
    if (first.split(d).some(h => HEADER_ALIASES[strip(h)])) return d;
  }
  // 2. Tabulation : texte copié depuis Excel
  if (first.includes('\t')) return '\t';
  // 3. Séparateur présent le même nombre de fois sur toutes les lignes
  for (const d of candidates) {
    const n = first.split(d).length;
    if (lines.every(l => l.split(d).length === n)) return d;
  }
  // 4. Une seule colonne : simple liste de noms (une virgule dans un nom ne coupe plus la colonne)
  return '\u0000';
};

const parseTable = (text, delim) => {
  const rows = [];
  let row = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; } else inQuotes = false;
      } else cur += c;
    } else if (c === '"') inQuotes = true;
    else if (c === delim) { row.push(cur); cur = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cur); cur = ''; rows.push(row); row = [];
    } else cur += c;
  }
  row.push(cur);
  rows.push(row);
  return rows.filter(r => r.some(v => String(v).trim() !== ''));
};

// "6 000 Ar" -> 6000 ; "2,5" -> 2.5 ; "1.500,50" -> 1500.5
const toNumber = (v) => {
  let s = String(v ?? '').replace(/[^\d,.\-]/g, '');
  if (!s) return 0;
  if (s.includes(',') && s.includes('.')) s = s.replace(/\./g, '').replace(',', '.');
  else s = s.replace(',', '.');
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};

const matchList = (value, list, fallback) => {
  const k = strip(value);
  if (!k) return fallback;
  const exact = list.find(item => strip(item) === k);
  if (exact) return exact;
  if (k.length >= 4) {
    const partial = list.find(item => strip(item).includes(k));
    if (partial) return partial;
  }
  return fallback;
};

// Sans en-tête, on attend "code puis nom". Mais beaucoup de fichiers Excel ont "nom puis code"
// (ex. « ACIVIR CREME 15G » | « 1160 »). On compare le contenu des deux premières colonnes.
const looksLikeName = (v) => /[A-Za-zÀ-ÿ]{3,}/.test(v) && (/\s/.test(v) || v.length > 12);
const looksLikeCode = (v) => v !== '' && !/\s/.test(v) && v.length <= 20 && !looksLikeName(v);

const columnsAreSwapped = (table) => {
  const sample = table.slice(0, 30).filter(r => String(r[0] ?? '').trim() && String(r[1] ?? '').trim());
  if (!sample.length) return false;
  const swapped = sample.filter(r => looksLikeName(String(r[0]).trim()) && looksLikeCode(String(r[1]).trim())).length;
  return swapped / sample.length >= 0.6;
};

// Texte -> lignes brutes { line, raw: { name, type, ... } }
export const parseProductText = (text) => {
  const clean = String(text || '').replace(/^\uFEFF/, '');
  if (!clean.trim()) return [];
  const table = parseTable(clean, detectDelimiter(clean));
  if (!table.length) return [];

  const headerKeys = table[0].map(h => HEADER_ALIASES[strip(h)] || null);
  const hasHeader = headerKeys.some(Boolean);

  let keys;
  if (hasHeader) keys = headerKeys;
  else if (table[0].length === 1) keys = ['name'];          // simple liste de noms
  else keys = DEFAULT_ORDER.slice(0, table[0].length);

  // Sans en-tête : 1re colonne = noms et 2e = codes -> on inverse code / nom
  if (!hasHeader && keys[0] === 'code' && keys[1] === 'name' && columnsAreSwapped(table)) {
    keys = ['name', 'code', ...keys.slice(2)];
  }

  const body = hasHeader ? table.slice(1) : table;
  return body.map((cells, i) => {
    const raw = {};
    keys.forEach((k, idx) => { if (k) raw[k] = String(cells[idx] ?? '').trim(); });
    return { line: i + (hasHeader ? 2 : 1), raw };
  });
};

// Lignes brutes -> produits prêts à importer, avec statut (ok / ignoré / erreur)
export const normalizeProductRows = (parsed, existingProducts) => {
  const seenNames = new Set();
  const seenCodes = new Set();
  const key = (name, cond) => `${strip(name)}|${strip(cond)}`;
  const existingKeys = new Set(existingProducts.map(p => key(p.name, p.conditionnement || '')));
  const existingCodes = new Set(existingProducts.map(p => p.id));

  return parsed.map(({ line, raw }) => {
    const name = (raw.name || '').trim();
    // Type non reconnu -> 'Autre' si la liste le contient, sinon le premier type (signalé dans l'aperçu)
    const typeFallback = TYPES.includes('Autre') ? 'Autre' : TYPES[0];
    const matchedType = matchList(raw.type, TYPES, null);
    const type = matchedType || typeFallback;
    const typeNote = raw.type && !matchedType ? `Type « ${raw.type} » inconnu → ${type}` : '';
    const conditionnement = matchList(raw.conditionnement, CONDS, 'Boîte');
    const code = (raw.code || '').trim();

    const buyPrice = toNumber(raw.buyPrice);
    let price = toNumber(raw.price);
    let priceGrossiste = toNumber(raw.priceGrossiste);
    let priceRevendeur = toNumber(raw.priceRevendeur);
    let autoPrice = false;
    if (buyPrice > 0 && (!price || !priceGrossiste || !priceRevendeur)) {
      const auto = getSellPrices(buyPrice, DEFAULT_MARGINS);
      autoPrice = !price;                       // le prix de vente principal est calculé
      if (!price) price = auto.price;
      if (!priceGrossiste) priceGrossiste = auto.priceGrossiste;
      if (!priceRevendeur) priceRevendeur = auto.priceRevendeur;
    }
    // A défaut, les prix grossiste / revendeur suivent le prix de vente
    if (price && !priceGrossiste) priceGrossiste = price;
    if (price && !priceRevendeur) priceRevendeur = price;

    const tvaRaw = String(raw.tva ?? '').trim();
    const tva = tvaRaw === '' ? 20 : toNumber(tvaRaw);

    const data = {
      code, name, type, conditionnement,
      category: (raw.category || '').trim(),
      tva, buyPrice, price, priceGrossiste, priceRevendeur,
      rayon: (raw.rayon || '').trim(), allee: (raw.allee || '').trim(), etagere: (raw.etagere || '').trim()
    };

    let status = 'ok';
    let message = [typeNote, autoPrice ? 'Prix de vente calculé (marge par défaut)' : ''].filter(Boolean).join(' · ');

    if (!name) { status = 'error'; message = 'Nom manquant'; }
    else if (code && existingCodes.has(code)) { status = 'skip'; message = 'Code déjà existant'; }
    else if (code && seenCodes.has(code)) { status = 'skip'; message = 'Code en double dans la liste'; }
    else if (existingKeys.has(key(name, conditionnement))) { status = 'skip'; message = 'Déjà dans le catalogue'; }
    else if (seenNames.has(key(name, conditionnement))) { status = 'skip'; message = 'Doublon dans la liste'; }

    if (status === 'ok') {
      seenNames.add(key(name, conditionnement));
      if (code) seenCodes.add(code);
    }
    return { line, data, status, message };
  });
};

// Modèle téléchargeable (séparateur ";" + BOM : s'ouvre correctement dans Excel en français)
export const downloadTemplate = () => {
  const lines = [
    'code;nom;type;conditionnement;gamme;tva;prix_achat;prix_vente;prix_grossiste;prix_revendeur;rayon;allee;etagere',
    ';Paracétamol 500 mg;Comprimé;Boîte;Antalgiques;20;2000;2400;2200;2300;A;1;2',
    ';Amoxicilline 1 g;Comprimé;Boîte;Antibiotiques;20;;;;;;;',
    ';Vitamine C injectable;Injectable;Boîte;Vitamines;20;;;;;;;'
  ];
  const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'modele-import-produits.csv';
  a.click();
  URL.revokeObjectURL(url);
};

// Lignes d'une feuille Excel (tableau de tableaux) -> texte à tabulations
export const sheetRowsToText = (rows) =>
  (rows || [])
    .map(r => (r || []).map(c => (c === null || c === undefined ? '' : String(c).replace(/[\t\r\n]+/g, ' '))).join('\t'))
    .join('\n');