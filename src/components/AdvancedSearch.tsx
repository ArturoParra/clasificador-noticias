import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import type { NewsCategory, SearchFilters } from '../types/types';

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  isDarkMode: boolean;
  selectedCategory: NewsCategory;
  onCategoryChange: (category: NewsCategory) => void;
  onExternalArticleAnalyzed?: (article: any) => void; // Callback para cuando se analiza un artículo externo
}

/* const languages = [
  { code: '', label: 'Todos los Idiomas' },
  { code: 'en', label: 'Inglés' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Francés' },
  { code: 'de', label: 'Alemán' },
  { code: 'it', label: 'Italiano' },
  { code: 'pt', label: 'Portugués' },
  { code: 'ru', label: 'Ruso' },
  { code: 'zh', label: 'Chino' },
  { code: 'ja', label: 'Japonés' },
  { code: 'ar', label: 'Árabe' },
];

const countries = [
  { code: '', label: 'Todos los Países' },
  { code: 'us', label: 'Estados Unidos' },
  { code: 'gb', label: 'Reino Unido' },
  { code: 'ca', label: 'Canadá' },
  { code: 'au', label: 'Australia' },
  { code: 'de', label: 'Alemania' },
  { code: 'fr', label: 'Francia' },
  { code: 'es', label: 'España' },
  { code: 'it', label: 'Italia' },
  { code: 'br', label: 'Brasil' },
  { code: 'mx', label: 'México' },
  { code: 'in', label: 'India' },
  { code: 'jp', label: 'Japón' },
  { code: 'cn', label: 'China' },
];

const apiCategories = [
  { value: '', label: 'Todas las Categorías' },
  { value: 'business', label: 'Negocios' },
  { value: 'entertainment', label: 'Entretenimiento' },
  { value: 'health', label: 'Salud' },
  { value: 'science', label: 'Ciencia' },
  { value: 'sports', label: 'Deportes' },
  { value: 'technology', label: 'Tecnología' },
  { value: 'politics', label: 'Política' },
];
 */

const credibilityCategories: { value: NewsCategory; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'verdadera', label: 'Verdaderas' },
  { value: 'falsa', label: 'Falsas' },
  { value: 'sátira', label: 'Sátira' },
  { value: 'engañosa', label: 'Engañosas' },
];

export function AdvancedSearch({ onSearch, isDarkMode, selectedCategory, onCategoryChange, onExternalArticleAnalyzed }: AdvancedSearchProps) {
  const [isExpanded, /* setIsExpanded */] = useState(false);
  const [isFloating, setIsFloating] = useState(false);
  const [searchBarHeight, setSearchBarHeight] = useState(0);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const [originalTopPosition, setOriginalTopPosition] = useState(0);
  // nuevo estado para saber si esperamos a la IA
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    text: '',
  });

  // Capturar la posición inicial del componente
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
        
        // Activar floating cuando hemos scrolleado más allá del componente
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
  }, [isExpanded]);

  // Intercepcion de la busqueda para activar el estado de análisis
  const handleSearch = async () => {
    const searchText = filters.text.trim();
    if (!searchText) {
      onSearch({ text: '' });
      return;
    }
    
    const isUrl = searchText.startsWith('http://') || searchText.startsWith('https://');

    if (isUrl) {
      // Es una URL externa
      setIsAnalyzing(true);
      try {
        const response = await fetch('http://localhost:8000/api/analyze-external', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: searchText }),
        });
        
        if (response.ok) {
          const externalArticle = await response.json();
          // Limpieza del buscador
          setFilters({ text: '' });
          // Le avisamos al padre que tenemos una noticia nueva
          if (onExternalArticleAnalyzed) {
            onExternalArticleAnalyzed(externalArticle);
          }
        } else {
          alert("Error al analizar la URL. Verifique la validez del enlace.");
        }
      } catch (error) {
        console.error('Error analizando la URL externa:', error);
        alert("Falla de conexión con el servidor de análisis.");
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      // Es texto normal, usamos el buscador tradicional
      onSearch(filters);
    }
  };

  /* const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'credibilityMin') return value !== 0;
    if (key === 'credibilityMax') return value !== 100;
      sourceDomain: '',
      credibilityMin: 0,
      credibilityMax: 100,
    };
    setFilters(emptyFilters);
    onSearch(emptyFilters);
  };
  /* const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'credibilityMin') return value !== 0;
    if (key === 'credibilityMax') return value !== 100;
    return value !== '';
  }); */

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
                placeholder="Busque noticias o ingrese una URL externa para analizar..."
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
              {/* <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 font-medium text-sm sm:text-base ${
                  isDarkMode
                    ? 'bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-black'
                }`}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="size-4 transition-transform duration-300" />
                    <span className="hidden sm:inline">Menos Filtros</span>
                    <span className="sm:hidden">Menos</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="size-4 transition-transform duration-300" />
                    <span className="hidden sm:inline">Más Filtros</span>
                    <span className="sm:hidden">Filtros</span>
                  </>
                )}
              </button> */}
              <button
                onClick={handleSearch}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:scale-105 active:scale-95 transition-all duration-300 font-medium shadow-lg hover:shadow-xl text-sm sm:text-base ${
                  isDarkMode
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'bg-black text-white hover:bg-gray-800'
                }disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {/* Indicador visual de carga */}
                {isAnalyzing ? (
                  <>
                    <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Analizando...</span>
                  </>
                ) : (
                  <>Buscar</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {/* isExpanded && (
          <div className={`${isFloating ? 'max-w-7xl mx-auto' : ''} px-2 sm:px-4 pb-3 sm:pb-4 space-y-3 sm:space-y-4 border-t pt-3 sm:pt-4 animate-in fade-in slide-in-from-top-2 duration-500 ${
            isDarkMode ? 'border-gray-800' : 'border-gray-200'
          }`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              
              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-1.5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-700'
                }`}>
                  Idioma
                </label>
                <select
                  value={filters.language}
                  onChange={(e) => setFilters({ ...filters, language: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 cursor-pointer text-sm sm:text-base ${
                    isDarkMode
                      ? 'bg-gray-900 border-gray-700 text-white focus:ring-white focus:border-white hover:border-gray-600'
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-black focus:border-black hover:border-gray-400'
                  }`}
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              
              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-1.5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-700'
                }`}>
                  País
                </label>
                <select
                  value={filters.country}
                  onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 cursor-pointer text-sm sm:text-base ${
                    isDarkMode
                      ? 'bg-gray-900 border-gray-700 text-white focus:ring-white focus:border-white hover:border-gray-600'
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-black focus:border-black hover:border-gray-400'
                  }`}
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.label}
                    </option>
                  ))}
                </select>
              </div>

              
              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-1.5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-700'
                }`}>
                  Categoría
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 cursor-pointer text-sm sm:text-base ${
                    isDarkMode
                      ? 'bg-gray-900 border-gray-700 text-white focus:ring-white focus:border-white hover:border-gray-600'
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-black focus:border-black hover:border-gray-400'
                  }`}
                >
                  {apiCategories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              
              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-1.5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-700'
                }`}>
                  Dominio de Fuente
                </label>
                <input
                  type="text"
                  placeholder="ej., bbc.com"
                  value={filters.sourceDomain}
                  onChange={(e) => setFilters({ ...filters, sourceDomain: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 text-sm sm:text-base ${
                    isDarkMode
                      ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:ring-white focus:border-white hover:border-gray-600'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-black focus:border-black hover:border-gray-400'
                  }`}
                />
              </div>
            </div>

            
            <div className="col-span-full">
              <label className={`block text-xs sm:text-sm font-medium mb-3 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-700'
              }`}>
                Rango de Credibilidad: {filters.credibilityMin}% - {filters.credibilityMax}%
              </label>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                      Mínimo
                    </span>
                    <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      {filters.credibilityMin}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={filters.credibilityMin}
                    onChange={(e) => {
                      const newMin = parseInt(e.target.value);
                      setFilters({ 
                        ...filters, 
                        credibilityMin: newMin,
                        credibilityMax: Math.max(newMin, filters.credibilityMax)
                      });
                    }}
                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-gray-800 accent-white' 
                        : 'bg-gray-200 accent-black'
                    }`}
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                      Máximo
                    </span>
                    <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      {filters.credibilityMax}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={filters.credibilityMax}
                    onChange={(e) => {
                      const newMax = parseInt(e.target.value);
                      setFilters({ 
                        ...filters, 
                        credibilityMax: newMax,
                        credibilityMin: Math.min(filters.credibilityMin, newMax)
                      });
                    }}
                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-gray-800 accent-white' 
                        : 'bg-gray-200 accent-black'
                    }`}
                  />
                </div>
              </div>
            </div>

            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-1.5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-700'
                }`}>
                  Desde Fecha
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 text-sm sm:text-base ${
                    isDarkMode
                      ? 'bg-gray-900 border-gray-700 text-white focus:ring-white focus:border-white hover:border-gray-600'
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-black focus:border-black hover:border-gray-400'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-1.5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-700'
                }`}>
                  Hasta Fecha
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 text-sm sm:text-base ${
                    isDarkMode
                      ? 'bg-gray-900 border-gray-700 text-white focus:ring-white focus:border-white hover:border-gray-600'
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-black focus:border-black hover:border-gray-400'
                  }`}
                />
              </div>
            </div>

            
            {hasActiveFilters && (
              <div className="flex justify-center sm:justify-end">
                <button
                  onClick={handleClear}
                  className={`px-4 py-2 text-xs sm:text-sm font-medium flex items-center gap-1.5 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 ${
                    isDarkMode
                      ? 'text-gray-400 hover:text-white hover:bg-gray-900'
                      : 'text-gray-600 hover:text-black hover:bg-gray-100'
                  }`}
                >
                  <X className="size-4" />
                  Limpiar Todos los Filtros
                </button>
              </div>
            )}
          </div>
        ) */}
      </div>
    </>
  );
}