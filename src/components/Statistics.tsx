import { useState, useEffect, useRef, useMemo } from 'react';
import { Shield, CheckCircle/* , XCircle */, AlertTriangle, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
// import type { NewsArticle } from '../data/mockNews.ts';
import { useNews } from '../context/NewsContext.tsx';

// se elimina articles de la interfaz para que sea independiente de las pestañas
interface StatisticsProps {
  // articles: NewsArticle[];
  isDarkMode: boolean;
}

export function Statistics({ isDarkMode }: StatisticsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [animatingIndices, setAnimatingIndices] = useState<Set<number>>(new Set());
  const prevValuesRef = useRef<(string | number)[]>([]);
  // se extraen tanto articles como claims de la db global para unificar los calculos y no depender de la pestaña activa
  const { articles, claims } = useNews();

  // Load collapse state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('statistics-collapsed');
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  // Save collapse state to localStorage
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('statistics-collapsed', JSON.stringify(newState));
  };

  // centralizacion de los calculos en useMemo para unir el feed y las afimraciones
  const {
    totalItems,
    averageCredibility,
    verifiedCount,
    falseCount, // misleadingCount
    highCredibility,
    lowCredibility
  } = useMemo(() => {
    const allItems = [...articles, ...(claims || [])];
    const total = allItems.length;

    // Promedio Global
    const average = total > 0
      ? Math.round(allItems.reduce((sum, item) => sum + (item.credibilityScore || 0), 0) / total)
      : 0;

    // "Verificadas": Exclusivamente las afirmaciones ingresadas por usuarios
    const verified = (claims || []).length;
    
    // "Falsas": Filtramos de manera estricta por el campo classification === 'falsa
    /*
    const misleading = allItems.filter(
      item => item.classification === 'engañosa' || item.classification === 'falsa'
    ).length;
    */
   const falsas = allItems.filter(
       item => item.classification === 'falsa'
       ).length;
       
    // Alta y Baja Credibilidad
    const highCred = allItems.filter(item => (item.credibilityScore || 0) >= 80).length;
    const lowCred = allItems.filter(item => (item.credibilityScore || 0) < 50).length;

    return {
      totalItems: total,
      averageCredibility: average,
      verifiedCount: verified,
      falseCount: falsas,
      highCredibility: highCred,
      lowCredibility: lowCred
    };
  }, [articles, claims]);

  const stats = [
    {
      icon: Shield,
      label: 'Credibilidad Promedio',
      value: `${averageCredibility}%`,
      color: isDarkMode ? 'text-white' : 'text-black',
      bgColor: isDarkMode ? 'bg-gray-900' : 'bg-gray-100',
    },
    {
      icon: CheckCircle,
      label: 'Verificadas',
      value: verifiedCount,
      color: isDarkMode ? 'text-white' : 'text-black',
      bgColor: isDarkMode ? 'bg-gray-900' : 'bg-gray-100',
    },
    {
      icon: AlertTriangle,
      label: 'Falsas',
      value: falseCount,
      color: isDarkMode ? 'text-gray-400' : 'text-gray-600',
      bgColor: isDarkMode ? 'bg-gray-900' : 'bg-gray-100',
    },
    {
      icon: TrendingUp,
      label: 'Alta Credibilidad (>80%)',
      value: highCredibility,
      color: isDarkMode ? 'text-white' : 'text-black',
      bgColor: isDarkMode ? 'bg-gray-900' : 'bg-gray-100',
    },
  ];

  // Detect value changes and trigger animation
  useEffect(() => {
    const currentValues = stats.map(s => s.value);
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
        setTimeout(() => {
          setAnimatingIndices(new Set());
        }, 300);
      }
    }

    prevValuesRef.current = currentValues;
  }, [stats.map(s => s.value).join(',')]);

  return (
    <div className={`mb-6 rounded-xl border transition-all duration-300 ${
      isCollapsed ? 'p-4' : 'p-6'
    } ${
      isDarkMode
        ? 'bg-gradient-to-br from-gray-900 to-black border-gray-800'
        : 'bg-gradient-to-br from-gray-100 to-white border-gray-300'
    }`}>
      {/* Header with collapse button */}
      <button
        onClick={toggleCollapse}
        className={`w-full flex items-center justify-between group ${
          isCollapsed ? '' : 'mb-4'
        }`}
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
            <ChevronDown className={`size-5 transition-transform duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`} />
          ) : (
            <ChevronUp className={`size-5 transition-transform duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`} />
          )}
        </div>
      </button>
      
      {/* Collapsible content */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
        isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'
      }`}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border last:col-span-2 md:last:col-span-1 ${
                stat.bgColor
              } ${
                isDarkMode ? 'border-gray-800' : 'border-gray-200'
              }`}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <stat.icon className={`size-6 ${stat.color}`} />
                <div 
                  className={`text-2xl font-bold ${stat.color} transition-transform duration-300 ${
                    animatingIndices.has(index) ? 'animate-pulse-scale' : ''
                  }`}
                >
                  {stat.value}
                </div>
                <div className={`text-xs font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalItems > 0 && (
          <div className={`mt-4 pt-4 border-t text-sm ${
            isDarkMode ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-600'
          }`}>
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