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

  // Simplificamos los estados, ya que el Loader y la nueva vista hacen el trabajo pesado
  const [claimLoading, setClaimLoading] = useState(false);
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

      // El sistema espera a los agentes de IA (CrewAI)
      await ApiHandler.analyzeClaim(claim);
      
      // Una vez terminado el análisis, se refresca el contexto para que detecte el nuevo documento de MongoDB
      refreshClaims();
      
      // Mandamos al usuario a la nueva sección
      navigate('/afirmaciones');

    } catch (error: any) {
      console.error("Error en la evaluación de la IA:", error);
      // posible alerta (como el toast de Sonner) para avisar del error
    } finally {
      // Se apaga el loader en caso de error (si hay éxito, el navigate cambia de pantalla)
      setClaimLoading(false);
    }
  };

  return (
    <>
      <Header
        onSearch={setSearchFilters}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
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
        />
      </main>

      {/* El componente de carga asintótica que construimos */}
      <VerificationLoader isAnalyzing={claimLoading} />
    </>
  );
}
