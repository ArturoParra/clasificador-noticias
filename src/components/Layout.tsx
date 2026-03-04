import { Outlet, useLocation } from 'react-router';
import { NewsProvider, useNews } from '../context/NewsContext';
import { useEffect } from 'react';

// Inner component to consume the context
function LayoutContent() {
  const { isDarkMode } = useNews();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <Outlet />
    </div>
  );
}

export function Layout() {
  return (
    <NewsProvider>
      <LayoutContent />
    </NewsProvider>
  );
}
