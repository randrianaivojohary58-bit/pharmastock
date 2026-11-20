import { createClient } from '@supabase/supabase-js';


//const supabaseUrl = 'https://qgipyjcqvadngshjalws.supabase.co'; // Dans Settings > API sur Supabase
//const supabaseAnonKey = 'sb_publishable_O3Q_aL-KSdoaydCrW97I4g_ixoVcYi3'; // Dans Settings > API sur Supabase

// On utilise import.meta.env pour lire le fichier .env avec Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// AJOUTEZ CECI POUR TESTER
console.log("URL reçue:", supabaseUrl);
console.log("Clé reçue (début):", supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + "..." : "UNDEFINED");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Erreur : Les variables d'environnement Supabase sont manquantes. Vérifiez votre fichier .env");
}
//const supabaseUrl = 'https://riyjynjdgmqosravejop.supabase.co'; // Dans Settings > API sur Supabase
//const supabaseAnonKey = 'sb_publishable_dwomXGvDMOCiEpNNVzP4jg_0eRBn4yW'; // Dans Settings > API sur Supabase

export const supabase = createClient(supabaseUrl, supabaseAnonKey);