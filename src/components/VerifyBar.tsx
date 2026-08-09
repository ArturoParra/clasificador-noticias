import { useState, useEffect, useRef } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { ApiHandler } from '../services/ApiHandler';

interface VerifyBarProps {
  isDarkMode: boolean;
  onExternalArticleAnalyzed?: (article: any) => void;
  onVerifyClaim?: (claim: string) => void;
}

export function VerifyBar({ isDarkMode, onExternalArticleAnalyzed, onVerifyClaim }: VerifyBarProps) {
  const [isFloating, setIsFloating] = useState(false);
  const [searchBarHeight, setSearchBarHeight] = useState(0);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const [originalTopPosition, setOriginalTopPosition] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [verifyText, setVerifyText] = useState('');

  useEffect(() => {
    if (searchBarRef.current) {
      const rect = searchBarRef.current.getBoundingClientRect();
      setOriginalTopPosition(rect.top + window.scrollY);
      setSearchBarHeight(searchBarRef.current.offsetHeight);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (originalTopPosition > 0) {
        const scrollPosition = window.scrollY;
        if (scrollPosition > originalTopPosition) {
          setIsFloating(true);
        } else {
          setIsFloating(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [originalTopPosition]);

  useEffect(() => {
    if (searchBarRef.current) {
      setSearchBarHeight(searchBarRef.current.offsetHeight);
    }
  }, []);

  const handleVerify = async () => {
    const searchText = verifyText.trim();
    if (!searchText) return;

    // Validación para aceptar URLs con www.
    const isUrl = searchText.startsWith('http://') || searchText.startsWith('https://') || searchText.startsWith('www.');

    if (isUrl) {
      const urlToSend = searchText.startsWith('www.') ? `https://${searchText}` : searchText;

      setIsAnalyzing(true);
      try {
        const externalArticle = await ApiHandler.analyzeExternalUrl(urlToSend);
        setVerifyText('');
        if (onExternalArticleAnalyzed) {
          onExternalArticleAnalyzed(externalArticle);
        }
      } catch (error) {
        console.error('Error analizando la URL externa:', error);
        alert("Falla de conexión con el servidor de análisis.");
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      // Treat as claim verification
      if (onVerifyClaim) {
        onVerifyClaim(searchText);
      }
      setVerifyText('');
    }
  };

  return (
    <>
      {isFloating && <div style={{ height: `${searchBarHeight}px` }} />}

      <div
        id="verify-bar"
        ref={searchBarRef}
        className={`transition-all duration-700 ease-in-out ${
          isFloating
            ? `fixed top-4 left-4 right-4 z-50 rounded-2xl shadow-2xl ${
                isDarkMode
                  ? 'bg-black/90 border border-gray-700'
                  : 'bg-white/90 border border-gray-300'
              } backdrop-blur-xl animate-in slide-in-from-top-8 fade-in duration-700`
            : `relative border rounded-xl ${
                isDarkMode
                  ? 'bg-gradient-to-br from-gray-900 to-black border-gray-800'
                  : 'bg-gradient-to-br from-gray-100 to-white border-gray-300'
              }`
        } overflow-hidden`}
      >
        <div className={`${isFloating ? 'max-w-7xl mx-auto' : ''} p-2 sm:p-4`}>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative group">
              <ShieldCheck className={`absolute left-3 top-1/2 -translate-y-1/2 size-4 sm:size-5 transition-colors duration-300 ${
                isDarkMode
                  ? 'text-gray-500 group-focus-within:text-white'
                  : 'text-gray-400 group-focus-within:text-black'
              }`} />
              <input
                type="text"
                placeholder="Ingrese una URL externa o afirmación para verificar con IA..."
                value={verifyText}
                onChange={(e) => setVerifyText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                className={`w-full pl-9 sm:pl-10 pr-10 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 text-sm sm:text-base ${
                  isDarkMode
                    ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:ring-white focus:border-white'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-black focus:border-black'
                }`}
              />
              {verifyText.trim() && (
                <button
                  type="button"
                  onClick={() => setVerifyText('')}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors duration-300 ${
                    isDarkMode
                      ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                      : 'text-gray-500 hover:text-black hover:bg-gray-100'
                  }`}
                  aria-label="Limpiar entrada"
                >
                  <X className="size-4 sm:size-5" />
                </button>
              )}
            </div>
            
            <button
              onClick={handleVerify}
              disabled={isAnalyzing || !verifyText.trim()}
              className={`flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:scale-105 active:scale-95 transition-all duration-300 font-medium shadow-lg hover:shadow-xl text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                isDarkMode
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {isAnalyzing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Analizando...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1.5">
                  <ShieldCheck className="size-4" />
                  <span>Verificar</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
