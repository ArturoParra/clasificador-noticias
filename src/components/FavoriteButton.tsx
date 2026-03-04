import { Bookmark } from 'lucide-react';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: (e: React.MouseEvent) => void;
  isDarkMode: boolean;
}

export function FavoriteButton({ isFavorite, onToggle, isDarkMode }: FavoriteButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={`p-2 rounded-lg backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg ${
        isFavorite
          ? isDarkMode
            ? 'bg-white/90 text-black hover:bg-white'
            : 'bg-black/90 text-white hover:bg-black'
          : isDarkMode
          ? 'bg-gray-900/80 text-gray-400 hover:bg-gray-900 hover:text-white border border-gray-700'
          : 'bg-white/80 text-gray-600 hover:bg-white hover:text-black border border-gray-300'
      }`}
      aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      <Bookmark 
        className={`size-4 transition-all duration-300 ${
          isFavorite ? 'fill-current' : ''
        }`}
      />
    </button>
  );
}
