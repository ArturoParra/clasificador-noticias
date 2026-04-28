import { Calendar, TrendingUp } from 'lucide-react';
import type { NewsArticle } from '../data/mockNews.ts';
import { CredibilityBadge } from './CredibilityBadge';
import { ScoreBar } from './ScoreBar';
import { FavoriteButton } from './FavoriteButton';

interface NewsCardProps {
  article: NewsArticle;
  onClick: () => void;
  isDarkMode: boolean;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export function NewsCard({ article, onClick, isDarkMode, isFavorite, onToggleFavorite }: NewsCardProps) {
  return (
    <div 
      className={`rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden border group hover:scale-[1.02] active:scale-[0.98] ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 to-black border-gray-800 hover:border-gray-700'
          : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="relative">
        <img 
          src={article.image} 
          alt={article.title}
          className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
          onClick={onClick}
        />
        <div className="absolute top-2 left-2">
          <CredibilityBadge classification={article.classification} />
        </div>
        <div className="absolute top-2 right-2">
          <FavoriteButton
            isFavorite={isFavorite}
            onToggle={(e) => {
              e.stopPropagation();
              onToggleFavorite(article.id);
            }}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
      
      <div className="p-5" onClick={onClick}>
        <h3 className={`font-bold text-lg mb-2 line-clamp-2 transition-colors duration-300 ${
          isDarkMode ? 'text-white group-hover:text-gray-200' : 'text-gray-900 group-hover:text-gray-700'
        }`}>
          {article.title}
        </h3>
        
        <p className={`text-sm mb-4 line-clamp-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {article.description}
        </p>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Puntuación de Credibilidad
            </span>
            <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {article.credibilityScore}%
            </span>
          </div>
          <ScoreBar score={article.credibilityScore} isDarkMode={isDarkMode} />
        </div>
        
        <div className={`flex items-center justify-between text-xs pt-3 border-t ${
          isDarkMode ? 'text-gray-500 border-gray-800' : 'text-gray-500 border-gray-200'
        }`}>
          <div className="flex items-center gap-1">
            <Calendar className="size-3" />
            <span>{article.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="size-3" />
            <span>{article.source}</span>
          </div>
        </div>
      </div>
    </div>
  );
}