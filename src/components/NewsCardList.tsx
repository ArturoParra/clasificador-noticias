import { Calendar, TrendingUp } from 'lucide-react';
import type { NewsArticle } from '../data/mockNews.ts';
import { CredibilityBadge } from './CredibilityBadge';
import { ScoreBar } from './ScoreBar';
import { FavoriteButton } from './FavoriteButton';

interface NewsCardListProps {
  article: NewsArticle;
  onClick: () => void;
  isDarkMode: boolean;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export function NewsCardList({ article, onClick, isDarkMode, isFavorite, onToggleFavorite }: NewsCardListProps) {
  return (
    <div 
      className={`rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden border group hover:scale-[1.01] active:scale-[0.99] ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 to-black border-gray-800 hover:border-gray-700'
          : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image Section */}
        <div className="sm:w-64 flex-shrink-0 relative">
          <img 
            src={article.image} 
            alt={article.title}
            className="w-full h-48 sm:h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onClick={onClick}
          />
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

        {/* Content Section */}
        <div className="flex-1 p-5 flex flex-col justify-between" onClick={onClick}>
          <div>
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className={`font-bold text-lg line-clamp-2 transition-colors duration-300 flex-1 ${
                isDarkMode ? 'text-white group-hover:text-gray-200' : 'text-gray-900 group-hover:text-gray-700'
              }`}>
                {article.title}
              </h3>
              <CredibilityBadge classification={article.classification} />
            </div>
            
            <p className={`text-sm mb-4 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {article.description}
            </p>
          </div>

          <div className="space-y-3">
            {/* Credibility Score */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Credibilidad
                </span>
                <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {article.credibilityScore}%
                </span>
              </div>
              <ScoreBar score={article.credibilityScore} isDarkMode={isDarkMode} />
            </div>
            
            {/* Metadata */}
            <div className={`flex flex-wrap items-center gap-4 text-xs pt-3 border-t ${
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
      </div>
    </div>
  );
}