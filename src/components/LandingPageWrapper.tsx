import { useNavigate } from 'react-router';
import { LandingPage } from './LandingPage';
import { useNews } from '../context/NewsContext';

export function LandingPageWrapper() {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useNews();

  const handleEnterApp = () => {
    navigate('/feed');
  };

  return <LandingPage isDarkMode={isDarkMode} onToggleTheme={toggleTheme} onEnterApp={handleEnterApp} />;
}
