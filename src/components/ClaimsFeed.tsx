import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { MessageSquare, Calendar, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useNews } from '../context/NewsContext';
import { CredibilityBadge } from './CredibilityBadge';
import type { NewsCategory } from '../types/types';

export function ClaimsFeed() {
  const { claims, isDarkMode, loading } = useNews();
  const navigate = useNavigate();
  // Estado local para los filtros de categoría
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('all');

  const credibilityCategories: { value: NewsCategory; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 'verdadera', label: 'Verdaderas' },
    { value: 'falsa', label: 'Falsas' },
    { value: 'sátira', label: 'Sátira' },
    { value: 'engañosa', label: 'Engañosas' },
  ];

  // Aplicar el filtro de categoría a las afirmaciones
  const filteredClaims = useMemo(() => {
    let filtered = [...claims];
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(claim => claim.classification === selectedCategory);
    }
    return filtered;
  }, [claims, selectedCategory]);

  if (loading && claims.length === 0) {
    return (
      <div className={`flex justify-center items-center h-64 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Fila Superior: Botón de Regreso */}
        <button 
          onClick={() => navigate(-1)} 
          className={`mb-6 flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
            isDarkMode 
              ? 'bg-gray-900 text-gray-300 hover:text-white border border-gray-800 hover:bg-gray-800' 
              : 'bg-white text-gray-700 hover:text-black border border-gray-300 hover:bg-gray-100'
          }`}
        >
          <ArrowLeft className="size-4" />
          
        </button>

        {/* Cabecera de la sección */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/30">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Historial de verificaciones hechas por usuarios
          </h1>
        </div>

        {/* Barra de Filtros de Categoría */}
        <div className={`mb-8 p-4 rounded-xl border ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-900 to-black border-gray-800' 
            : 'bg-gradient-to-br from-gray-100 to-white border-gray-300'
        }`}>
          <div className="flex flex-wrap gap-2">
            {credibilityCategories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  selectedCategory === category.value
                    ? isDarkMode
                      ? 'bg-white text-black scale-105 shadow-lg'
                      : 'bg-black text-white scale-105 shadow-lg'
                    : isDarkMode
                    ? 'bg-gray-900 text-gray-300 border border-gray-800 hover:bg-gray-800 hover:text-white hover:scale-105 hover:border-gray-700'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:text-black hover:scale-105 hover:border-gray-400'
                } active:scale-95`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Afirmaciones Filtrada */}
        {filteredClaims.length === 0 ? (
          <div className={`text-center py-20 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold mb-2">No se encontraron verificaciones</h2>
            <p>Intenta seleccionar otra categoría o realiza una nueva verificación.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredClaims.map((claim) => (
              <div 
                key={claim.id}
                onClick={() => navigate(`/article/${claim.id}`)}
                className={`group cursor-pointer rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  isDarkMode 
                    ? 'bg-gray-900/50 border-indigo-900/30 hover:border-indigo-500/50 hover:bg-gray-800/80' 
                    : 'bg-white border-indigo-100 hover:border-indigo-300 hover:shadow-indigo-100'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  
                  {/* Columna Izquierda: La Afirmación */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-500">
                      <ShieldCheck className="w-4 h-4" />
                      Idea Auditada
                    </div>
                    
                    <h2 className={`text-2xl font-bold italic leading-tight ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      "{claim.claim || claim.title?.replace('Análisis: ¿', '').replace('?', '')}"
                    </h2>
                    
                    <p className={`text-sm line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {claim.description || claim.summary}
                    </p>

                    <div className={`flex items-center gap-4 text-xs font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {claim.date}
                      </span>
                      <span>•</span>
                      <span>
                        Motor: {(claim.engine === 'IA_Agentes' || claim.source === 'VeritasCop IA') ? 'CrewAI' : 'Modelo Local'}
                      </span>
                    </div>
                  </div>

                  {/* Columna Derecha: El Veredicto */}
                  <div className="flex flex-col items-end justify-start md:min-w-[150px] space-y-3">
                    <CredibilityBadge classification={claim.classification} score={claim.credibilityScore} />
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}