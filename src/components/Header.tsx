import { ShieldCheck, Sun, Moon, Bookmark } from 'lucide-react';
import { Link } from 'react-router';
import { AdvancedSearch } from './AdvancedSearch';
import type { SearchFilters, NewsCategory } from '../types/types';
import { useNews } from '../context/NewsContext';

interface HeaderProps {
  onSearch?: (filters: SearchFilters) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  selectedCategory: NewsCategory;
  onCategoryChange: (category: NewsCategory) => void;
  onExternalArticleAnalyzed?: (article: any) => void; // Callback para cuando se analiza un artículo externo
}

export function Header({ onSearch, isDarkMode, onToggleTheme, selectedCategory, onCategoryChange, onExternalArticleAnalyzed }: HeaderProps) {
  const { bookmarks } = useNews();
  const favoritesCount = bookmarks.length;

  const handleSearch = (filters: SearchFilters) => {
    if (onSearch) {
      onSearch(filters);
    }
    console.log('Search filters:', filters);
  };

  return (
    <header className={`transition-colors duration-500 border-b ${
      isDarkMode 
        ? 'bg-black border-gray-800' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-6 pb-2">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <ShieldCheck className={`size-8 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-black'
            }`} />
            <div>
              <h1 className={`text-3xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>VeritasCop</h1>
              <p className={`text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Análisis de Credibilidad de Noticias con IA</p>
            </div>
          </Link>
          
          <div className="flex items-center gap-2">
            {/* Favorites Counter */}
            <Link to="/saved">
              <div className={`relative px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                isDarkMode
                  ? 'bg-gray-900 border border-gray-800 hover:bg-gray-800'
                  : 'bg-gray-100 border border-gray-300 hover:bg-gray-200'
              }`}>
                <Bookmark className={`size-5 ${
                  favoritesCount > 0 
                    ? isDarkMode ? 'text-white fill-white' : 'text-black fill-black'
                    : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`} />
                <span className={`text-sm font-bold ${
                  isDarkMode ? 'text-white' : 'text-black'
                }`}>
                  {favoritesCount}
                </span>
                {favoritesCount > 0 && (
                  <span className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    guardados
                  </span>
                )}
              </div>
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className={`p-3 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 ${
                isDarkMode
                  ? 'bg-gray-900 hover:bg-gray-800 text-white border border-gray-800'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300'
              }`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="size-5" />
              ) : (
                <Moon className="size-5" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 pb-6">
        <AdvancedSearch 
          onSearch={handleSearch} 
          isDarkMode={isDarkMode}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
          onExternalArticleAnalyzed={onExternalArticleAnalyzed} // Pasamos el callback al componente de búsqueda avanzada
        />
      </div>
    </header>
  );
}