import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, label, children, footer, maxWidth = 'max-w-3xl' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className={`bg-white rounded-2xl w-full ${maxWidth} max-h-[92vh] flex flex-col shadow-2xl`} onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 flex justify-between items-start">
          <div>
            {label && <div className="text-[10px] font-bold tracking-widest text-emerald-600 mb-1">{label}</div>}
            <h2 className="text-lg font-bold">{title}</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg flex items-center justify-center transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        {footer && <div className="p-4 border-t border-gray-200 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}