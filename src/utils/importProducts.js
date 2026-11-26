import { getSellPrices, DEFAULT_MARGINS } from './pricing';
import { PRODUCT_TYPES } from './productTypes';

// Les types viennent de la liste du projet (utils/productTypes.js)
export const TYPES = PRODUCT_TYPES;
export const CONDS = ['Chassie (carton)', 'Boîte', 'Flacon', 'Tube', 'Sachet', 'Ampoule', 'Pot', 'Blister', 'Étui'];

// Rôles possibles d'une colonne
export const FIELD_OPTIONS = [
  { key: '', label: '— Ignorer —' },
  { key: 'name', label: 'Nom du produit' },
  { key: 'code', label: 'Code' },
  { key: 'type', label: 'Type' },
  { key: 'conditionnement', label: 'Conditionnement' },
  { key: 'category', label: 'Gamme / catégorie' },
  { key: 'tva', label: 'TVA' },
  { key: 'buyPrice', label: "Prix d'achat" },
  { key: 'price', label: 'Prix de vente' },
  { key: 'priceGrossiste', label: 'Prix grossiste' },
  { key: 'priceRevendeur', label: 'Prix revendeur' },
  { key: 'rayon', label: 'Pièce' },
  { key: 'allee', label: 'Équipement' },
  { key: 'etagere', label: 'Niveau' },
  { key: 'casier', label: 'Case' }
];

// Normalise un texte : sans accents, minuscules, sans espaces ni symboles
const strip = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

// Rôle d'une colonne d'après son titre (on tolère plusieurs écritures)
const headerKey = (h) => {
  const k = strip(h);
  if (!k) return null;
  if (k.includes('grossiste')) return 'priceGrossiste';
  if (k.includes('revendeur')) return 'priceRevendeur';
  if (k.includes('achat') || k === 'pa' || k.includes('cout')) return 'buyPrice';
  if (k.includes('vente') || k.includes('prix') || k === 'pv' || k.includes('tarif')) return 'price';
  if (k.includes('code') || k.startsWith('ref')) return 'code';
  if (k.includes('design') || k.includes('libelle') || k.includes('nom') || k.includes('produit') || k.includes('article') || k.includes('medicament')) return 'name';
  if (k.includes('condition') || k === 'cond') return 'conditionnement';
  if (k.includes('gamme') || k.includes('categor') || k.includes('famille')) return 'category';
  if (k.includes('tva')) return 'tva';
  if (k === 'type' || k.includes('forme')) return 'type';
  if (k.includes('piece') || k.includes('rayon')) return 'rayon';
  if (k.includes('equipement') || k.includes('allee')) return 'allee';
  if (k.includes('niveau') || k.includes('etagere')) return 'etagere';
  if (k === 'case' || k.includes('casier')) return 'casier';
  return null;
};

// ---------- Lecture du texte (collé depuis Excel, fichier CSV ou feuille Excel) ----------
const detectDelimiter = (text) => {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  const first = lines[0] || '';
  const candidates = ['\t', ';', ','].filter(d => first.includes(d));

  // 1. Un séparateur qui donne une ligne de titres reconnue
  for (const d of candidates) {
    if (first.split(d).some(h => headerKey(h))) return d;
  }
  // 2. Tabulation : texte copié depuis Excel
  if (first.includes('\t')) return '\t';
  // 3. Séparateur présent le même nombre de fois sur toutes les lignes
  for (const d of candidates) {
    const n = first.split(d).length;
    if (lines.every(l => l.split(d).length === n)) return d;
  }
  // 4. Une seule colonne : simple liste de noms
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
  return rows.filter(r => r.some(v => String(v).trim() !== '')).map(r => r.map(v => String(v).trim()));
};

// Texte -> tableau de cellules
export const readTable = (text) => {
  const clean = String(text || '').replace(/^\uFEFF/, '');
  if (!clean.trim()) return [];
  return parseTable(clean, detectDelimiter(clean));
};

const NUMERIC = /^[\d\s.,]+(ar|mga)?$/i;
const columnStats = (table, col, startRow) => {
  const vals = table.slice(startRow, startRow + 40).map(r => r[col] || '').filter(Boolean);
  if (!vals.length) return { numeric: 0, type: 0, cond: 0 };
  const ratio = (fn) => vals.filter(fn).length / vals.length;
  return {
    numeric: ratio(v => NUMERIC.test(v)),
    type: ratio(v => TYPES.some(t => strip(t) === strip(v))),
    cond: ratio(v => CONDS.some(c => strip(c) === strip(v)))
  };
};

// Devine le rôle de chaque colonne : d'après les titres, sinon d'après le contenu
export const guessMapping = (table) => {
  if (!table.length) return { map: [], hasHeader: false };
  const cols = Math.max(...table.slice(0, 40).map(r => r.length));
  const headerKeys = Array.from({ length: cols }, (_, i) => headerKey(table[0][i]));
  const hasHeader = headerKeys.some(Boolean);

  const map = Array.from({ length: cols }, () => null);
  const used = new Set();
  const assign = (i, key) => { if (key && !used.has(key)) { map[i] = key; used.add(key); } };

  if (hasHeader) headerKeys.forEach((k, i) => assign(i, k));

  const start = hasHeader ? 1 : 0;
  const stats = Array.from({ length: cols }, (_, i) => columnStats(table, i, start));

  // Colonne du nom : la première colonne de texte non encore utilisée
  if (!used.has('name')) {
    const idx = stats.findIndex((s, i) => map[i] === null && s.numeric < 0.5 && s.type < 0.5 && s.cond < 0.5);
    if (idx >= 0) assign(idx, 'name');
  }

  if (!hasHeader) {
    // Sans titres : on reconnaît type, conditionnement et prix d'après le contenu
    stats.forEach((s, i) => {
      if (map[i] !== null) return;
      if (s.type >= 0.5) assign(i, 'type');
      else if (s.cond >= 0.5) assign(i, 'conditionnement');
      else if (s.numeric >= 0.5) assign(i, 'price');   // 1er nombre = prix de vente (modifiable)
    });
  }
  return { map, hasHeader };
};

// Tableau + rôles des colonnes -> lignes brutes
export const rowsFromTable = (table, map, hasHeader) => {
  const body = hasHeader ? table.slice(1) : table;
  return body.map((cells, i) => {
    const raw = {};
    map.forEach((k, idx) => { if (k) raw[k] = String(cells[idx] ?? '').trim(); });
    return { line: i + (hasHeader ? 2 : 1), raw };
  });
};

// Compatibilité : texte -> lignes brutes avec les rôles devinés
export const parseProductText = (text) => {
  const table = readTable(text);
  const { map, hasHeader } = guessMapping(table);
  return rowsFromTable(table, map, hasHeader);
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

// Lignes brutes -> produits prêts à importer, avec statut (ok / ignoré / erreur)
// options.nameAsCode : le nom du produit sert de code quand le code est vide
// options.defaultType : type appliqué quand il est vide ou inconnu
export const normalizeProductRows = (parsed, existingProducts, options = {}) => {
  const seenNames = new Set();
  const seenCodes = new Set();
  const key = (name, cond) => `${strip(name)}|${strip(cond)}`;
  const existingKeys = new Set(existingProducts.map(p => key(p.name, p.conditionnement || '')));
  const existingCodes = new Set(existingProducts.map(p => p.id));
  const typeFallback = options.defaultType || (TYPES.includes('Autre') ? 'Autre' : TYPES[0]);

  return parsed.map(({ line, raw }) => {
    const name = (raw.name || '').replace(/\s+/g, ' ').trim();
    const matchedType = matchList(raw.type, TYPES, null);
    const type = matchedType || typeFallback;
    const typeNote = raw.type && !matchedType ? `Type « ${raw.type} » inconnu → ${type}` : '';
    const conditionnement = matchList(raw.conditionnement, CONDS, 'Boîte');
    let code = (raw.code || '').trim();
    if (!code && options.nameAsCode) code = name;

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
      rayon: (raw.rayon || '').trim(), allee: (raw.allee || '').trim(), etagere: (raw.etagere || '').trim(), casier: (raw.casier || '').trim()
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
    'code;nom;type;conditionnement;gamme;tva;prix_achat;prix_vente;prix_grossiste;prix_revendeur;piece;equipement;niveau;case',
    ';Paracétamol 500 mg;Comprimé;Boîte;Antalgiques;20;2000;2400;2200;2300;Pièce 2;Étagère murale 02;Niveau 03;Case 01',
    ';Amoxicilline 1 g;Comprimé;Boîte;Antibiotiques;20;;;;;;;;;',
    ';Vitamine C injectable;Injectable;Boîte;Vitamines;20;;;;;;;;;'
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