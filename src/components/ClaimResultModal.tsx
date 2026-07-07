import { ExternalLink, Loader2, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { CredibilityBadge } from './CredibilityBadge';
import { ScoreBar } from './ScoreBar';
import type { NewsCategory } from '../types/types';

interface ClaimResult {
  id: string;
  claim: string;
  title: string;
  description: string;
  classification: string;
  credibilityScore: number;
  summary: string;
  evidence_urls: string[];
  source: string;
  date: string;
}

interface ClaimResultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDarkMode: boolean;
  claim: string;
  result: ClaimResult | null;
  isLoading: boolean;
  error: string | null;
}

export function ClaimResultModal({
  open,
  onOpenChange,
  isDarkMode,
  claim,
  result,
  isLoading,
  error,
}: ClaimResultModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-xl ${isDarkMode ? 'bg-gray-950 border-gray-800 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`}>
        <DialogHeader>
          <DialogTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Verificación de Afirmación
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="relative">
              <Loader2 className={`size-10 animate-spin ${isDarkMode ? 'text-white' : 'text-black'}`} />
              <Search className={`absolute inset-0 size-10 p-2 animate-pulse ${isDarkMode ? 'text-white/50' : 'text-black/50'}`} />
            </div>
            <p className={`text-sm font-medium text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Analizando afirmación con agentes de IA...
            </p>
            <p className={`text-xs text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Los agentes están buscando evidencia en internet para verificar la información.
            </p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <p className={`text-sm font-medium text-center ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
              {error}
            </p>
          </div>
        )}

        {result && !isLoading && !error && (
          <div className="space-y-5">
            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50/50 border-gray-200'}`}>
              <p className={`text-xs font-medium mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Afirmación analizada
              </p>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                "{claim}"
              </p>
            </div>

            <div className="flex items-center justify-between">
              <CredibilityBadge
                classification={(result.classification || 'none') as Exclude<NewsCategory, 'all'>}
                score={result.credibilityScore}
                size="lg"
              />
              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {result.source} • {result.date?.split(' ')[0]}
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Puntuación de credibilidad
                </span>
                <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {result.credibilityScore}%
                </span>
              </div>
              <ScoreBar score={result.credibilityScore} isDarkMode={isDarkMode} />
            </div>

            {result.summary && (
              <div>
                <h4 className={`text-xs font-semibold mb-2 uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Resumen del análisis
                </h4>
                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {result.summary}
                </p>
              </div>
            )}

            {result.evidence_urls && result.evidence_urls.length > 0 && (
              <div>
                <h4 className={`text-xs font-semibold mb-2 uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Evidencia encontrada ({result.evidence_urls.length})
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {result.evidence_urls.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs transition-all duration-300 hover:scale-[1.02] ${
                        isDarkMode
                          ? 'bg-gray-900/50 border-gray-800 text-gray-300 hover:bg-gray-900 hover:text-white hover:border-gray-700'
                          : 'bg-gray-50/50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-black hover:border-gray-300'
                      }`}
                    >
                      <ExternalLink className="size-3.5 shrink-0" />
                      <span className="truncate">{url}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
