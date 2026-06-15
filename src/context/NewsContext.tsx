import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { NewsCategory, SearchFilters } from '../types/types';
import type { NewsArticle } from '../data/mockNews.ts';
import { ApiHandler } from '../services/ApiHandler.ts';

interface NewsContextType {
  articles: NewsArticle[];
  setArticles: React.Dispatch<React.SetStateAction<NewsArticle[]>>;
  bookmarks: string[];
  toggleBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
  isDarkMode: boolean;
  toggleTheme: () => void;
  searchFilters: SearchFilters;
  setSearchFilters: (filters: SearchFilters) => void;
  selectedCategory: NewsCategory;
  setSelectedCategory: (category: NewsCategory) => void;
  loading: boolean;
  refresh: () => void;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export const NewsProvider = ({ children }: { children: ReactNode }) => {
  // Theme state with localStorage persistence
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    return saved ? JSON.parse(saved) : true; // Default to dark mode
  });

  // Bookmarks state with localStorage persistence
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const saved = localStorage.getItem('bookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  // Articles state (could be fetched, currently mock)
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchNews = async () => {
      try {
        setLoading(true);
        const data = await ApiHandler.getNews();
        setArticles(data);
        console.log('Fetched news articles:', data);
      } catch (error) {
        console.error('Failed to fetch news, using mock data:', error);
      }
    };

  useEffect(() => {
    fetchNews();
  }, []);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('all');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    text: ''/*,
    language: '',
    country: '',
    category: '',
    dateFrom: '',
    dateTo: '',
    sourceDomain: '',
    credibilityMin: 0,
    credibilityMax: 100,
    */
  });

  // Effects for persistence
  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(isDarkMode));
    // Apply theme class to body/html if needed, but Layout handles wrapper class
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Handlers
  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const toggleBookmark = (id: string) => {
    setBookmarks(prev => 
      prev.includes(id) 
        ? prev.filter(b => b !== id) 
        : [...prev, id]
    );
  };

  const isBookmarked = (id: string) => bookmarks.includes(id);

  return (
    <NewsContext.Provider value={{
      articles,
      setArticles,
      loading,
      refresh: fetchNews,
      bookmarks,
      toggleBookmark,
      isBookmarked,
      isDarkMode,
      toggleTheme,
      searchFilters,
      setSearchFilters,
      selectedCategory,
      setSelectedCategory
    }}>
      {children}
    </NewsContext.Provider>
  );
};

export const useNews = () => {
  const context = useContext(NewsContext);
  if (context === undefined) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
};
