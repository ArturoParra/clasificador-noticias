import { useNews } from '../context/NewsContext';
import { Header } from './Header';
import { NewsGrid } from './NewsGrid';

export function NewsFeed() {
  const { 
    isDarkMode, 
    toggleTheme,
    selectedCategory,
    setSelectedCategory,
    searchFilters,
    setSearchFilters,
    setArticles // funcion que actualiza el estado global con el artículo analizado
  } = useNews();

  return (
    <>
      <Header 
        onSearch={setSearchFilters} 
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        // Pasamos la función para actualizar el estado global con el artículo analizado
        onExternalArticleAnalyzed={newArticle => {
          setArticles(prevArticles => [newArticle, ...prevArticles]);
        }}  
      />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <NewsGrid 
          selectedCategory={selectedCategory} 
          isDarkMode={isDarkMode}
          searchFilters={searchFilters}
        />
      </main>
    </>
  );
}
