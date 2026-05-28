import { X } from 'lucide-react';
import type { NewsArticle } from '../data/mockNews.ts';
import { CredibilityBadge } from './CredibilityBadge';
import { ScoreBar } from './ScoreBar';
import { AnalysisBreakdown } from './AnalysisBreakdown';

interface NewsModalProps {
  article: NewsArticle;
  onClose: () => void;
  isDarkMode: boolean;
}

export function NewsModal({ article, onClose, isDarkMode }: NewsModalProps) {
  return (
    <div 
      className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300 ${
        isDarkMode ? 'bg-black/90' : 'bg-gray-900/60'
      }`}
      onClick={onClose}
    >
      <div 
        className={`rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-900 to-black border-gray-800' 
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`sticky top-0 border-b p-6 flex items-start justify-between backdrop-blur-lg ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-900 to-black border-gray-800' 
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
        }`}>
          <div className="flex-1">
            <div className="mb-3">
              <CredibilityBadge classification={article.classification}/>
            </div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {article.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`ml-4 p-2 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 group ${
              isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            }`}
          >
            <X className={`size-5 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-600 group-hover:text-black'
            }`} />
          </button>
        </div>

        <div className="p-6">
          <div className={`rounded-xl overflow-hidden mb-6 border ${
            isDarkMode ? 'border-gray-800' : 'border-gray-200'
          }`}>
            <img 
              src={article.image} 
              alt={article.title}
              className="w-full aspect-video object-cover"
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Puntuación General de Credibilidad
              </span>
              <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {article.credibilityScore}%
              </span>
            </div>
            <ScoreBar score={article.credibilityScore} isDarkMode={isDarkMode} />
          </div>

          <div className="mb-6">
            <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Resumen del Artículo
            </h3>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{article.description}</p>
          </div>

          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className={isDarkMode ? 'text-gray-500' : 'text-gray-600'}>Fuente:</span>
                <span className={`ml-2 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  {article.source}
                </span>
              </div>
              <div>
                <span className={isDarkMode ? 'text-gray-500' : 'text-gray-600'}>Fecha:</span>
                <span className={`ml-2 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  {article.date}
                </span>
              </div>
            </div>
          </div>

          <AnalysisBreakdown analysis={article.analysis} isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );
}