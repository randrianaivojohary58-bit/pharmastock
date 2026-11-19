import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, danger = true }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-full ${danger ? 'bg-red-100' : 'bg-orange-100'} flex items-center justify-center`}>
            <AlertTriangle className={`w-6 h-6 ${danger ? 'text-red-600' : 'text-orange-600'}`} />
          </div>
          <div>
            <h3 className="text-lg font-bold">{title}</h3>
            <p className="text-xs text-gray-500">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onCancel} className="px-4 py-2 border border-gray-200 rounded-lg text-xs hover:bg-gray-50">
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'} text-white rounded-lg text-xs`}
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}