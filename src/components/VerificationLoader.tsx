import { useState, useEffect } from 'react';
import { Bot, Search, BrainCircuit, Gavel, CheckCircle2 } from 'lucide-react';
import { useNews } from '../context/NewsContext';

interface VerificationLoaderProps {
  isAnalyzing: boolean;
}

export function VerificationLoader({ isAnalyzing }: VerificationLoaderProps) {
  const { isDarkMode } = useNews();
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const phases = [
    { threshold: 15, text: 'Despertando agentes de IA...', icon: Bot },
    { threshold: 45, text: 'Investigador buscando evidencia...', icon: Search },
    { threshold: 75, text: 'Analista evaluando sesgos...', icon: BrainCircuit },
    { threshold: 95, text: 'Juez de consistencia deliberando...', icon: Gavel },
    { threshold: 100, text: '¡Veredicto emitido!', icon: CheckCircle2 },
  ];

  useEffect(() => {
    //let interval: NodeJS.Timeout;
    let interval: ReturnType<typeof setInterval>;

    if (isAnalyzing) {
      setIsVisible(true);
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
      
    } else if (isVisible) {
      // Cuando el backend responde, isAnalyzing se vuelve false.
      // Forzamos el 100% y el último mensaje de éxito.
      setProgress(100);
      setStep(phases.length - 1);
      
      // Ocultamos el modal después de 1 segundo de mostrar el éxito
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, 1000);
      return () => clearTimeout(timeout);
    }

    return () => clearInterval(interval);
  }, [isAnalyzing, isVisible]);

  if (!isVisible) return null;

  const CurrentIcon = phases[step].icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`w-full max-w-md p-8 rounded-2xl shadow-2xl border ${
        isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-col items-center text-center space-y-6">
          
          {/* Animación del Ícono */}
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 rounded-full blur-md animate-pulse opacity-40"></div>
            <div className={`relative p-5 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-indigo-50'}`}>
              <CurrentIcon className={`w-10 h-10 ${progress === 100 ? 'text-green-500' : 'text-indigo-500 animate-bounce'}`} />
            </div>
          </div>

          {/* Textos del proceso */}
          <div>
            <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Auditando Afirmación
            </h3>
            <p className={`text-sm font-medium transition-colors duration-300 ${
              progress === 100 ? 'text-green-500' : isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
            }`}>
              {phases[step].text}
            </p>
          </div>

          {/* Barra de Progreso */}
          <div className="w-full">
            <div className={`h-3 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div 
                className={`h-full transition-all duration-500 ease-out relative ${
                  progress === 100 ? 'bg-green-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${progress}%` }}
              >
                {progress < 100 && (
                  <div className="absolute inset-0 bg-white/20 animate-[shimmer_1s_infinite] w-full"></div>
                )}
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs font-bold text-gray-500">
              <span>Progreso de IA</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}