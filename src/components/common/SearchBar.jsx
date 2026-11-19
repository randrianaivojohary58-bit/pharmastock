import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Rechercher...' }) {
  return (
    <div className="h-10 w-80 bg-white border border-gray-200 rounded-lg flex items-center px-3">
      <Search className="w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent border-0 outline-0 ml-2 text-xs"
      />
    </div>
  );
}