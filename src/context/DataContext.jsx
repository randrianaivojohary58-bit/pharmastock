import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { getSupplierMargins, getSellPrices, getProductsOfSupplier } from '../utils/pricing';

const DataContext = createContext({});

// ==========================================
// HELPERS DE MAPPING (factorisés pour réutilisation)
// ==========================================
const mapProductRow = (p) => ({
  ...p,
  buyPrice: p.prix_achat,
  price: p.prix_vente,
  priceGrossiste: p.prix_grossiste || p.prix_vente,
  priceRevendeur: p.prix_revendeur || p.prix_vente,
  name: p.nom,
  rayon: p.emplacement?.rayon || '',
  allee: p.emplacement?.allee || '',
  etagere: p.emplacement?.etagere || '',
  lots: (p.lots || []).map(l => ({
    id: l.numero_lot,
    expiry: l.date_expiration,
    stock: l.quantite,
    _db_id: l.id
  }))
});

const mapSaleRow = (s) => ({
  id: s.id,
  number: s.numero_facture,
  date: s.date_vente,
  client: s.client?.nom,
  clientType: s.client?.type,
  clientId: s.client_id,
  payment: s.type_paiement,
  status: s.statut,
  paid: s.montant_paye,
  echeance: s.echeance,
  remiseRate: Number(s.remise) || 0,
  userName: s.user_name,
  stockDeduit: s.stock_deduit === true,
  products: (s.lignes || []).map(l => ({
    productId: l.produit_id,
    name: l.produit?.nom,
    lot: l.lot_id,
    quantity: l.quantite,
    price: l.prix_unitaire,
    tva: l.tva
  }))
});

export function DataProvider({ children }) {
  const { profile } = useAuth();

  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [journal, setJournal] = useState([]);
  const [locations, setLocations] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState({
    company: {
      name: 'SALAMA SAVA',
      address: 'Antananarivo',
      nif: '123 456 789',
      stat: '98765',
      bank: 'BMOI',
      phone: '+261 34',
      email: 'contact@salama.mg'
    },
    tvaRate: 20,
    delayDays: 15,
    remiseRate: 0,
    fefoEnabled: true
  });

  // ==========================================
  // CHARGEMENT INITIAL
  // ==========================================
  useEffect(() => {
    async function loadAllData() {
      setLoading(true);
      try {
        const { data: settingsData } = await supabase
          .from('settings').select('data').eq('id', 1).single();
        if (settingsData?.data) setSettings(settingsData.data);

        const { data: locData } = await supabase.from('emplacements').select('*');
        if (locData) setLocations(locData);

        const { data: prodData } = await supabase
          .from('produits').select('*, lots(*), emplacement:emplacements(*)');
        if (prodData) setProducts(prodData.map(mapProductRow));

        const { data: clientData } = await supabase.from('clients').select('*');
        if (clientData) {
          setClients(clientData.map(c => ({ ...c, name: c.nom, status: c.statut })));
        }

        const { data: supData } = await supabase.from('fournisseurs').select('*');
        if (supData) {
          setSuppliers(supData.map(s => ({
            ...s,
            name: s.nom,
            status: s.statut,
            phone: s.telephone,
            country: s.pays,
            margin: s.marge ?? 20,
            marginRevendeur: s.marge_revendeur ?? 15,
            marginGrossiste: s.marge_grossiste ?? 10
          })));
        }

        const { data: saleData } = await supabase
          .from('ventes')
          .select('*, client:clients(nom, type), lignes:lignes_vente(*, produit:produits(nom))')
          .order('date_vente', { ascending: false });
        if (saleData) setSales(saleData.map(mapSaleRow));

        const { data: purData } = await supabase
          .from('achats')
          .select('*, fournisseur:fournisseurs(nom), lignes:lignes_achat(*, produit:produits(nom))')
          .order('date_achat', { ascending: false });
        if (purData) {
          setPurchases(purData.map(p => ({
            id: p.id,
            number: p.numero_facture,
            date: p.date_achat,
            supplier: p.fournisseur?.nom,
        supplierId: p.fournisseur_id,
            tvaRate: p.taux_tva,
            remiseRate: p.remise,
            status: p.statut,
            userName: p.user_name,
            products: p.lignes.map(l => ({
              productId: l.produit_id,
              name: l.produit?.nom,
              quantity: l.quantite,
              price: l.prix_unitaire,
              expiry: l.date_expiration
            }))
          })));
        }

        const { data: invData } = await supabase
          .from('inventaires')
          .select('*, produit:produits(nom)')
          .order('date_inventaire', { ascending: false });
        if (invData) setInventories(invData);

        const { data: jData } = await supabase
          .from('journal')
          .select('*')
          .order('date_action', { ascending: false })
          .limit(50);
        if (jData) {
          setJournal(jData.map(j => ({
            id: j.id,
            date: j.date_action,
            type: j.type,
            title: j.titre,
            description: j.description
          })));
        }
      } catch (error) {
        console.error('Erreur de chargement:', error);
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, []);

  // ==========================================
  // HELPERS INTERNES
  // ==========================================
  const reloadProducts = async () => {
    const { data } = await supabase
      .from('produits').select('*, lots(*), emplacement:emplacements(*)');
    if (data) setProducts(data.map(mapProductRow));
  };

  const reloadSales = async () => {
    const { data } = await supabase
      .from('ventes')
      .select('*, client:clients(nom, type), lignes:lignes_vente(*, produit:produits(nom))')
      .order('date_vente', { ascending: false });
    if (data) setSales(data.map(mapSaleRow));
  };

  /**
   * Déduit le stock des lots pour une liste de lignes de vente.
   * Utilise FEFO (First Expired First Out).
   */
  const deductStockForLines = async (lignes) => {
    for (const ligne of lignes) {
      let remainingQty = ligne.quantite;

      const { data: lotsDb, error: lotsErr } = await supabase
        .from('lots')
        .select('*')
        .eq('produit_id', ligne.produit_id)
        .order('date_expiration', { ascending: true });
      if (lotsErr) throw lotsErr;

      const orderedLots = ligne.lot_id
        ? [
            ...(lotsDb || []).filter(l => l.id === ligne.lot_id),
            ...(lotsDb || []).filter(l => l.id !== ligne.lot_id)
          ]
        : (lotsDb || []);

      for (const lot of orderedLots) {
        if (remainingQty <= 0) break;
        if (lot.quantite <= 0) continue;

        const deduct = Math.min(lot.quantite, remainingQty);
        const newQty = lot.quantite - deduct;

        const { error: updErr } = await supabase
          .from('lots')
          .update({ quantite: newQty })
          .eq('id', lot.id);
        if (updErr) throw updErr;

        remainingQty -= deduct;
      }

      // Recalcul du stock total du produit
      const { data: lotsAfter } = await supabase
        .from('lots')
        .select('quantite')
        .eq('produit_id', ligne.produit_id);
      const totalStock = (lotsAfter || []).reduce((s, l) => s + (l.quantite || 0), 0);

      await supabase
        .from('produits')
        .update({ stock: totalStock })
        .eq('id', ligne.produit_id);
    }
  };

  /**
   * Restitue le stock des lots pour une liste de lignes de vente.
   * Si ligne.lot_id est défini, on remet dans ce lot précis.
   * Sinon, on remet dans le premier lot du produit.
   */
  const restoreStockForLines = async (lignes) => {
    for (const ligne of lignes) {
      if (ligne.lot_id) {
        const { data: lot } = await supabase
          .from('lots')
          .select('*')
          .eq('id', ligne.lot_id)
          .maybeSingle();
        if (lot) {
          await supabase
            .from('lots')
            .update({ quantite: (lot.quantite || 0) + ligne.quantite })
            .eq('id', lot.id);
        }
      } else {
        const { data: lots } = await supabase
          .from('lots')
          .select('*')
          .eq('produit_id', ligne.produit_id)
          .order('date_expiration', { ascending: true });
        if (lots && lots.length > 0) {
          await supabase
            .from('lots')
            .update({ quantite: (lots[0].quantite || 0) + ligne.quantite })
            .eq('id', lots[0].id);
        }
      }

      const { data: lotsAfter } = await supabase
        .from('lots')
        .select('quantite')
        .eq('produit_id', ligne.produit_id);
      const totalStock = (lotsAfter || []).reduce((s, l) => s + (l.quantite || 0), 0);

      await supabase
        .from('produits')
        .update({ stock: totalStock })
        .eq('id', ligne.produit_id);
    }
  };

  // ==========================================
  // JOURNAL
  // ==========================================
  const logJournal = async (type, title, description) => {
    setJournal(prev => [
      { id: Date.now(), date: new Date().toISOString(), type, title, description },
      ...prev
    ]);
    await supabase.from('journal').insert([{ type, titre: title, description }]);
  };

  // ==========================================
  // PARAMÈTRES
  // ==========================================
  const updateSettings = async (newSettings) => {
    setSettings(newSettings);
    try {
      const { error } = await supabase.from('settings').upsert({
        id: 1, data: newSettings, updated_at: new Date().toISOString()
      });
      if (error) throw error;
      logJournal('Paramètres', 'Paramètres modifiés', 'Configuration mise à jour');
      return { success: true };
    } catch (error) {
      console.error('Erreur sauvegarde paramètres:', error);
      return { success: false, error };
    }
  };

  // ==========================================
  // EMPLACEMENTS
  // ==========================================
  const getOrCreateLocation = async (rayon, allee, etagere) => {
    if (!rayon && !allee && !etagere) return null;
    const existingLoc = locations.find(
      l => l.rayon === rayon && l.allee === allee && l.etagere === etagere
    );
    if (existingLoc) return existingLoc.id;
    const { data: newLoc, error } = await supabase
      .from('emplacements')
      .insert([{ rayon: rayon || '', allee: allee || '', etagere: etagere || '' }])
      .select()
      .single();
    if (!error && newLoc) {
      setLocations(prev => [...prev, newLoc]);
      return newLoc.id;
    }
    return null;
  };

  // ==========================================
  // PRODUITS
  // ==========================================
  const addProduct = async (data) => {
    try {
      const existingProduct = products.find(p => p.id === data.code);

      if (existingProduct) {
        if (!data.expiry || data.stock <= 0) {
          throw new Error(
            "Veuillez saisir une date de péremption et une quantité supérieure à 0 pour ajouter un lot."
          );
        }

        const { data: newLot, error: lotError } = await supabase
          .from('lots')
          .insert([{
            produit_id: existingProduct.id,
            numero_lot: `LOT-${data.code}-${Date.now()}`,
            quantite: data.stock,
            date_expiration: data.expiry
          }])
          .select()
          .single();
        if (lotError) throw lotError;

        const newTotalStock = (existingProduct.stock || 0) + data.stock;
        const { error: prodError } = await supabase
          .from('produits')
          .update({ stock: newTotalStock })
          .eq('id', existingProduct.id);
        if (prodError) throw prodError;

        const updatedProduct = {
          ...existingProduct,
          stock: newTotalStock,
          lots: [
            ...existingProduct.lots,
            {
              id: newLot.numero_lot,
              expiry: newLot.date_expiration,
              stock: newLot.quantite,
              _db_id: newLot.id
            }
          ]
        };

        setProducts(prev => prev.map(p => p.id === existingProduct.id ? updatedProduct : p));

        logJournal('Lot', 'Nouveau lot ajouté', `${data.name} - Lot ${newLot.numero_lot}`);
        
        return updatedProduct;
      } else {
        const emplacementId = await getOrCreateLocation(data.rayon, data.allee, data.etagere);

        const { data: newDb, error } = await supabase
          .from('produits')
          .insert([{
            id: data.code,
            nom: data.name,
            type: data.type,
            conditionnement: data.conditionnement,
            categorie: data.category,
            tva: data.tva,
            prix_achat: data.buyPrice,
            prix_vente: data.price,
            prix_grossiste: data.priceGrossiste,
            prix_revendeur: data.priceRevendeur,
            stock: data.stock,
            emplacement_id: emplacementId
          }])
          .select()
          .single();
        if (error) throw error;

        let initialLots = [];
        if (data.expiry && data.stock > 0) {
          const { data: newLot } = await supabase
            .from('lots')
            .insert([{
              produit_id: newDb.id,
              numero_lot: `LOT-${data.code}-${Date.now()}`,
              quantite: data.stock,
              date_expiration: data.expiry
            }])
            .select()
            .single();
          if (newLot) {
            initialLots = [{
              id: newLot.numero_lot,
              expiry: newLot.date_expiration,
              stock: newLot.quantite,
              _db_id: newLot.id
            }];
          }
        }

        const createdProduct = { ...data, id: newDb.id, emplacement_id: emplacementId, lots: initialLots };
        setProducts(prev => [...prev, createdProduct]);
        
        logJournal('Produit', 'Nouveau produit', data.name);
        
        return createdProduct;
      }
    } catch (error) {
      console.error('Erreur addProduct:', error);
      throw error;
    }
  };

  const updateProduct = async (id, data) => {
    try {
      const emplacementId = await getOrCreateLocation(data.rayon, data.allee, data.etagere);
      const { error } = await supabase
        .from('produits')
        .update({
          nom: data.name,
          type: data.type,
          conditionnement: data.conditionnement,
          categorie: data.category,
          tva: data.tva,
          prix_achat: data.buyPrice,
          prix_vente: data.price,
          prix_grossiste: data.priceGrossiste,
          prix_revendeur: data.priceRevendeur,
          stock: data.stock,
          emplacement_id: emplacementId
        })
        .eq('id', id);
      if (error) throw error;
      setProducts(prev => prev.map(p =>
        p.id === id ? { ...p, ...data, emplacement_id: emplacementId } : p
      ));
      logJournal('Produit', 'Produit modifié', data.name);
    } catch (error) {
      console.error('Erreur updateProduct:', error);
      throw error;
    }
  };

  const updateProductPrices = async (id, prices) => {
    const { error } = await supabase
      .from('produits')
      .update({
        prix_achat: prices.buyPrice,
        prix_vente: prices.price,
        prix_grossiste: prices.priceGrossiste,
        prix_revendeur: prices.priceRevendeur
      })
      .eq('id', id);
    if (error) throw error;
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...prices } : p));
  };

  const deleteProduct = async (id) => {
    const { error } = await supabase.from('produits').delete().eq('id', id);
    if (!error) {
      setProducts(prev => prev.filter(p => p.id !== id));
      logJournal('Produit', 'Produit supprimé', id);
    }
  };

  // ==========================================
  // CLIENTS
  // ==========================================
  const addClient = async (data) => {
    const { data: newDb, error } = await supabase
      .from('clients')
      .insert([{
        nom: data.name,
        type: data.type,
        telephone: data.phone,
        adresse: data.address,
        email: data.email,
        nif: data.nif,
        fidele: data.fidele,
        statut: 'Actif'
      }])
      .select()
      .single();
    if (!error && newDb) {
      setClients(prev => [...prev, { ...data, id: newDb.id, status: 'Actif' }]);
      logJournal('Client', 'Nouveau client', data.name);
    }
  };

  const updateClient = async (id, data) => {
    const { error } = await supabase
      .from('clients')
      .update({
        nom: data.name,
        type: data.type,
        telephone: data.phone,
        adresse: data.address,
        email: data.email,
        nif: data.nif,
        fidele: data.fidele
      })
      .eq('id', id);
    if (!error) {
      setClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
      logJournal('Client', 'Client modifié', data.name);
    }
  };

  const deleteClient = async (id) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (!error) {
      setClients(prev => prev.filter(c => c.id !== id));
      logJournal('Client', 'Client supprimé', id);
    }
  };

  // ==========================================
  // FOURNISSEURS
  // ==========================================
  const addSupplier = async (data) => {
    const { data: newDb, error } = await supabase
      .from('fournisseurs')
      .insert([{
        nom: data.name,
        type: data.type,
        telephone: data.phone,
        pays: data.country,
        email: data.email,
        nif: data.nif,
        stat: data.stat,
        marge: Number(data.margin) || 0,
        marge_revendeur: Number(data.marginRevendeur) || 0,
        marge_grossiste: Number(data.marginGrossiste) || 0,
        statut: 'Actif'
      }])
      .select()
      .single();
    if (error) throw error;
    if (newDb) {
      setSuppliers(prev => [...prev, { ...data, id: newDb.id, status: 'Actif' }]);
    }
  };

  /**
   * Mise à jour d'un fournisseur.
   * options.applyToProducts = true : recalcule automatiquement les prix de vente
   * des produits de ce fournisseur avec ses nouvelles marges (prix d'achat inchangé).
   * Retourne { updatedProducts } = nombre de produits mis à jour.
   */
  const updateSupplier = async (id, data, options = {}) => {
    const { error } = await supabase
      .from('fournisseurs')
      .update({
        nom: data.name,
        type: data.type,
        telephone: data.phone,
        pays: data.country,
        email: data.email,
        nif: data.nif,
        stat: data.stat,
        marge: Number(data.margin) || 0,
        marge_revendeur: Number(data.marginRevendeur) || 0,
        marge_grossiste: Number(data.marginGrossiste) || 0
      })
      .eq('id', id);
    if (error) throw error;
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));

    let updatedProducts = 0;
    if (options.applyToProducts) {
      const margins = getSupplierMargins(data);
      const affected = getProductsOfSupplier(id, purchases, products)
        .filter(p => (Number(p.buyPrice) || 0) > 0);

      const results = await Promise.all(affected.map(p => {
        const prices = getSellPrices(p.buyPrice, margins);
        return supabase
          .from('produits')
          .update({
            prix_vente: prices.price,
            prix_grossiste: prices.priceGrossiste,
            prix_revendeur: prices.priceRevendeur
          })
          .eq('id', p.id);
      }));
      const failed = results.find(r => r.error);
      if (failed) throw failed.error;

      setProducts(prev => prev.map(p => {
        const hit = affected.find(a => a.id === p.id);
        return hit ? { ...p, ...getSellPrices(hit.buyPrice, margins) } : p;
      }));
      updatedProducts = affected.length;
      logJournal('Fournisseur', 'Marges appliquées', `${data.name} : ${updatedProducts} produit(s) mis à jour`);
    }
    return { updatedProducts };
  };

  const deleteSupplier = async (id) => {
    const { error } = await supabase.from('fournisseurs').delete().eq('id', id);
    if (!error) setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  // ==========================================
  // EMPLACEMENTS (CRUD)
  // ==========================================
  const addLocation = async (data) => {
    const { data: newDb, error } = await supabase
      .from('emplacements')
      .insert([{
        rayon: data.rayon,
        allee: data.allee,
        etagere: data.etagere,
        description: data.description
      }])
      .select()
      .single();
    if (!error && newDb) {
      setLocations(prev => [...prev, newDb]);
      logJournal('Emplacement', 'Nouvel emplacement', `${data.rayon}-${data.allee}-${data.etagere}`);
    }
  };

  const updateLocation = async (id, data) => {
    const { error } = await supabase
      .from('emplacements')
      .update({
        rayon: data.rayon,
        allee: data.allee,
        etagere: data.etagere,
        description: data.description
      })
      .eq('id', id);
    if (!error) {
      setLocations(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
      logJournal('Emplacement', 'Emplacement modifié', `${data.rayon}-${data.allee}-${data.etagere}`);
    }
  };

  const deleteLocation = async (id) => {
    const { error } = await supabase.from('emplacements').delete().eq('id', id);
    if (!error) setLocations(prev => prev.filter(l => l.id !== id));
  };

  // ==========================================
  // LOTS (CRUD)
  // ==========================================
  const addLot = async (data) => {
    const { data: newDb, error } = await supabase
      .from('lots')
      .insert([{
        produit_id: data.productId,
        numero_lot: data.lotNumber,
        quantite: data.quantity,
        date_expiration: data.expiry
      }])
      .select()
      .single();
    if (!error && newDb) {
      setProducts(prev => prev.map(p => {
        if (p.id === data.productId) {
          const newLots = [
            ...p.lots,
            {
              id: newDb.numero_lot,
              expiry: newDb.date_expiration,
              stock: newDb.quantite,
              _db_id: newDb.id
            }
          ];
          return { ...p, lots: newLots, stock: newLots.reduce((s, l) => s + l.stock, 0) };
        }
        return p;
      }));
      logJournal('Lot', 'Lot ajouté', data.lotNumber);
    }
  };

  const updateLot = async (productId, lotId, data) => {
    const product = products.find(p => p.id === productId);
    const lot = product?.lots.find(l => l.id === lotId);
    if (!lot || !lot._db_id) return;
    const { error } = await supabase
      .from('lots')
      .update({
        numero_lot: data.lotNumber,
        quantite: data.quantity,
        date_expiration: data.expiry
      })
      .eq('id', lot._db_id);
    if (!error) {
      setProducts(prev => prev.map(p => {
        if (p.id === productId) {
          const newLots = p.lots.map(l =>
            l.id === lotId
              ? { ...l, id: data.lotNumber, stock: data.quantity, expiry: data.expiry }
              : l
          );
          return { ...p, lots: newLots, stock: newLots.reduce((s, l) => s + l.stock, 0) };
        }
        return p;
      }));
      logJournal('Lot', 'Lot modifié', data.lotNumber);
    }
  };

  const deleteLot = async (productId, lotId) => {
    const product = products.find(p => p.id === productId);
    const lot = product?.lots.find(l => l.id === lotId);
    if (!lot || !lot._db_id) return;
    const { error } = await supabase.from('lots').delete().eq('id', lot._db_id);
    if (!error) {
      setProducts(prev => prev.map(p => {
        if (p.id === productId) {
          const newLots = p.lots.filter(l => l.id !== lotId);
          return { ...p, lots: newLots, stock: newLots.reduce((s, l) => s + l.stock, 0) };
        }
        return p;
      }));
      logJournal('Lot', 'Lot supprimé', lotId);
    }
  };

  // ==========================================
  // INVENTAIRES
  // ==========================================
  const addInventory = async (data) => {
    const { data: newDb, error } = await supabase
      .from('inventaires')
      .insert([{
        reference: data.reference,
        date_inventaire: data.date,
        produit_id: data.productId,
        stock_theorique: data.theoretical,
        stock_physique: data.physical,
        user_name: profile?.name || 'Inconnu'
      }])
      .select('*, produit:produits(nom)')
      .single();
    if (error) {
      console.error('Erreur addInventory:', error);
      throw error;
    }
    if (newDb) {
      setInventories(prev => [newDb, ...prev]);
      await supabase.from('produits').update({ stock: data.physical }).eq('id', data.productId);
      setProducts(prev => prev.map(p =>
        p.id === data.productId ? { ...p, stock: data.physical } : p
      ));
      logJournal('Inventaire', 'Nouvel inventaire', `${data.reference} — ${data.physical} ctn`);
      return newDb;
    }
  };

  const deleteInventory = async (id) => {
    const { error } = await supabase.from('inventaires').delete().eq('id', id);
    if (!error) {
      setInventories(prev => prev.filter(i => i.id !== id));
      logJournal('Inventaire', 'Inventaire supprimé', id);
    }
  };

  // ==========================================
  // VENTES
  // Règle métier : le stock N'EST DÉDUIT qu'à la validation du paiement
  // ==========================================

  /**
   * Création d'une vente.
   * - Proforma (statut 'En attente') : NE TOUCHE PAS AU STOCK.
   *   Le stock sera déduit dans updateSale() quand le caissier validera le paiement.
   * - Vente déjà encaissée (statut 'Payée' / 'Partielle', ex. admin) :
   *   le stock est déduit tout de suite et stock_deduit = true.
   */
  const addSale = async (saleData) => {
    try {
      const isPaidNow = saleData.status === 'Payée' || saleData.status === 'Partielle';

      const { data: venteDb, error: venteErr } = await supabase
        .from('ventes')
        .insert([{
          numero_facture: saleData.number,
          date_vente: saleData.date,
          client_id: saleData.clientId,
          type_paiement: saleData.payment,
          statut: saleData.status,
          montant_paye: saleData.paid,
          echeance: saleData.echeance,
          remise: Number(saleData.remiseRate) || 0,
          user_name: profile?.name || 'Inconnu',
          stock_deduit: isPaidNow
        }])
        .select()
        .single();
      if (venteErr) throw venteErr;

      const lignes = saleData.products.map(p => ({
        vente_id: venteDb.id,
        produit_id: p.productId,
        lot_id: p.lot || null,
        quantite: p.quantity,
        prix_unitaire: p.price,
        tva: p.tva
      }));
      const { error: lignesErr } = await supabase.from('lignes_vente').insert(lignes);
      if (lignesErr) throw lignesErr;

      // Déduction uniquement si le paiement est déjà encaissé
      if (isPaidNow) {
        await deductStockForLines(lignes);
        await reloadProducts();
      }

      await reloadSales();

      logJournal(
        'Vente',
        isPaidNow ? 'Vente créée' : 'Proforma créée',
        `${saleData.number} — ${saleData.client} (${isPaidNow ? 'encaissée' : 'en attente de paiement'}) par ${profile?.name || 'Inconnu'}`
      );
    } catch (err) {
      console.error('Erreur addSale:', err);
      throw err;
    }
  };

  /**
   * Mise à jour d'une vente.
   * 🔑 RÈGLES MÉTIER :
   *  - Tant que stock_deduit === false (proforma) : on peut modifier client, date
   *    et produits ; le stock ne bouge pas.
   *  - Quand le caissier valide (statut 'Payée' ou 'Partielle') et que
   *    stock_deduit === false : on déduit le stock MAINTENANT (une seule fois).
   *  - Si la vente repasse à 'En attente' après déduction : on restitue.
   *  - Une fois le stock déduit, les lignes ne sont plus modifiables ici
   *    (seuls paiement / statut / échéance changent).
   */
  const updateSale = async (id, saleData) => {
    const cashierName = profile?.name || 'Inconnu';
    try {
      // 1. État actuel (avec lignes et flag stock_deduit)
      const { data: currentSale, error: fetchErr } = await supabase
        .from('ventes')
        .select('*, lignes:lignes_vente(*)')
        .eq('id', id)
        .single();
      if (fetchErr) throw fetchErr;

      const alreadyDeducted = currentSale.stock_deduit === true;
      const willBePaid = saleData.status === 'Payée' || saleData.status === 'Partielle';
      const willBePending = saleData.status === 'En attente';
      const nextDeductedFlag = willBePaid ? true : (willBePending ? false : alreadyDeducted);

      // 2. Proforma non déduite : on peut réécrire les lignes
      let lignesForStock = currentSale.lignes;
      const canRewriteLines =
        !alreadyDeducted && Array.isArray(saleData.products) && saleData.products.length > 0;

      if (canRewriteLines) {
        const newLignes = saleData.products.map(p => ({
          vente_id: id,
          produit_id: p.productId,
          lot_id: p.lot || null,
          quantite: p.quantity,
          prix_unitaire: p.price,
          tva: p.tva
        }));

        // On insère d'abord les nouvelles lignes, puis on supprime les anciennes
        // (si l'insertion échoue, rien n'est perdu)
        const oldIds = (currentSale.lignes || []).map(l => l.id);
        const { data: inserted, error: insErr } = await supabase
          .from('lignes_vente')
          .insert(newLignes)
          .select();
        if (insErr) throw insErr;

        if (oldIds.length > 0) {
          const { error: delErr } = await supabase
            .from('lignes_vente')
            .delete()
            .in('id', oldIds);
          if (delErr) throw delErr;
        }
        lignesForStock = inserted;
      }

      // 3. Mise à jour de l'entête
      const headerUpdate = {
        type_paiement: saleData.payment,
        statut: saleData.status,
        montant_paye: saleData.paid,
        echeance: saleData.echeance,
        stock_deduit: nextDeductedFlag
      };
      if (saleData.remiseRate !== undefined) headerUpdate.remise = Number(saleData.remiseRate) || 0;
      if (willBePaid) headerUpdate.user_name = cashierName; // "Encaissé par"
      if (!alreadyDeducted && saleData.clientId) headerUpdate.client_id = saleData.clientId;
      if (!alreadyDeducted && saleData.date) headerUpdate.date_vente = saleData.date;

      const { error: venteErr } = await supabase
        .from('ventes')
        .update(headerUpdate)
        .eq('id', id);
      if (venteErr) throw venteErr;

      // 4. Gestion du stock
      if (!alreadyDeducted && willBePaid) {
        // 🔻 Validation du paiement → on déduit maintenant
        await deductStockForLines(lignesForStock);
        await reloadProducts();
      } else if (alreadyDeducted && willBePending) {
        // 🔺 Retour en attente → on restitue
        await restoreStockForLines(currentSale.lignes);
        await reloadProducts();
      }

      // 5. Mise à jour locale
      if (canRewriteLines) {
        await reloadSales();
      } else {
        setSales(prevSales =>
          prevSales.map(s => s.id === id ? {
            ...s,
            payment: saleData.payment,
            status: saleData.status,
            paid: saleData.paid,
            echeance: saleData.echeance,
            remiseRate: saleData.remiseRate ?? s.remiseRate,
            userName: willBePaid ? cashierName : s.userName,
            stockDeduit: nextDeductedFlag
          } : s)
        );
      }

      logJournal(
        'Vente',
        willBePaid ? 'Paiement enregistré' : 'Vente modifiée',
        `${saleData.number} par ${cashierName}`
      );
    } catch (err) {
      console.error('Erreur updateSale:', err);
      throw err;
    }
  };

  /**
   * Suppression d'une vente.
   * 🔑 RÈGLE MÉTIER : on ne restitue le stock que si stock_deduit === true
   *    (c.-à-d. si le paiement avait été validé).
   */
  const deleteSale = async (id) => {
    try {
      const { data: currentSale, error: fetchErr } = await supabase
        .from('ventes')
        .select('*, lignes:lignes_vente(*)')
        .eq('id', id)
        .single();
      if (fetchErr) throw fetchErr;

      if (currentSale?.stock_deduit) {
        await restoreStockForLines(currentSale.lignes);
        await reloadProducts();
      }

      const { error } = await supabase.from('ventes').delete().eq('id', id);
      if (error) throw error;

      setSales(prev => prev.filter(s => s.id !== id));
      logJournal('Vente', 'Vente supprimée', `${id} par ${profile?.name || 'Inconnu'}`);
    } catch (err) {
      console.error('Erreur deleteSale:', err);
    }
  };

  // ==========================================
  // ACHATS
  // ==========================================
  const addPurchase = async (purchaseData) => {
    const { data: achatDb, error: achatErr } = await supabase
      .from('achats')
      .insert([{
        numero_facture: purchaseData.number,
        date_achat: purchaseData.date,
        fournisseur_id: purchaseData.supplierId,
        taux_tva: purchaseData.tvaRate,
        remise: purchaseData.remiseRate,
        statut: purchaseData.status,
        user_name: profile?.name || 'Inconnu'
      }])
      .select()
      .single();
    if (achatErr) {
      console.error(achatErr);
      throw achatErr;
    }

    const lignes = purchaseData.products.map(p => ({
      achat_id: achatDb.id,
      produit_id: p.productId,
      quantite: p.quantity,
      prix_unitaire: p.price
    }));
    const { error: lignesErr } = await supabase.from('lignes_achat').insert(lignes);
    if (lignesErr) {
      console.error(lignesErr);
      throw lignesErr;
    }

    const { data: purDataUpdated } = await supabase
      .from('achats')
      .select('*, fournisseur:fournisseurs(nom), lignes:lignes_achat(*, produit:produits(nom))')
      .order('date_achat', { ascending: false });
    if (purDataUpdated) {
      setPurchases(purDataUpdated.map(p => ({
        id: p.id,
        number: p.numero_facture,
        date: p.date_achat,
        supplier: p.fournisseur?.nom,
        supplierId: p.fournisseur_id,
        tvaRate: p.taux_tva,
        remiseRate: p.remise,
        status: p.statut,
        userName: p.user_name,
        products: p.lignes.map(l => ({
          productId: l.produit_id,
          name: l.produit?.nom,
          quantity: l.quantite,
          price: l.prix_unitaire,
          expiry: l.date_expiration
        }))
      })));
    }

    const { data: prodData } = await supabase.from('produits').select('stock');
    if (prodData) {
      setProducts(prev => prev.map(p => {
        const updated = prodData.find(n => n.id === p.id);
        return updated ? { ...p, stock: updated.stock } : p;
      }));
    }

    logJournal(
      'Achat',
      'Achat enregistré',
      `${purchaseData.number} — ${purchaseData.supplier} par ${profile?.name || 'Inconnu'}`
    );
  };

  const deletePurchase = async (id) => {
    const { error } = await supabase.from('achats').delete().eq('id', id);
    if (!error) {
      setPurchases(prev => prev.filter(p => p.id !== id));
      logJournal('Achat', 'Achat supprimé', `${id} par ${profile?.name || 'Inconnu'}`);
    }
  };

  // ==========================================
  // PROVIDER
  // ==========================================
  return (
    <DataContext.Provider value={{
      products, clients, suppliers, sales, purchases, journal,
      locations, settings, loading, inventories,
      addProduct, updateProduct, deleteProduct,
      addClient, updateClient, deleteClient,
      addSupplier, updateSupplier, deleteSupplier, updateProductPrices,
      addLocation, updateLocation, deleteLocation,
      addLot, updateLot, deleteLot,
      addSale, updateSale, deleteSale,
      addPurchase, deletePurchase,
      addInventory, deleteInventory,
      logJournal,
      setProducts, setClients, setSuppliers, setSales, setPurchases, setJournal,
      setSettings, updateSettings
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);