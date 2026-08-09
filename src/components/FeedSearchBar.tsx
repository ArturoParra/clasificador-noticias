import { useState } from 'react';
import { Search, X } from 'lucide-react';
import type { NewsCategory, SearchFilters } from '../types/types';

interface FeedSearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  isDarkMode: boolean;
  selectedCategory: NewsCategory;
  onCategoryChange: (category: NewsCategory) => void;
}

const credibilityCategories: { value: NewsCategory; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'verdadera', label: 'Verdaderas' },
  { value: 'falsa', label: 'Falsas' },
  { value: 'sátira', label: 'Sátira' },
  { value: 'engañosa', label: 'Engañosas' },
];

export function FeedSearchBar({ onSearch, isDarkMode, selectedCategory, onCategoryChange }: FeedSearchBarProps) {
  const [filters, setFilters] = useState<SearchFilters>({ text: '' });

  const handleSearch = () => {
    onSearch(filters);
  };

  return (
    <div
      className={`relative border rounded-xl ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 to-black border-gray-800'
          : 'bg-gradient-to-br from-gray-100 to-white border-gray-300'
      } overflow-hidden mb-6 mt-6`}
    >
      {/* Credibility Category Filters */}
      <div className="px-2 sm:px-4 pt-3 sm:pt-4">
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
      <div className="p-2 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative group">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 size-4 sm:size-5 transition-colors duration-300 ${
              isDarkMode
                ? 'text-gray-500 group-focus-within:text-white'
                : 'text-gray-400 group-focus-within:text-black'
            }`} />
            <input
              type="text"
              placeholder="Buscar en el feed..."
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
          
          <button
            onClick={handleSearch}
            className={`flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:scale-105 active:scale-95 transition-all duration-300 font-medium shadow-lg hover:shadow-xl text-sm sm:text-base ${
              isDarkMode
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <Search className="size-4" />
              <span>Buscar</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
