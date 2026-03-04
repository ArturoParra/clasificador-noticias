import { useNews } from '../context/NewsContext';
import { Header } from './Header';
import { NewsGrid } from './NewsGrid';
import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

export function SavedArticles() {
  const { 
    isDarkMode, 
    toggleTheme,
    selectedCategory,
    setSelectedCategory,
    searchFilters,
    setSearchFilters
  } = useNews();

  return (
    <>
      <Header 
        onSearch={setSearchFilters} 
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Artículos Guardados
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Tu colección personal de noticias verificadas
            </p>
          </div>
          <Button 
            asChild
            variant="outline"
            className={`${isDarkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : ''}`}
          >
            <Link to="/feed" className="flex items-center gap-2">
              <ArrowLeft className="size-4" />
              Volver al Feed
            </Link>
          </Button>
        </div>
        
        <NewsGrid 
          selectedCategory={selectedCategory} 
          isDarkMode={isDarkMode}
          searchFilters={searchFilters}
          showOnlyFavorites={true}
          showStatistics={false}
        />
      </main>
    </>
  );
}
