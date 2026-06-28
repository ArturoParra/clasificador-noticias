import { useParams, useNavigate, useLocation } from 'react-router';
import { ArrowLeft, Share2, Bookmark, ExternalLink, Calendar, User, Sun, Moon } from 'lucide-react';
import { useNews } from '../context/NewsContext';
import { CredibilityBadge } from './CredibilityBadge';
import { AnalysisBreakdown } from './AnalysisBreakdown';
// import { ScoreBar } from './ScoreBar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';

export function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, articles, toggleBookmark, isBookmarked, toggleTheme } = useNews();
  
  const article = articles.find(a => a.id === id);

  const backLink = location.state?.from || '/feed';

  console.log(article)

  const handleBookmark = () => {
    if (id) {
      toggleBookmark(id);
      const saved = !isBookmarked(id);
      toast(saved ? "Artículo guardado" : "Artículo eliminado de guardados", {
        description: saved ? "Puedes encontrarlo en tu lista de lectura." : "Se ha eliminado de tus favoritos.",
      });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast("Enlace copiado", {
      description: "El enlace al artículo ha sido copiado al portapapeles.",
    });
  };

  if (!article) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[50vh] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <h1 className="text-2xl font-bold mb-4">Artículo no encontrado</h1>
        <Button onClick={() => navigate(-1)}>Volver</Button>
      </div>
    );
  }

  // Generate fallback content if missing
  /*
  const content = article.content || `
    <p class="mb-4 text-lg leading-relaxed">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
    <p class="mb-4 text-lg leading-relaxed">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
    <h3 class="text-xl font-bold mb-2 mt-8">Detalles del Reporte</h3>
    <p class="mb-4 text-lg leading-relaxed">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
    <blockquote class="border-l-4 border-gray-500 pl-4 italic my-8 text-xl font-light">"Esta es una cita importante relacionada con la noticia que añade contexto y credibilidad a la narración."</blockquote>
    <p class="mb-4 text-lg leading-relaxed">Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
  `;
*/
  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* Sticky Header / Navigation */}
      <div className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-950/80 border-gray-800' : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(backLink)}
            className={`gap-2 ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-black hover:bg-gray-100'}`}
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className={isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-black hover:bg-gray-100'}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBookmark}
              className={isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-black hover:bg-gray-100'}
            >
              <Bookmark className="w-4 h-4" fill={isBookmarked(id || '') ? "currentColor" : "none"} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleShare}
              className={isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-black hover:bg-gray-100'}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Article Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge variant="outline" className={`${isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-700'}`}>
              {article.source}
            </Badge>
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>•</span>
            <span className={`text-sm flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <Calendar className="w-3 h-3" />
              {article.date}
            </span>
          </div>
          
          <h1 className={`text-3xl md:text-5xl font-bold tracking-tight mb-6 leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {article.title}
          </h1>

          <div className="flex items-center justify-between flex-wrap gap-4 border-y py-4 my-6" 
               style={{ borderColor: isDarkMode ? '#1f2937' : '#e5e7eb' }}>
            <div className="flex items-center gap-3">
               <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                 isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-600'
               }`}>
                 <User className="w-5 h-5" />
               </div>
               <div>
                 <p className={`font-medium text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Escrito por</p>
                 <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                   {article.source}
                 </p>
               </div>
            </div>
            
            <CredibilityBadge score={article.credibilityScore} classification={article.classification} size="lg" />
          </div>
        </header>

        {/* Featured Image */}
        <div className="mb-10 rounded-2xl overflow-hidden aspect-video shadow-xl ring-1 ring-black/5">
           <ImageWithFallback 
             src={article.image} 
             alt={article.title}
             className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
           />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <div 
              className={`prose prose-lg max-w-none ${isDarkMode ? 'prose-invert' : 'prose-gray'}`}
            />

            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {article.description}
            </p>
            
            <div className={`mt-12 p-6 rounded-xl border ${
              isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`font-semibold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <ExternalLink className="w-4 h-4" />
                Fuente Original
              </h3>
              <Button variant="outline" className={`w-full sm:w-auto ${isDarkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : ''}`}>
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="sr-only">Visitar fuente original</a>
              </Button>
            </div>
          </div>

          {/* Sidebar Analysis */}
          <div className="md:col-span-1">
            <div className="sticky top-24 space-y-6">
              <AnalysisBreakdown 
                analysis={article.analysis} 
                isDarkMode={isDarkMode} 
              />
              
              {/* Bloque para el veredicto de desglose de la IA */}
              <div className="space-y-4 pt-2">
                
                {/* Tarjeta Unificada: Veredicto + Motor */}
                <div className={`p-4 rounded-xl border flex flex-col shadow-sm ${
                  isDarkMode ? 'bg-gray-900/40 border-gray-800' : 'bg-white border-gray-200'
                }`}>
                  {/* Fila superior: Veredicto */}
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Veredicto Final
                    </span>
                    <CredibilityBadge classification={article.classification} />
                  </div>

                  {/* Fila inferior: Etiqueta del Motor Utilizado */}
                  {article.engine && (
                    <div className={`mt-4 pt-3 border-t text-right text-xs font-medium ${
                      isDarkMode ? 'border-gray-800 text-gray-500' : 'border-gray-100 text-gray-400'
                    }`}>
                      Analizado por: {
                        article.engine === 'IA_Agentes' 
                          ? 'Agentes de IA con CrewAI' 
                          : 'Modelo Local Predictivo'
                      }
                    </div>
                  )}
                </div>

                {/* NUEVO: Tarjeta del Reporte de IA (Estilo Consola) */}
                {article.ai_report && (
                 <div className={`rounded-xl border shadow-sm overflow-hidden flex flex-col max-h-[500px] ${
                   isDarkMode ? 'bg-gray-950 border-gray-800' : 'bg-gray-50 border-gray-200'
                 }`}>
                   {/* Cabecera de la terminal */}
                   <div className={`px-4 py-3 border-b text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                     isDarkMode ? 'border-gray-800 text-gray-400 bg-gray-900/80' : 'border-gray-200 text-gray-500 bg-gray-100'
                   }`}>
                     <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                     Terminal del Investigador
                   </div>
                   
                  {/* Cuerpo del texto */}
                  <div className={`p-4 overflow-y-auto text-sm font-mono whitespace-pre-wrap leading-relaxed ${
                    isDarkMode ? 'text-green-400' : 'text-gray-800'
                  }`}>
                    {article.ai_report}
                  </div>
                </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}