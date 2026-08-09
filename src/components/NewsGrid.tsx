import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import type { NewsCategory } from '../types/types';
import { NewsCard } from './NewsCard';
import { NewsCardList } from './NewsCardList';
import { ViewOptions, type ViewMode, type SortBy } from './ViewOptions';
import { Statistics } from './Statistics';
import { Pagination } from './Pagination';
import type { SearchFilters } from '../types/types';
import { useNews } from '../context/NewsContext';
import { FeedSearchBar } from './FeedSearchBar';

interface NewsGridProps {
  selectedCategory: NewsCategory;
  isDarkMode: boolean;
  searchFilters: SearchFilters;
  showOnlyFavorites?: boolean;
  showStatistics?: boolean;
  onSearch?: (filters: SearchFilters) => void;
  onCategoryChange?: (category: NewsCategory) => void;
}

export function NewsGrid({ selectedCategory, isDarkMode, searchFilters, showOnlyFavorites = false, showStatistics = true, onSearch, onCategoryChange }: NewsGridProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { articles, bookmarks, toggleBookmark } = useNews();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Apply all filters
  const filteredNews = useMemo(() => {
    let filtered = [...articles];

    console.log(filtered)
    console.log(articles)

    // Favorites filter
    if (showOnlyFavorites) {
      filtered = filtered.filter(article => bookmarks.includes(article.id));
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.classification === selectedCategory);
    }

    // Text search filter
    if (searchFilters.text) {
      const searchLower = searchFilters.text.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchLower) ||
        article.description.toLowerCase().includes(searchLower)
      );
    }

    console.log(filtered)

    return filtered;
  }, [selectedCategory, searchFilters, articles, bookmarks, showOnlyFavorites]);

  // Sort news based on selected option
  const sortedNews = useMemo(() => {
    const sorted = [...filteredNews];

    console.log(filteredNews)
    console.log(sorted)
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'credibility-high':
        return sorted.sort((a, b) => b.credibilityScore - a.credibilityScore);
      case 'credibility-low':
        return sorted.sort((a, b) => a.credibilityScore - b.credibilityScore);
      default:
        return sorted;
    }
  }, [filteredNews, sortBy]);

  // Calculate pagination
  const totalPages = Math.ceil(sortedNews.length / itemsPerPage);
  const paginatedNews = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedNews.slice(startIndex, endIndex);
  }, [sortedNews, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchFilters, sortBy]);

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  return (
    <>
      {showStatistics && <Statistics articles={sortedNews} isDarkMode={isDarkMode} />}
      
      {showStatistics && onSearch && onCategoryChange && (
        <FeedSearchBar 
          onSearch={onSearch}
          isDarkMode={isDarkMode}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
        />
      )}
      
      <ViewOptions
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        isDarkMode={isDarkMode}
        totalResults={sortedNews.length}
      />

      {paginatedNews.length > 0 ? (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedNews.map((article) => (
                <NewsCard 
                  key={article.id} 
                  article={article} 
                  onClick={() => navigate(`/article/${article.id}`, { state: { from: location.pathname } })}
                  isDarkMode={isDarkMode}
                  isFavorite={bookmarks.includes(article.id)}
                  onToggleFavorite={toggleBookmark}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedNews.map((article) => (
                <NewsCardList
                  key={article.id}
                  article={article}
                  onClick={() => navigate(`/article/${article.id}`, { state: { from: location.pathname } })}
                  isDarkMode={isDarkMode}
                  isFavorite={bookmarks.includes(article.id)}
                  onToggleFavorite={toggleBookmark}
                />
              ))}
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={sortedNews.length}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            isDarkMode={isDarkMode}
          />
        </>
      ) : (
        <div className={`text-center py-16 px-4 rounded-xl border ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-900 to-black border-gray-800' 
            : 'bg-gradient-to-br from-gray-100 to-white border-gray-200'
        }`}>
          <p className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {showOnlyFavorites ? 'No tienes artículos guardados' : 'No se encontraron artículos'}
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
            {showOnlyFavorites 
              ? 'Guarda artículos interesantes para leerlos más tarde' 
              : 'Intenta ajustar los filtros de búsqueda'}
          </p>
        </div>
      )}
    </>
  );
}
