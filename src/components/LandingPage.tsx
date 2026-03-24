import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, ChevronRight, Sparkles, ChevronLeft, X, Sun, Moon } from 'lucide-react';
import { useNews } from '../context/NewsContext';

interface LandingPageProps {
  isDarkMode: boolean;
  onEnterApp: () => void;
  onToggleTheme: () => void;
}

interface CustomCarousel {
  id: string;
  name: string;
  sources: string[];
  countries: string[];
}

const availableSources = [
  'Science Daily',
  'TechNews Pro',
  'The Onion Times',
  'ViralHealth24.net',
  'Health News Network',
  'Economic Times',
  'Archaeology Today',
  'Satirical News Weekly',
  'CryptoScoop.biz'
];

const availableCountries = [
  { code: 'us', name: 'Estados Unidos' },
  { code: 'es', name: 'España' },
  { code: 'mx', name: 'México' },
  { code: 'ar', name: 'Argentina' },
  { code: 'co', name: 'Colombia' },
  { code: 'cl', name: 'Chile' },
  { code: 'pe', name: 'Perú' },
  { code: 'uk', name: 'Reino Unido' },
];

export function LandingPage({ isDarkMode, onEnterApp, onToggleTheme }: LandingPageProps) {
  const { articles } = useNews();
  const [mainCurrentIndex, setMainCurrentIndex] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [customCarousels, setCustomCarousels] = useState<CustomCarousel[]>([]);
  const [carouselIndices, setCarouselIndices] = useState<{ [key: string]: number }>({});
  
  // Initialize from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('custom-carousels');
    if (saved) {
      setCustomCarousels(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('custom-carousels', JSON.stringify(customCarousels));
  }, [customCarousels]);
  
  // Estado del formulario
  const [newCarouselName, setNewCarouselName] = useState('');
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  // Noticias con mayor credibilidad (top 5)
  const topCredibilityNews = [...articles]
    .sort((a, b) => b.credibilityScore - a.credibilityScore)
    .slice(0, 5);

  // Auto-advance carrusel principal
  useEffect(() => {
    const timer = setInterval(() => {
      setMainCurrentIndex((prev) => (prev + 1) % topCredibilityNews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [topCredibilityNews.length]);

  // Auto-advance carruseles personalizados
  useEffect(() => {
    const timers = customCarousels.map(carousel => {
      return setInterval(() => {
        setCarouselIndices(prev => {
          const filteredNews = getFilteredNews(carousel);
          return {
            ...prev,
            [carousel.id]: ((prev[carousel.id] || 0) + 1) % Math.max(1, filteredNews.length)
          };
        });
      }, 4000);
    });
    
    return () => timers.forEach(timer => clearInterval(timer));
  }, [customCarousels]);

  const getFilteredNews = (carousel: CustomCarousel) => {
    return articles.filter(article => {
      const matchesSource = carousel.sources.length === 0 || 
        carousel.sources.some(source => article.source.toLowerCase().includes(source.toLowerCase()));
      return matchesSource;
    }).slice(0, 6);
  };

  const nextMain = () => {
    setMainCurrentIndex((prev) => (prev + 1) % topCredibilityNews.length);
  };

  const prevMain = () => {
    setMainCurrentIndex((prev) => (prev - 1 + topCredibilityNews.length) % topCredibilityNews.length);
  };

  const handleAddCarousel = () => {
    if (customCarousels.length >= 5) {
      alert('Has alcanzado el límite máximo de 5 carruseles personalizados');
      return;
    }
    
    if (!newCarouselName.trim()) {
      alert('Por favor ingresa un nombre para el carrusel');
      return;
    }

    const newCarousel: CustomCarousel = {
      id: `carousel-${Date.now()}`,
      name: newCarouselName,
      sources: selectedSources,
      countries: selectedCountries,
    };
    setCustomCarousels([...customCarousels, newCarousel]);
    setCarouselIndices({ ...carouselIndices, [newCarousel.id]: 0 });
    setShowAddModal(false);
    setNewCarouselName('');
    setSelectedSources([]);
    setSelectedCountries([]);
  };

  const toggleSource = (source: string) => {
    if (selectedSources.includes(source)) {
      setSelectedSources(selectedSources.filter(s => s !== source));
    } else {
      setSelectedSources([...selectedSources, source]);
    }
  };

  const toggleCountry = (code: string) => {
    if (selectedCountries.includes(code)) {
      setSelectedCountries(selectedCountries.filter(c => c !== code));
    } else {
      setSelectedCountries([...selectedCountries, code]);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDarkMode ? 'bg-black' : 'bg-gray-50'
    }`}>
      {/* Hero Section con Carrusel Principal */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 pointer-events-none z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="flex justify-end mb-4 relative z-20">
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${
                isDarkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                  : 'bg-white hover:bg-gray-100 text-black shadow-lg'
              }`}
            >
              {isDarkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>
          </div>

          <div className="text-center mb-12 relative z-20">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className={`size-6 ${isDarkMode ? 'text-white' : 'text-black'}`} />
              <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-black'
              }`}>
                TruthScore Noticias
              </h1>
              <Sparkles className={`size-6 ${isDarkMode ? 'text-white' : 'text-black'}`} />
            </div>
            <p className={`text-lg sm:text-xl max-w-2xl mx-auto transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Análisis de credibilidad de noticias con IA
            </p>
          </div>

          {/* Carrusel Principal - Noticias de Mayor Credibilidad */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className={`size-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              <h2 className={`text-2xl sm:text-3xl font-bold ${
                isDarkMode ? 'text-white' : 'text-black'
              }`}>
                Noticias Más Confiables
              </h2>
            </div>
            
            <div className={`rounded-2xl overflow-hidden border ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-900 to-black border-gray-800' 
                : 'bg-gradient-to-br from-white to-gray-100 border-gray-300'
            } p-4 sm:p-6 shadow-2xl backdrop-blur-lg transition-all duration-500 hover:shadow-[0_0_50px_rgba(255,255,255,0.1)] relative`}>
              
              {/* Carrusel */}
              <div className="relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mainCurrentIndex}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <div className="grid md:grid-cols-2 gap-6 items-center">
                      {/* Imagen */}
                      <div className="relative group overflow-hidden rounded-xl">
                        <img
                          src={topCredibilityNews[mainCurrentIndex].imageUrl}
                          alt={topCredibilityNews[mainCurrentIndex].title}
                          className="w-full h-64 sm:h-80 object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t ${
                          isDarkMode 
                            ? 'from-black/80 via-black/30 to-transparent' 
                            : 'from-gray-900/60 via-gray-900/20 to-transparent'
                        }`} />
                        <div className="absolute top-4 right-4">
                          <div className={`px-4 py-2 rounded-full backdrop-blur-md font-bold text-lg ${
                            topCredibilityNews[mainCurrentIndex].credibilityScore >= 80 
                              ? 'bg-green-600 text-white' 
                              : 'bg-yellow-500 text-black'
                          }`}>
                            {topCredibilityNews[mainCurrentIndex].credibilityScore}% Confiable
                          </div>
                        </div>
                      </div>

                      {/* Contenido */}
                      <div className="space-y-4">
                        <div className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${
                          isDarkMode 
                            ? 'bg-gray-800 text-gray-300' 
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {topCredibilityNews[mainCurrentIndex].source}
                        </div>
                        <h3 className={`text-2xl sm:text-3xl font-bold leading-tight ${
                          isDarkMode ? 'text-white' : 'text-black'
                        }`}>
                          {topCredibilityNews[mainCurrentIndex].title}
                        </h3>
                        <p className={`text-base sm:text-lg ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {topCredibilityNews[mainCurrentIndex].description}
                        </p>
                        <div className="flex items-center gap-4">
                          <span className={`text-sm ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-500'
                          }`}>
                            {topCredibilityNews[mainCurrentIndex].date}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Controles */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={prevMain}
                  className={`p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${
                    isDarkMode 
                      ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-black'
                  }`}
                >
                  <ChevronLeft className="size-5" />
                </button>
                
                {/* Dots */}
                <div className="flex gap-2">
                  {topCredibilityNews.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setMainCurrentIndex(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === mainCurrentIndex 
                          ? 'w-8 bg-white' 
                          : `w-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-400'}`
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextMain}
                  className={`p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${
                    isDarkMode 
                      ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-black'
                  }`}
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-16">
            <button
              onClick={onEnterApp}
              className={`group inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl ${
                isDarkMode
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              Explorar Todas las Noticias
              <ChevronRight className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* Modal para agregar carrusel personalizado */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-gray-900 to-black border border-gray-800' 
                  : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
              }`}
            >
              <div className={`p-6 border-b ${
                isDarkMode ? 'border-gray-800' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <h2 className={`text-2xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-black'
                  }`}>
                    Crear Carrusel Personalizado
                  </h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className={`p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${
                      isDarkMode 
                        ? 'bg-gray-800 hover:bg-gray-700 text-gray-400' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                    }`}
                  >
                    <X className="size-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Nombre del carrusel */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Nombre del Carrusel *
                  </label>
                  <input
                    type="text"
                    value={newCarouselName}
                    onChange={(e) => setNewCarouselName(e.target.value)}
                    placeholder="Ej: Tecnología Internacional"
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500 outline-none ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                        : 'bg-white border-gray-300 text-black placeholder-gray-400'
                    }`}
                  />
                </div>

                {/* Fuentes */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Fuentes de Noticias
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableSources.map(source => (
                      <button
                        key={source}
                        onClick={() => toggleSource(source)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
                          selectedSources.includes(source)
                            ? 'bg-blue-600 text-white shadow-lg'
                            : isDarkMode
                            ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {source}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Países */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Países
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {availableCountries.map(country => (
                      <button
                        key={country.code}
                        onClick={() => toggleCountry(country.code)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
                          selectedCountries.includes(country.code)
                            ? 'bg-blue-600 text-white shadow-lg'
                            : isDarkMode
                            ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {country.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={`p-6 border-t flex gap-3 ${
                isDarkMode ? 'border-gray-800' : 'border-gray-200'
              }`}>
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
                    isDarkMode 
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddCarousel}
                  className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg ${
                    isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  Crear Carrusel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
