import { useState } from 'react';
import { useNavigate } from 'react-router'; //para la redireccion
import { useNews } from '../context/NewsContext';
import { Header } from './Header';
import { NewsGrid } from './NewsGrid';
import { ApiHandler } from '../services/ApiHandler';
import { VerificationLoader } from './VerificationLoader';

export function NewsFeed() {
  const navigate = useNavigate(); //hook de navegacion
  const {
    isDarkMode,
    toggleTheme,
    selectedCategory,
    setSelectedCategory,
    searchFilters,
    setSearchFilters,
    setArticles,
    refreshClaims // se extrae la funcion para actualizar la db local
  } = useNews();

  // Estados completos para la nueva barra de progreso
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  /*
  const [modalOpen, setModalOpen] = useState(false);
  const [currentClaim, setCurrentClaim] = useState('');
  const [claimResult, setClaimResult] = useState(null);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  const handleVerifyClaim = async (claim: string) => {
    setCurrentClaim(claim);
    setClaimResult(null);
    setClaimError(null);
    setClaimLoading(true);
    setModalOpen(true);

    try {
      const result = await ApiHandler.analyzeClaim(claim);
      setClaimResult(result);
    } catch (error: any) {
      const message = error?.response?.data?.detail || 'Error de conexión con el servidor de análisis.';
      setClaimError(message);
    } finally {
      setClaimLoading(false);
    }
  };
  */

  const handleVerifyClaim = async (claim: string) => {
    try {
      // Se enciende el VerificationLoader
      setClaimLoading(true);
      //se reinician los estados al hacer una nueva verificación
      setClaimSuccess(false);
      setClaimError(null);

      // El sistema espera a los agentes de IA (CrewAI)
      await ApiHandler.analyzeClaim(claim);

      // El 'await' obliga a React a pausar el código hasta que 
      // la base de datos descargue la nueva lista con la afirmación recién evaluada.
      await refreshClaims();
      
      // Apagamos 'cargando' y encendemos 'éxito' para que la UI muestre el 100% verde
      setClaimLoading(false);
      setClaimSuccess(true);

      // Esperamos 2.5 segundos exactos antes de cambiar de pantalla
      setTimeout(() => {
        setClaimSuccess(false); // Apagamos el modal
        navigate('/afirmaciones');
      }, 2500);

    } catch (error: any) {
      // Manejo del error (usualmente 503 de Google) y lo mandamos al Loader
      const errorMessage = error?.response?.data?.detail || "Los servidores experimentan alta demanda temporal. Por favor, intenta de nuevo.";
      
      setClaimLoading(false);
      setClaimError(errorMessage);

      // Desaparecemos el mensaje de error automáticamente después de 6 segundos
      setTimeout(() => {
        setClaimError(null);
      }, 6000);
    }
  };

  return (
    <>
      <Header
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onExternalArticleAnalyzed={newArticle => {
          setArticles(prevArticles => [newArticle, ...prevArticles]);
        }}
        onVerifyClaim={handleVerifyClaim}
      />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <NewsGrid
          selectedCategory={selectedCategory}
          isDarkMode={isDarkMode}
          searchFilters={searchFilters}
          onSearch={setSearchFilters}
          onCategoryChange={setSelectedCategory}
        />
      </main>

      {/* Le pasamos los 3 estados al nuevo Loader */}
      <VerificationLoader 
        isAnalyzing={claimLoading} 
        isSuccess={claimSuccess} 
        error={claimError} 
      />
    </>
  );
}
