import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext'; // <-- IMPORT AJOUTÉ

const DataContext = createContext({});

export function DataProvider({ children }) {
  const { profile } = useAuth(); // <-- RÉCUPÉRATION DU PROFIL CONNECTÉ
  
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [journal, setJournal] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [settings] = useState({
    company: { name: 'SALAMA SAVA', address: 'Antananarivo', nif: '123 456 789', stat: '98765', bank: 'BMOI', phone: '+261 34', email: 'contact@salama.mg' },
    tvaRate: 20, delayDays: 15, remiseRate: 0, fefoEnabled: true
  });

  // ==========================================
  // CHARGEMENT INITIAL
  // ==========================================
  useEffect(() => {
    async function loadAllData() {
      setLoading(true);
      try {
        const { data: locData } = await supabase.from('emplacements').select('*');
        if (locData) setLocations(locData);

        const { data: prodData } = await supabase.from('produits').select('*, lots(*), emplacement:emplacements(*)');
        if (prodData) {
          setProducts(prodData.map(p => ({
            ...p,
            buyPrice: p.prix_achat,
            price: p.prix_vente,
            name: p.nom,
            rayon: p.emplacement?.rayon || '',
            allee: p.emplacement?.allee || '',
            etagere: p.emplacement?.etagere || '',
            lots: p.lots.map(l => ({ id: l.numero_lot, expiry: l.date_expiration, stock: l.quantite, _db_id: l.id }))
          })));
        }

        const { data: clientData } = await supabase.from('clients').select('*');
        if (clientData) setClients(clientData.map(c => ({ ...c, name: c.nom, status: c.statut })));

        const { data: supData } = await supabase.from('fournisseurs').select('*');
        if (supData) setSuppliers(supData.map(s => ({ ...s, name: s.nom, status: s.statut })));

        const { data: saleData } = await supabase.from('ventes').select('*, client:clients(nom, type), lignes:lignes_vente(*, produit:produits(nom))');
        if (saleData) {
          setSales(saleData.map(s => ({
            id: s.id, number: s.numero_facture, date: s.date_vente, client: s.client?.nom,
            clientType: s.client?.type, payment: s.type_paiement, status: s.statut,
            paid: s.montant_paye, echeance: s.echeance,
            userName: s.user_name, // <-- RÉCUPÉRATION
            products: s.lignes.map(l => ({ productId: l.produit_id, name: l.produit?.nom, lot: l.lot_id, quantity: l.quantite, price: l.prix_unitaire, tva: l.tva }))
          })));
        }

        const { data: purData } = await supabase.from('achats').select('*, fournisseur:fournisseurs(nom), lignes:lignes_achat(*, produit:produits(nom))');
        if (purData) {
          setPurchases(purData.map(p => ({
            id: p.id, number: p.numero_facture, date: p.date_achat, supplier: p.fournisseur?.nom,
            tvaRate: p.taux_tva, remiseRate: p.remise, status: p.statut,
            userName: p.user_name, // <-- RÉCUPÉRATION
            products: p.lignes.map(l => ({ productId: l.produit_id, name: l.produit?.nom, quantity: l.quantite, price: l.prix_unitaire, expiry: l.date_expiration }))
          })));
        }

        const { data: jData } = await supabase.from('journal').select('*').order('date_action', { ascending: false }).limit(50);
        if (jData) setJournal(jData.map(j => ({ id: j.id, date: j.date_action, type: j.type, title: j.titre, description: j.description })));

      } catch (error) {
        console.error("Erreur de chargement:", error);
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, []);

  const logJournal = async (type, title, description) => {
    setJournal(prev => [{ id: Date.now(), date: new Date().toISOString(), type, title, description }, ...prev]);
    await supabase.from('journal').insert([{ type, titre: title, description }]);
  };

  // ==========================================
  // PRODUITS
  // ==========================================
  const addProduct = async (data) => {
    const { data: newDb, error } = await supabase.from('produits').insert([{
      id: data.code, nom: data.name, type: data.type, conditionnement: data.conditionnement,
      categorie: data.category, tva: data.tva, prix_achat: data.buyPrice, prix_vente: data.price, stock: data.stock
    }]).select().single();

    if (!error && newDb) {
      setProducts(prev => [...prev, { ...data, id: newDb.id, lots: [] }]);
      logJournal('Produit', 'Nouveau produit', data.name);
    }
  };

  const updateProduct = async (id, data) => {
    const { error } = await supabase.from('produits').update({
      nom: data.name, type: data.type, conditionnement: data.conditionnement,
      categorie: data.category, tva: data.tva, prix_achat: data.buyPrice, prix_vente: data.price, stock: data.stock
    }).eq('id', id);

    if (!error) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
      logJournal('Produit', 'Produit modifié', data.name);
    }
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
    const { data: newDb, error } = await supabase.from('clients').insert([{
      nom: data.name, type: data.type, telephone: data.phone, adresse: data.address,
      email: data.email, nif: data.nif, fidele: data.fidele, statut: 'Actif'
    }]).select().single();

    if (!error && newDb) {
      setClients(prev => [...prev, { ...data, id: newDb.id, status: 'Actif' }]);
      logJournal('Client', 'Nouveau client', data.name);
    }
  };

  const updateClient = async (id, data) => {
    const { error } = await supabase.from('clients').update({
      nom: data.name, type: data.type, telephone: data.phone, adresse: data.address,
      email: data.email, nif: data.nif, fidele: data.fidele
    }).eq('id', id);

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
    const { data: newDb, error } = await supabase.from('fournisseurs').insert([{
      nom: data.name, type: data.type, telephone: data.phone, pays: data.country,
      email: data.email, nif: data.nif, stat: data.stat, statut: 'Actif'
    }]).select().single();

    if (!error && newDb) {
      setSuppliers(prev => [...prev, { ...data, id: newDb.id, status: 'Actif' }]);
    }
  };

  const updateSupplier = async (id, data) => {
    const { error } = await supabase.from('fournisseurs').update({
      nom: data.name, type: data.type, telephone: data.phone, pays: data.country,
      email: data.email, nif: data.nif, stat: data.stat
    }).eq('id', id);

    if (!error) {
      setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    }
  };

  const deleteSupplier = async (id) => {
    const { error } = await supabase.from('fournisseurs').delete().eq('id', id);
    if (!error) setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  // ==========================================
  // EMPLACEMENTS
  // ==========================================
  const addLocation = async (data) => {
    const { data: newDb, error } = await supabase.from('emplacements').insert([{
      rayon: data.rayon, allee: data.allee, etagere: data.etagere, description: data.description
    }]).select().single();

    if (!error && newDb) {
      setLocations(prev => [...prev, newDb]);
      logJournal('Emplacement', 'Nouvel emplacement', `${data.rayon}-${data.allee}-${data.etagere}`);
    }
  };

  const updateLocation = async (id, data) => {
    const { error } = await supabase.from('emplacements').update({
      rayon: data.rayon, allee: data.allee, etagere: data.etagere, description: data.description
    }).eq('id', id);

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
  // LOTS
  // ==========================================
  const addLot = async (data) => {
    const { data: newDb, error } = await supabase.from('lots').insert([{
      produit_id: data.productId,
      numero_lot: data.lotNumber,
      quantite: data.quantity,
      date_expiration: data.expiry
    }]).select().single();

    if (!error && newDb) {
      setProducts(prev => prev.map(p => {
        if (p.id === data.productId) {
          const newLots = [...p.lots, { id: newDb.numero_lot, expiry: newDb.date_expiration, stock: newDb.quantite, _db_id: newDb.id }];
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

    const { error } = await supabase.from('lots').update({
      numero_lot: data.lotNumber,
      quantite: data.quantity,
      date_expiration: data.expiry
    }).eq('id', lot._db_id);

    if (!error) {
      setProducts(prev => prev.map(p => {
        if (p.id === productId) {
          const newLots = p.lots.map(l => l.id === lotId ? { ...l, id: data.lotNumber, stock: data.quantity, expiry: data.expiry } : l);
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
  // VENTES (AVEC USER_NAME)
  // ==========================================
  const addSale = async (saleData) => {
    const { data: venteDb, error: venteErr } = await supabase.from('ventes').insert([{
      numero_facture: saleData.number,
      date_vente: saleData.date,
      client_id: saleData.clientId,
      type_paiement: saleData.payment,
      statut: saleData.status,
      montant_paye: saleData.paid,
      echeance: saleData.echeance,
      user_name: profile?.name || 'Inconnu' // <-- AJOUT
    }]).select().single();

    if (venteErr) { console.error(venteErr); return; }

    const lignes = saleData.products.map(p => ({
      vente_id: venteDb.id, produit_id: p.productId, lot_id: p.lotId || null,
      quantite: p.quantity, prix_unitaire: p.price, tva: p.tva
    }));

    const { error: lignesErr } = await supabase.from('lignes_vente').insert(lignes);
    
    if (!lignesErr) {
      setSales(prev => [{ ...saleData, id: venteDb.id, userName: profile?.name }, ...prev]);
      logJournal('Vente', 'Vente enregistrée', `${saleData.number} — ${saleData.client} par ${profile?.name || 'Inconnu'}`);
      
      const { data: prodData } = await supabase.from('produits').select('*, lots(*)');
      if (prodData) setProducts(prev => prev.map(p => {
        const updated = prodData.find(n => n.id === p.id);
        return updated ? { ...p, stock: updated.stock, lots: updated.lots.map(l => ({ id: l.numero_lot, expiry: l.date_expiration, stock: l.quantite, _db_id: l.id })) } : p;
      }));
    }
  };

  const deleteSale = async (id) => {
    const { error } = await supabase.from('ventes').delete().eq('id', id);
    if (!error) {
      setSales(prev => prev.filter(s => s.id !== id));
      logJournal('Vente', 'Vente supprimée', `${id} par ${profile?.name || 'Inconnu'}`);
    }
  };

  // ==========================================
  // ACHATS (AVEC USER_NAME)
  // ==========================================
  const addPurchase = async (purchaseData) => {
    const { data: achatDb, error: achatErr } = await supabase.from('achats').insert([{
      numero_facture: purchaseData.number,
      date_achat: purchaseData.date,
      fournisseur_id: purchaseData.supplierId,
      taux_tva: purchaseData.tvaRate,
      remise: purchaseData.remiseRate,
      statut: purchaseData.status,
      user_name: profile?.name || 'Inconnu' // <-- AJOUT
    }]).select().single();

    if (achatErr) { console.error(achatErr); return; }

    const lignes = purchaseData.products.map(p => ({
      achat_id: achatDb.id, produit_id: p.productId, quantite: p.quantity, prix_unitaire: p.price
    }));

    const { error: lignesErr } = await supabase.from('lignes_achat').insert(lignes);

    if (!lignesErr) {
      setPurchases(prev => [{ ...purchaseData, id: achatDb.id, userName: profile?.name }, ...prev]);
      logJournal('Achat', 'Achat enregistré', `${purchaseData.number} — ${purchaseData.supplier} par ${profile?.name || 'Inconnu'}`);
      
      const { data: prodData } = await supabase.from('produits').select('stock');
      if (prodData) setProducts(prev => prev.map(p => {
        const updated = prodData.find(n => n.id === p.id);
        return updated ? { ...p, stock: updated.stock } : p;
      }));
    }
  };

  const deletePurchase = async (id) => {
    const { error } = await supabase.from('achats').delete().eq('id', id);
    if (!error) {
      setPurchases(prev => prev.filter(p => p.id !== id));
      logJournal('Achat', 'Achat supprimé', `${id} par ${profile?.name || 'Inconnu'}`);
    }
  };

  return (
    <DataContext.Provider value={{
      products, clients, suppliers, sales, purchases, journal, locations, settings, loading,
      addProduct, updateProduct, deleteProduct,
      addClient, updateClient, deleteClient,
      addSupplier, updateSupplier, deleteSupplier,
      addLocation, updateLocation, deleteLocation,
      addLot, updateLot, deleteLot,
      addSale, deleteSale,
      addPurchase, deletePurchase,
      logJournal,
      setProducts, setClients, setSuppliers, setSales, setPurchases, setJournal
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);