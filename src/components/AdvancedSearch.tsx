import { useState, useEffect, useRef } from 'react';
import { Search, X, ShieldCheck } from 'lucide-react';
import type { NewsCategory, SearchFilters } from '../types/types';
import { ApiHandler } from '../services/ApiHandler';

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  isDarkMode: boolean;
  selectedCategory: NewsCategory;
  onCategoryChange: (category: NewsCategory) => void;
  onExternalArticleAnalyzed?: (article: any) => void;
  onVerifyClaim?: (claim: string) => void;
}

const credibilityCategories: { value: NewsCategory; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'verdadera', label: 'Verdaderas' },
  { value: 'falsa', label: 'Falsas' },
  { value: 'sátira', label: 'Sátira' },
  { value: 'engañosa', label: 'Engañosas' },
];

type SearchMode = 'search' | 'verify';

export function AdvancedSearch({ onSearch, isDarkMode, selectedCategory, onCategoryChange, onExternalArticleAnalyzed, onVerifyClaim }: AdvancedSearchProps) {
  const [isFloating, setIsFloating] = useState(false);
  const [searchBarHeight, setSearchBarHeight] = useState(0);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const [originalTopPosition, setOriginalTopPosition] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>('search');
  const [filters, setFilters] = useState<SearchFilters>({
    text: '',
  });

  useEffect(() => {
    if (searchBarRef.current) {
      const rect = searchBarRef.current.getBoundingClientRect();
      setOriginalTopPosition(rect.top + window.scrollY);
      setSearchBarHeight(searchBarRef.current.offsetHeight);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (originalTopPosition > 0) {
        const scrollPosition = window.scrollY;
        if (scrollPosition > originalTopPosition) {
          setIsFloating(true);
        } else {
          setIsFloating(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [originalTopPosition]);

  useEffect(() => {
    if (searchBarRef.current) {
      setSearchBarHeight(searchBarRef.current.offsetHeight);
    }
  }, []);

  const handleSearch = async () => {
    const searchText = filters.text.trim();
    if (!searchText) {
      onSearch({ text: '' });
      return;
    }

    if (searchMode === 'verify') {
      if (onVerifyClaim) {
        onVerifyClaim(searchText);
      }
      // Limpiamos también el componente padre
      setFilters({ text: '' });
      onSearch({ text: '' });
      return;
    }

    // Mejoramos la validación para aceptar URLs con www.
    const isUrl = searchText.startsWith('http://') || searchText.startsWith('https://') || searchText.startsWith('www.');

    if (isUrl) {
      // Inyectamos el protocolo si el usuario solo puso "www"
      const urlToSend = searchText.startsWith('www.') ? `https://${searchText}` : searchText;

      setIsAnalyzing(true);
      try {
        // Usamos tu ApiHandler para que respete el entorno (Local o Render)
        const externalArticle = await ApiHandler.analyzeExternalUrl(urlToSend);

        // Limpiamos el texto visual de la barra
        setFilters({ text: '' });
        // Le avisamos a NewsGrid que deje de filtrar para que la tarjeta se vea
        onSearch({ text: '' }); 

        // Empujamos la tarjeta al inicio del feed
        if (onExternalArticleAnalyzed) {
          onExternalArticleAnalyzed(externalArticle);
        }
        
      } catch (error) {
        console.error('Error analizando la URL externa:', error);
        alert("Falla de conexión con el servidor de análisis.");
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      onSearch(filters);
    }
  };

  const modeBtnClass = (mode: SearchMode) => {
    const isActive = searchMode === mode;
    const base = "flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-all duration-300 font-medium text-sm sm:text-base flex items-center justify-center gap-1.5";
    if (isActive) {
      return `${base} ${isDarkMode
        ? 'bg-white text-black shadow-lg hover:bg-gray-200'
        : 'bg-black text-white shadow-lg hover:bg-gray-800'
      } scale-105`;
    }
    return `${base} ${isDarkMode
      ? 'bg-gray-900 text-gray-400 border border-gray-800 hover:bg-gray-800 hover:text-gray-200 hover:border-gray-700'
      : 'bg-white text-gray-500 border border-gray-300 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-400'
    }`;
  };

  return (
    <>
      {isFloating && <div style={{ height: `${searchBarHeight}px` }} />}

      <div
        id="advanced-search-bar"
        ref={searchBarRef}
        className={`transition-all duration-700 ease-in-out ${
          isFloating
            ? `fixed top-4 left-4 right-4 z-50 rounded-2xl shadow-2xl ${
                isDarkMode
                  ? 'bg-black/90 border border-gray-700'
                  : 'bg-white/90 border border-gray-300'
              } backdrop-blur-xl animate-in slide-in-from-top-8 fade-in duration-700`
            : `relative border rounded-xl ${
                isDarkMode
                  ? 'bg-gradient-to-br from-gray-900 to-black border-gray-800'
                  : 'bg-gradient-to-br from-gray-100 to-white border-gray-300'
              }`
        } overflow-hidden`}
      >
        {/* Credibility Category Filters */}
        <div className={`${isFloating ? 'max-w-7xl mx-auto' : ''} px-2 sm:px-4 pt-3 sm:pt-4`}>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {credibilityCategories.map((category) => (
              <button
                key={category.value}
                onClick={() => onCategoryChange(category.value)}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  selectedCategory === category.value
                    ? isDarkMode
                      ? 'bg-white text-black scale-105 shadow-lg'
                      : 'bg-black text-white scale-105 shadow-lg'
                    : isDarkMode
                    ? 'bg-gray-900 text-gray-300 border border-gray-800 hover:bg-gray-800 hover:text-white hover:scale-105 hover:border-gray-700'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:text-black hover:scale-105 hover:border-gray-400'
                } active:scale-95`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className={`${isFloating ? 'max-w-7xl mx-auto' : ''} p-2 sm:p-4`}>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative group">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 size-4 sm:size-5 transition-colors duration-300 ${
                isDarkMode
                  ? 'text-gray-500 group-focus-within:text-white'
                  : 'text-gray-400 group-focus-within:text-black'
              }`} />
              <input
                type="text"
                placeholder={
                  searchMode === 'verify'
                    ? 'Ingrese una afirmación para verificar con IA...'
                    : 'Busque noticias o ingrese una URL externa para analizar...'
                }
                value={filters.text}
                onChange={(e) => {
                  const text = e.target.value;
                  setFilters({ ...filters, text });

                  if (text.trim() === '') {
                    onSearch({ text: '' });
                  }
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className={`w-full pl-9 sm:pl-10 pr-10 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 text-sm sm:text-base ${
                  isDarkMode
                    ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:ring-white focus:border-white'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-black focus:border-black'
                }`}
              />
              {filters.text.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    setFilters({ text: '' });
                    onSearch({ text: '' });
                  }}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors duration-300 ${
                    isDarkMode
                      ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                      : 'text-gray-500 hover:text-black hover:bg-gray-100'
                  }`}
                  aria-label="Limpiar búsqueda"
                >
                  <X className="size-4 sm:size-5" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSearchMode('search')}
                className={modeBtnClass('search')}
              >
                <Search className="size-4" />
                <span>Buscar</span>
              </button>
              <button
                onClick={() => setSearchMode('verify')}
                className={modeBtnClass('verify')}
              >
                <ShieldCheck className="size-4" />
                <span>Verificar</span>
              </button>
            </div>
            <button
              onClick={handleSearch}
              disabled={isAnalyzing}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:scale-105 active:scale-95 transition-all duration-300 font-medium shadow-lg hover:shadow-xl text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                isDarkMode
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Analizando...</span>
                </div>
              ) : (
                <>{searchMode === 'verify' ? 'Verificar' : 'Buscar'}</>
              )}
            </button>
          </div>
        </div>

        {/* Advanced Filters - commented out */}
      </div>
    </>
  );
}
