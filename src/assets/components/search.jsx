import { useState } from 'react';
import { Search, X, Mic, FolderKanban } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const suggestions = [
    '🌈 animations CSS avancées',
    '🎨 design moderne 2024',
    '⚡ React composants',
    '🚀 optimisation performance',
    '💡 tutoriels développement'
  ];

  const handleClear = () => {
    setQuery('');
  };

  const handleSearch = () => {
    if (query.trim()) {
      alert(`Recherche pour: ${query}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  

  return (
    <div className=" flex flex-col items-center justify-center p-4">

      {/* Barre de recherche */}
      <div className="w-full max-w-2xl">
        <div 
          className={`
            relative bg-white rounded-full 
            transition-all duration-300 ease-out
            ${isFocused 
              ? 'shadow-2xl scale-105' 
              : 'shadow-lg hover:shadow-xl'
            }
          `}
          style={{
            border: isFocused ? '1px solid transparent' : '1px solid #dfe1e5',
          }}
        >
          {/* Icône de recherche */}
          <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search size={20} />
          </div>

          {/* Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onKeyPress={handleKeyPress}
            placeholder="Rechercher un service..."
            className="w-full py-4 px-14 rounded-full text-base outline-none bg-transparent"
            style={{ color: '#202124' }}
          />

          {/* Icônes de droite */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-3">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            )}
            
            <div className="w-px h-6 bg-gray-300"></div>
            
            <button
              type="button"
              className="text-blue-500 flex items-center gap-1 hover:text-blue-600 transition-colors"
              title="Recherche vocale"
            >
              <FolderKanban size={20} /> <span className='hidden lg:block m-0 p-0'>J'ai un projet</span>
            </button>
            
            
          </div>
        </div>

        {/* Suggestions */}
        {isFocused && query && (
          <div 
            className="mt-2 bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn"
            style={{ 
              animation: 'slideDown 0.3s ease-out',
              maxWidth: '100%'
            }}
          >
            {suggestions
              .filter(s => s.toLowerCase().includes(query.toLowerCase()))
              .map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setQuery(suggestion)}
                  className="w-full px-6 py-3 text-left hover:bg-gray-100 transition-colors flex items-center gap-3 text-gray-700"
                >
                  <Search size={16} className="text-gray-400" />
                  <span>{suggestion}</span>
                </button>
              ))}
          </div>
        )}

        
      </div>

      {/* Animation CSS */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        input::placeholder {
          color: #9aa0a6;
        }

        button:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
}