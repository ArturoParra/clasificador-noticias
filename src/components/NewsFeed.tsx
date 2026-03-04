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
        <NewsGrid 
          selectedCategory={selectedCategory} 
          isDarkMode={isDarkMode}
          searchFilters={searchFilters}
        />
      </main>
    </>
  );
}
