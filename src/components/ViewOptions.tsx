import { Grid3x3, List, ArrowUpDown } from 'lucide-react';

export type ViewMode = 'grid' | 'list';
export type SortBy = 'newest' | 'oldest' | 'credibility-high' | 'credibility-low';

interface ViewOptionsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: SortBy;
  onSortByChange: (sort: SortBy) => void;
  isDarkMode: boolean;
  totalResults: number;
}

const sortOptions: { value: SortBy; label: string }[] = [
  { value: 'newest', label: 'Más Recientes' },
  { value: 'oldest', label: 'Más Antiguos' },
  { value: 'credibility-high', label: 'Mayor Credibilidad' },
  { value: 'credibility-low', label: 'Menor Credibilidad' },
];

export function ViewOptions({ 
  viewMode, 
  onViewModeChange, 
  sortBy, 
  onSortByChange, 
  isDarkMode,
  totalResults 
}: ViewOptionsProps) {
  return (
    <div className={`mb-6 p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300 ${
      isDarkMode
        ? 'bg-gradient-to-br from-gray-900 to-black border-gray-800'
        : 'bg-gradient-to-br from-gray-100 to-white border-gray-300'
    }`}>
      {/* Results Count */}
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Mostrando
        </span>
        <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
          {totalResults}
        </span>
        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {totalResults === 1 ? 'artículo' : 'artículos'}
        </span>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {/* Sort By Dropdown */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className={`size-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as SortBy)}
            className={`px-3 py-2 rounded-lg text-sm font-medium border cursor-pointer focus:outline-none focus:ring-2 transition-all duration-300 ${
              isDarkMode
                ? 'bg-gray-900 border-gray-700 text-white focus:ring-white focus:border-white hover:bg-gray-800 hover:border-gray-600'
                : 'bg-white border-gray-300 text-gray-900 focus:ring-black focus:border-black hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className={`flex items-center gap-1 p-1 rounded-lg border ${
          isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-100 border-gray-300'
        }`}>
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 rounded-md transition-all duration-300 hover:scale-110 active:scale-95 ${
              viewMode === 'grid'
                ? isDarkMode
                  ? 'bg-white text-black shadow-lg'
                  : 'bg-black text-white shadow-lg'
                : isDarkMode
                ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                : 'text-gray-600 hover:text-black hover:bg-gray-200'
            }`}
            aria-label="Vista en grilla"
          >
            <Grid3x3 className="size-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 rounded-md transition-all duration-300 hover:scale-110 active:scale-95 ${
              viewMode === 'list'
                ? isDarkMode
                  ? 'bg-white text-black shadow-lg'
                  : 'bg-black text-white shadow-lg'
                : isDarkMode
                ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                : 'text-gray-600 hover:text-black hover:bg-gray-200'
            }`}
            aria-label="Vista en lista"
          >
            <List className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
