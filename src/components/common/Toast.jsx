import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const iconMap = {
  success: { Icon: CheckCircle, bg: 'bg-emerald-50', color: 'text-emerald-600' },
  error: { Icon: AlertCircle, bg: 'bg-red-50', color: 'text-red-600' },
  warning: { Icon: AlertCircle, bg: 'bg-orange-50', color: 'text-orange-600' },
  info: { Icon: Info, bg: 'bg-blue-50', color: 'text-blue-600' }
};

export default function Toast({ title, message, type = 'success', onClose }) {
  const { Icon, bg, color } = iconMap[type] || iconMap.success;

  return (
    <div className="w-80 p-4 bg-white border border-gray-200 rounded-xl shadow-2xl border-l-4 border-l-emerald-500 flex items-center gap-3 animate-slide-in">
      <div className={`w-9 h-9 rounded-lg ${bg} ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <strong className="block text-xs">{title}</strong>
        <span className="block text-[10px] text-gray-500 mt-1">{message}</span>
      </div>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}