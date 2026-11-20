import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase'; // Import du client Supabase
import { useToast } from '../../context/ToastContext';

export default function AiScanner({ onDataExtracted }) {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Image = reader.result;

        // APPEL À L'EDGE FUNCTION SUPABASE (sécurisé)
        const { data, error } = await supabase.functions.invoke('scan-invoice', {
          body: { imageBase64: base64Image }
        });

        // Gestion des erreurs renvoyées par l'Edge Function
        if (error) {
          throw new Error(error.message || "Erreur lors de l'appel à l'IA");
        }

        // Vérification que la réponse contient bien les données attendues
        if (!data || data.error) {
          throw new Error(data?.error || "L'IA n'a pas pu extraire les données");
        }
        
        showToast("Facture analysée avec succès !", "success");
        onDataExtracted(data); // On renvoie le JSON extrait à PurchaseModal
      };
    } catch (error) {
      console.error("Erreur Scanner:", error);
      showToast("Erreur : " + error.message, "error");
    } finally {
      setIsLoading(false);
      e.target.value = ''; // Réinitialiser l'input pour pouvoir re-sélectionner le même fichier
    }
  };

  return (
    <div className="relative">
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isLoading}
      />
      <button 
        type="button"
        disabled={isLoading}
        className="h-9 px-3 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-indigo-100 transition-colors disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
        {isLoading ? 'Analyse en cours...' : 'Scanner facture'}
      </button>
    </div>
  );
}