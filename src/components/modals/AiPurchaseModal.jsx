import { useState } from 'react';
import { UploadCloud, Sparkles, X, Loader2 } from 'lucide-react';
import Modal from './Modal'; // Votre composant Modal existant
import { useToast } from '../../context/ToastContext';

export default function AiPurchaseModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleAnalyze = async () => {
    if (!file) return showToast("Veuillez sélectionner une image", "error");
    
    setIsLoading(true);
    try {
      // Conversion de l'image en Base64 pour l'API
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Image = reader.result;

        // APPEL À L'API OPENAI (Vous devez mettre votre clé API dans votre .env)
        // Note: En production, il est DÉCONSEILLÉ d'appeler OpenAI directement depuis le front-end.
        // Il faut passer par une Edge Function Supabase pour sécuriser la clé.
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}` 
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: `Tu es un assistant expert en comptabilité. Analyse l'image de cette facture fournisseur.
                Extrais les informations et renvoie UNIQUEMENT un objet JSON valide avec cette structure exacte:
                {
                  "number": "numero de facture",
                  "date": "YYYY-MM-DD",
                  "supplier": "nom du fournisseur",
                  "tvaRate": 20, 
                  "remiseRate": 0,
                  "products": [
                    { "name": "nom du produit", "quantity": 10, "price": 1500 }
                  ]
                }`
              },
              {
                role: "user",
                content: [
                  { type: "text", text: "Voici la facture à analyser." },
                  { type: "image_url", image_url: { url: base64Image } }
                ]
              }
            ],
            response_format: { type: "json_object" },
            max_tokens: 1000,
          })
        });

        const data = await response.json();
        const extractedData = JSON.parse(data.choices[0].message.content);
        
        showToast("Facture analysée avec succès !", "success");
        onSuccess(extractedData); // On renvoie les données à Achats.jsx
      };
    } catch (error) {
      console.error(error);
      showToast("Erreur lors de l'analyse de la facture", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Scanner une facture par IA">
      <div className="space-y-4">
        {!preview ? (
          <div className="border-2 border-dashed border-indigo-200 bg-indigo-50 rounded-xl p-8 text-center hover:bg-indigo-100 transition-colors cursor-pointer relative">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <UploadCloud className="w-10 h-10 text-indigo-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-indigo-900">Cliquez pour importer une photo de facture</p>
            <p className="text-xs text-indigo-600 mt-1">JPG, PNG (max 5Mo)</p>
          </div>
        ) : (
          <div className="relative">
            <img src={preview} alt="Aperçu" className="w-full h-48 object-contain bg-gray-100 rounded-lg" />
            <button onClick={() => { setFile(null); setPreview(null); }} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={!file || isLoading}
          className="w-full h-11 bg-indigo-600 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyse en cours...</> : <><Sparkles className="w-4 h-4" /> Extraire les données</>}
        </button>
      </div>
    </Modal>
  );
}