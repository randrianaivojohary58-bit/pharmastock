export default function MiniStat({ label, value, variant = 'default' }) {
  const colorMap = {
    default: 'text-emerald-600',
    warning: 'text-orange-500',
    danger: 'text-red-500'
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <span className="text-xs text-gray-500">{label}</span>
      <strong className={`block text-2xl mt-1 ${colorMap[variant]}`}>{value}</strong>
    </div>
  );
}