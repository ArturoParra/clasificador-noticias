import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import type { AnalysisFactor } from '../data/mockNews.ts';

interface AnalysisBreakdownProps {
  analysis: AnalysisFactor[];
  isDarkMode: boolean;
}

export function AnalysisBreakdown({ analysis, isDarkMode }: AnalysisBreakdownProps) {
  const getStatusIcon = (status: 'positive' | 'negative' | 'neutral', isDark: boolean) => {
    switch (status) {
      case 'positive':
        return <CheckCircle2 className={`size-5 ${isDark ? 'text-white' : 'text-black'}`} />;
      case 'negative':
        return <XCircle className={`size-5 ${isDark ? 'text-gray-500' : 'text-gray-600'}`} />;
      case 'neutral':
        return <AlertCircle className={`size-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />;
    }
  };

  return (
    <div>
      <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Desglose del Análisis de IA
      </h3>
      <div className="space-y-4">
        {analysis.map((factor, index) => (
          <div 
            key={index} 
            className={`border rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] ${
              isDarkMode
                ? 'bg-gray-900/50 border-gray-800 hover:bg-gray-900 hover:border-gray-700'
                : 'bg-gray-50/50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="transition-transform duration-300 hover:scale-110">
                {getStatusIcon(factor.status, isDarkMode)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {factor.factor}
                  </h4>
                  <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {factor.score}%
                  </span>
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {factor.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}