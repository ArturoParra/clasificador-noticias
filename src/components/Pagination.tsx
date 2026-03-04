import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  isDarkMode: boolean;
}

const itemsPerPageOptions = [6, 12, 24, 48];

export function Pagination({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  isDarkMode,
}: PaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className={`mt-8 p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 ${
      isDarkMode
        ? 'bg-gradient-to-br from-gray-900 to-black border-gray-800'
        : 'bg-gradient-to-br from-gray-100 to-white border-gray-300'
    }`}>
      {/* Items per page selector */}
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Mostrar:
        </span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border cursor-pointer focus:outline-none focus:ring-2 transition-all duration-300 ${
            isDarkMode
              ? 'bg-gray-900 border-gray-700 text-white focus:ring-white focus:border-white hover:bg-gray-800'
              : 'bg-white border-gray-300 text-gray-900 focus:ring-black focus:border-black hover:bg-gray-50'
          }`}
        >
          {itemsPerPageOptions.map((option) => (
            <option key={option} value={option}>
              {option} por página
            </option>
          ))}
        </select>
      </div>

      {/* Page info */}
      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
          {startItem}-{endItem}
        </span>
        {' '}de{' '}
        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
          {totalItems}
        </span>
      </div>

      {/* Page navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
            isDarkMode
              ? 'hover:bg-gray-800 text-gray-400 hover:text-white disabled:hover:bg-transparent'
              : 'hover:bg-gray-200 text-gray-600 hover:text-black disabled:hover:bg-transparent'
          }`}
          aria-label="Página anterior"
        >
          <ChevronLeft className="size-5" />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            typeof page === 'number' ? (
              <button
                key={index}
                onClick={() => onPageChange(page)}
                className={`min-w-[2.5rem] px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
                  currentPage === page
                    ? isDarkMode
                      ? 'bg-white text-black shadow-lg'
                      : 'bg-black text-white shadow-lg'
                    : isDarkMode
                    ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                    : 'text-gray-600 hover:text-black hover:bg-gray-200'
                }`}
              >
                {page}
              </button>
            ) : (
              <span
                key={index}
                className={`px-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}
              >
                {page}
              </span>
            )
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
            isDarkMode
              ? 'hover:bg-gray-800 text-gray-400 hover:text-white disabled:hover:bg-transparent'
              : 'hover:bg-gray-200 text-gray-600 hover:text-black disabled:hover:bg-transparent'
          }`}
          aria-label="Página siguiente"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}
