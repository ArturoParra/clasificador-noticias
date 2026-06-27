import { useState } from 'react';
import { useNews } from '../context/NewsContext';
import { Header } from './Header';
import { NewsGrid } from './NewsGrid';
import { ClaimResultModal } from './ClaimResultModal';
import { ApiHandler } from '../services/ApiHandler';

export function NewsFeed() {
  const {
    isDarkMode,
    toggleTheme,
    selectedCategory,
    setSelectedCategory,
    searchFilters,
    setSearchFilters,
    setArticles
  } = useNews();

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

      <ClaimResultModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        isDarkMode={isDarkMode}
        claim={currentClaim}
        result={claimResult}
        isLoading={claimLoading}
        error={claimError}
      />
    </>
  );
}
