import React from 'react';
import { useNavigate } from 'react-router';
import { MessageSquare, Calendar, ShieldCheck } from 'lucide-react';
import { useNews } from '../context/NewsContext';
import { CredibilityBadge } from './CredibilityBadge';

export function ClaimsFeed() {
  const { claims, isDarkMode, loading } = useNews();
  const navigate = useNavigate();

  if (loading && claims.length === 0) {
    return (
      <div className={`flex justify-center items-center h-64 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (claims.length === 0) {
    return (
      <div className={`text-center py-20 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <h2 className="text-2xl font-bold mb-2">No hay afirmaciones aún</h2>
        <p>Las ideas o rumores que verifiques aparecerán aquí.</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Cabecera de la sección */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/30">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Verificaciones de Usuarios
          </h1>
        </div>

        {/* Lista de Afirmaciones */}
        <div className="grid grid-cols-1 gap-6">
          {claims.map((claim) => (
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
                    "{claim.claim}"
                  </h2>
                  
                  <p className={`text-sm line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {claim.description}
                  </p>

                  <div className={`flex items-center gap-4 text-xs font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {claim.date}
                    </span>
                    <span>•</span>
                    <span>Motor: {claim.engine === 'IA_Agentes' ? 'CrewAI' : 'Modelo Local'}</span>
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
      </div>
    </div>
  );
}