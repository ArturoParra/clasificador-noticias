import { useState, useEffect } from 'react';
import { Bot, Search, BrainCircuit, Gavel, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useNews } from '../context/NewsContext';

//propiedades de exito y error
interface VerificationLoaderProps {
  isAnalyzing: boolean;
  isSuccess: boolean;
  error: string | null;
}

interface VerificationLoaderProps {
  isAnalyzing: boolean;
}

export function VerificationLoader({ isAnalyzing, isSuccess, error }: VerificationLoaderProps) {
  const { isDarkMode } = useNews();
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  //el modal es visible si está analizando, si hubo exito o si hay error
  const isVisible = isAnalyzing || isSuccess || error !== null;

  const phases = [
    { threshold: 15, text: 'Despertando agentes de IA...', icon: Bot },
    { threshold: 45, text: 'Investigador buscando evidencia...', icon: Search },
    { threshold: 75, text: 'Analista evaluando sesgos...', icon: BrainCircuit },
    { threshold: 95, text: 'Juez de consistencia deliberando...', icon: Gavel },
    { threshold: 100, text: '¡Veredicto emitido con éxito!', icon: CheckCircle2 },
  ];

  useEffect(() => {
    //let interval: NodeJS.Timeout;
    let interval: ReturnType<typeof setInterval>;

    if (isAnalyzing) {
      setProgress(0);
      setStep(0);
      
      interval = setInterval(() => {
        setProgress((prev) => {
          // La barra avanza rápido al inicio y se frena al llegar al 95%
          const increment = prev < 40 ? 2 : prev < 75 ? 1 : prev < 95 ? 0.2 : 0;
          const next = Math.min(prev + increment, 95); // Se topa en 95%
          
          // Actualizamos el texto/ícono según el porcentaje
          const currentPhaseIndex = phases.findIndex(p => next <= p.threshold);
          setStep(currentPhaseIndex !== -1 ? currentPhaseIndex : phases.length - 2);
          
          return next;
        });
      }, 500);
      
    } else if (isSuccess) {
      setProgress(100);
      setStep(phases.length - 1);
    }

    return () => clearInterval(interval);
  }, [isAnalyzing, isSuccess]);


  if (!isVisible) return null;

  //si hay error se muestra el triangulo, caso contrario, el icono de la fase actual
  const CurrentIcon = error ? AlertTriangle : phases[step].icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`w-full max-w-md p-8 rounded-2xl shadow-2xl border ${
        isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-col items-center text-center space-y-6">
          
          {/* Animación del Ícono */}
          <div className="relative">
            {!error && (
              <div className={`absolute inset-0 rounded-full blur-md animate-pulse opacity-40 ${
                isSuccess ? 'bg-green-500' : 'bg-indigo-500'
              }`}></div>
            )}
            {error && (
              <div className="absolute inset-0 bg-red-500 rounded-full blur-md animate-pulse opacity-40"></div>
            )}
            <div className={`relative p-5 rounded-full ${
              error ? (isDarkMode ? 'bg-red-900/30' : 'bg-red-50') :
              isDarkMode ? 'bg-gray-800' : 'bg-indigo-50'
            }`}>
              <CurrentIcon className={`w-12 h-12 ${
                error ? 'text-red-500' : 
                isSuccess ? 'text-green-500' : 'text-indigo-500 animate-bounce'
              }`} />
            </div>
          </div>

          {/* Textos del proceso o del Error */}
          <div>
            <h3 className={`text-xl font-bold mb-2 ${
              error ? 'text-red-500' : isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {error ? 'Error en el Análisis' : isSuccess ? '¡Análisis Completado!' : 'Auditando Afirmación'}
            </h3>
            <p className={`text-sm font-medium transition-colors duration-300 px-4 ${
              error ? (isDarkMode ? 'text-red-400' : 'text-red-600') :
              isSuccess ? 'text-green-500' :
              isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
            }`}>
              {error ? error : phases[step].text}
            </p>
          </div>

          {/* Porcentaje Centrado y Gigante (debajo del texto) */}
          {!error && (
            <div className={`text-5xl font-black tracking-tighter ${
              isSuccess ? 'text-green-500' : isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {Math.round(progress)}%
            </div>
          )}

          {/* 4. Barra de Progreso */}
          {!error && (
            <div className="w-full mt-4">
              <div className={`h-3 w-full rounded-full overflow-hidden ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
              }`}>
                {/* Barra de color termal dinámico */}
                <div 
                  className={`h-full ${
                    progress === 100 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 
                    progress > 75 ? 'bg-lime-500' : 
                    progress > 40 ? 'bg-yellow-500' : 
                    'bg-red-500'
                  }`}
                  style={{ 
                    width: `${progress}%`,
                    /* Le decimos al navegador que anime tanto el crecimiento como el cambio de color */
                    transition: 'width 0.5s ease-out, background-color 0.5s ease-out' 
                  }}
                ></div>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}