import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus } from 'lucide-react';

export default function CustomSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Rechercher...',
  allowCreate = false,
  label
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (!containerRef.current?.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = options.filter(o =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  const showCreate = allowCreate && search.trim() &&
    !options.some(o => o.toLowerCase() === search.toLowerCase());

  const handleSelect = (val) => {
    onChange(val);
    setSearch('');
    setIsOpen(false);
    setHighlighted(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted(h => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault();
      handleSelect(filtered[highlighted]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {label && <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>}
      <div className="relative">
        <input
          type="text"
          value={isOpen ? search : (value || '')}
          onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-10 px-3 pr-9 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-xs"
        />
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filtered.length === 0 && !showCreate && (
            <div className="px-3 py-4 text-center text-xs text-gray-500">Aucun résultat</div>
          )}
          {filtered.map((option, i) => (
            <button
              key={option}
              type="button"
              onClick={() => handleSelect(option)}
              className={`w-full px-3 py-2 text-left text-xs hover:bg-emerald-50 ${
                i === highlighted ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'
              }`}
            >
              {option}
            </button>
          ))}
          {showCreate && (
            <button
              type="button"
              onClick={() => handleSelect(search.trim())}
              className="w-full px-3 py-2 text-left text-xs text-emerald-600 font-medium hover:bg-emerald-50 border-t border-gray-200 flex items-center gap-2"
            >
              <Plus className="w-3 h-3" />
              Créer : "{search.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}