import { useState, useEffect, useRef, useMemo } from 'react';
import { Shield, FileCheck, History, Plus, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { useNews } from '../context/NewsContext.tsx';
import { useNavigate } from 'react-router';

interface StatisticsProps {
  isDarkMode: boolean;
  onViewHistory?: () => void;
  onNewVerification?: () => void;
}

export function Statistics({ isDarkMode, onNewVerification }: StatisticsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [animatingIndices, setAnimatingIndices] = useState<Set<number>>(new Set());
  const prevValuesRef = useRef<(string | number)[]>([]);
  const navigate = useNavigate();
  const { articles, claims } = useNews();

  useEffect(() => {
    const saved = localStorage.getItem('statistics-collapsed');
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('statistics-collapsed', JSON.stringify(newState));
  };

  const { totalItems, averageCredibility, lowCredibility } = useMemo(() => {
    const allItems = [...articles, ...(claims || [])];
    const total = allItems.length;

    const average = total > 0
      ? Math.round(allItems.reduce((sum, item) => sum + (item.credibilityScore || 0), 0) / total)
      : 0;

    const lowCred = allItems.filter(item => (item.credibilityScore || 0) < 50).length;

    return {
      totalItems: total,
      averageCredibility: average,
      lowCredibility: lowCred
    };
  }, [articles, claims]);

  // Animaciones para las dos primeras tarjetas (valores numéricos)
  useEffect(() => {
    const currentValues = [averageCredibility, totalItems];
    const prevValues = prevValuesRef.current;

    if (prevValues.length > 0) {
      const changedIndices = new Set<number>();
      currentValues.forEach((value, index) => {
        if (value !== prevValues[index]) {
          changedIndices.add(index);
        }
      });

      if (changedIndices.size > 0) {
        setAnimatingIndices(changedIndices);
        setTimeout(() => setAnimatingIndices(new Set()), 300);
      }
    }
    prevValuesRef.current = currentValues;
  }, [averageCredibility, totalItems]);

  return (
    <div className={`mb-6 rounded-xl border transition-all duration-300 ${
      isCollapsed ? 'p-4' : 'p-6'
    } ${
      isDarkMode
        ? 'bg-gradient-to-br from-gray-900 to-black border-gray-800'
        : 'bg-gradient-to-br from-gray-100 to-white border-gray-300'
    }`}>
      {/* Header colapsable */}
      <button
        onClick={toggleCollapse}
        className={`w-full flex items-center justify-between group ${isCollapsed ? '' : 'mb-4'}`}
      >
        <h2 className={`text-lg font-bold flex items-center gap-2 transition-colors duration-300 ${
          isDarkMode ? 'text-white group-hover:text-gray-200' : 'text-black group-hover:text-gray-700'
        }`}>
          <TrendingUp className="size-5" />
          Estadísticas en Tiempo Real
        </h2>
        <div className={`p-2 rounded-lg transition-all duration-300 group-hover:scale-110 ${
          isDarkMode ? 'bg-gray-800 group-hover:bg-gray-700' : 'bg-gray-200 group-hover:bg-gray-300'
        }`}>
          {isCollapsed ? (
            <ChevronDown className={`size-5 transition-transform duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          ) : (
            <ChevronUp className={`size-5 transition-transform duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          )}
        </div>
      </button>
      
      {/* Contenido principal (4 Tarjetas) */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
        isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'
      }`}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          
          {/* Tarjeta 1: Credibilidad Promedio */}
          <div className={`p-4 rounded-lg border flex flex-col items-center text-center gap-2 ${
            isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-100 border-gray-200'
          }`}>
            <Shield className={`size-6 ${isDarkMode ? 'text-white' : 'text-black'}`} />
            <div className={`text-2xl font-bold transition-transform duration-300 ${
              isDarkMode ? 'text-white' : 'text-black'
            } ${animatingIndices.has(0) ? 'animate-pulse-scale' : ''}`}>
              {averageCredibility}%
            </div>
            <div className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Porcentaje de Credibilidad
            </div>
          </div>

          {/* Tarjeta 2: Noticias Verificadas */}
          <div className={`p-4 rounded-lg border flex flex-col items-center text-center gap-2 ${
            isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-100 border-gray-200'
          }`}>
            <FileCheck className={`size-6 ${isDarkMode ? 'text-white' : 'text-black'}`} />
            <div className={`text-2xl font-bold transition-transform duration-300 ${
              isDarkMode ? 'text-white' : 'text-black'
            } ${animatingIndices.has(1) ? 'animate-pulse-scale' : ''}`}>
              {totalItems}
            </div>
            <div className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Noticias Verificadas
            </div>
          </div>

          {/* Tarjeta 3: Botón Historial */}
          <button 
            onClick={() => navigate('/afirmaciones')}
            className={`p-4 rounded-lg border flex flex-col items-center justify-center text-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer col-span-2 md:col-span-1 ${
              isDarkMode 
                ? 'bg-gray-900 border-gray-800 hover:border-gray-600 text-gray-400 hover:text-white' 
                : 'bg-gray-100 border-gray-200 hover:border-gray-400 text-gray-600 hover:text-black'
            }`}
          >
            <History className="size-6" />
            <div className="text-sm font-medium">
              Historial de verificaciones
            </div>
          </button>

          {/* Tarjeta 4: Botón Nueva Verificación (Color Azul) */}
          <button 
            onClick={onNewVerification}
            className="p-4 rounded-lg border-none flex flex-col items-center justify-center text-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/40 group col-span-2 md:col-span-3 lg:col-span-1"
          >
            <Plus className="size-6 text-white group-hover:rotate-90 transition-transform duration-300" />
            <div className="text-sm font-bold text-white">
              Realizar nueva verificación
            </div>
          </button>

        </div>

        {totalItems > 0 && (
          <div className={`mt-4 pt-4 border-t text-sm ${isDarkMode ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-600'}`}>
            <p>
              Mostrando análisis global de <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>{totalItems}</span> registros.
              {lowCredibility > 0 && (
                <span className={isDarkMode ? 'text-gray-500' : 'text-gray-700'}>
                  {' '}⚠️ {lowCredibility} con baja credibilidad (&lt;50%)
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}