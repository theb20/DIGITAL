import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, FolderKanban, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import servicesApi from '../configurations/services/services.js';
import serviceCategoriesApi from '../configurations/services/serviceCategories.js';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState({ services: [], categories: [] });
  const [activeIndex, setActiveIndex] = useState(0);
  const debounceRef = useRef(null);
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ left: 0, top: 0, width: 0 });

  const updateDropdownPos = () => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setDropdownPos({ left: rect.left, top: rect.bottom + 8, width: rect.width });
  };

  const handleClear = () => {
    setQuery('');
  };


  const handleKeyDown = (e) => {
    const merged = [
      ...results.categories.map((c) => ({ type: 'category', item: c })),
      ...results.services.map((s) => ({ type: 'service', item: s })),
    ];
    const max = Math.max(0, merged.length - 1);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i < max ? i + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i > 0 ? i - 1 : max));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const sel = merged[activeIndex];
      if (!sel) return;
      if (sel.type === 'service') {
        navigate('/card', { state: { service: sel.item } });
      } else {
        const catName = sel.item.name || sel.item.label || String(sel.item).trim();
        const params = new URLSearchParams({ cat: catName, q: '' });
        navigate(`/services?${params.toString()}`);
      }
    }
  };

  useEffect(() => {
    // Debounce la requête
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    const q = query.trim();
    if (q.length < 2) {
      setResults({ services: [], categories: [] });
      setLoading(false);
      setError(null);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const [services, categories] = await Promise.all([
          servicesApi.list(),
          serviceCategoriesApi.list(),
        ]);
        const ql = q.toLowerCase();
        const sFiltered = (Array.isArray(services) ? services : []).filter((s) => {
          const t = String(s.title || '').toLowerCase();
          const d = String(s.description || '').toLowerCase();
          return t.includes(ql) || d.includes(ql);
        });
        const cFiltered = (Array.isArray(categories) ? categories : []).filter((c) => {
          const n = String(c.name || c.label || '').toLowerCase();
          return n.includes(ql);
        });
        setResults({ services: sFiltered.slice(0, 8), categories: cFiltered.slice(0, 6) });
        setActiveIndex(0);
      } catch (err) {
        setError(err?.message || 'Erreur lors de la recherche');
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    if (isFocused) {
      updateDropdownPos();
    }
  }, [isFocused, query]);

  useEffect(() => {
    const onScroll = () => {
      if (isFocused) updateDropdownPos();
    };
    const onResize = () => {
      if (isFocused) updateDropdownPos();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [isFocused]);
  

  return (
    <div className=" flex flex-col items-center justify-center p-4">

      {/* Barre de recherche */}
      <div className="relative w-full max-w-2xl" ref={containerRef}>
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
            onKeyDown={handleKeyDown}
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
              onClick={()=>navigate('/submission')}
              type="button"
              className="text-blue-500 flex items-center gap-1 hover:text-blue-600 transition-colors"
              title="Recherche vocale"
            >
              <FolderKanban size={20} />
              <span className='hidden lg:block m-0 p-0'>J'ai un projet</span>
            </button>
            
            
          </div>
        </div>

        {/* Résultats de recherche */}
        {isFocused && query && createPortal(
          <div
            data-search-portal="true"
            className="fixed z-[2147483647] bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn"
            style={{
              animation: 'slideDown 0.3s ease-out',
              left: dropdownPos.left,
              top: dropdownPos.top,
              width: dropdownPos.width,
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            {/* État de chargement / erreur */}
            {loading && (
              <div className="px-6 py-3 flex items-center gap-3 text-gray-700">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                <span>Recherche en cours…</span>
              </div>
            )}
            {error && (
              <div className="px-6 py-3 text-red-600">{error}</div>
            )}

            {/* Catégories */}
            {results.categories.length > 0 && (
              <div className="py-2">
                <div className="px-6 pb-2 text-xs font-semibold text-gray-500">Catégories</div>
                {results.categories.map((c, idx) => {
                  const isActive = activeIndex === idx;
                  return (
                    <button
                      key={`cat-${c.id || idx}`}
                      type="button"
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => {
                        const catName = c.name || c.label || String(c).trim();
                        const params = new URLSearchParams({ cat: catName, q: '' });
                        navigate(`/services?${params.toString()}`);
                      }}
                      className={`w-full px-6 py-3 text-left transition-colors flex items-center gap-3 ${isActive ? 'bg-gray-100' : 'hover:bg-gray-100'} text-gray-700`}
                    >
                      <Search size={16} className="text-gray-400" />
                      <span>{c.name || c.label || 'Catégorie'}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Services */}
            {results.services.length > 0 && (
              <div className="py-2 border-t border-gray-200">
                <div className="px-6 pb-2 text-xs font-semibold text-gray-500">Services</div>
                {results.services.map((s, idx) => {
                  const base = results.categories.length;
                  const absoluteIndex = base + idx;
                  const isActive = activeIndex === absoluteIndex;
                  return (
                    <button
                      key={`svc-${s.id || idx}`}
                      type="button"
                      onMouseEnter={() => setActiveIndex(absoluteIndex)}
                      onClick={() => navigate('/card', { state: { service: s } })}
                      className={`w-full px-6 py-3 text-left transition-colors flex items-center gap-3 ${isActive ? 'bg-gray-100' : 'hover:bg-gray-100'} text-gray-700`}
                    >
                      <Search size={16} className="text-gray-400" />
                      <div className="flex flex-col">
                        <span className="font-medium">{s.title || 'Service'}</span>
                        {s.description && (
                          <span className="text-xs text-gray-500 line-clamp-1">{s.description}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Aucune correspondance */}
            {!loading && !error && results.categories.length === 0 && results.services.length === 0 && (
              <div className="px-6 py-3 text-gray-600">Aucun résultat pour “{query}”.</div>
            )}
          </div>,
          document.body
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