import type { NewsCategory } from '../types/types';

export interface AnalysisFactor {
  factor: string;
  score: number;
  status: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  source: string;
  date: string;
  category: Exclude<NewsCategory, 'all'>;
  credibilityScore: number;
  content?: string;
  analysis: AnalysisFactor[];
}

const generateMockContent = (title: string) => {
  return `
    <p class="mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
    <p class="mb-4">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
    <h3 class="text-xl font-bold mb-2 mt-6">Detalles del Reporte</h3>
    <p class="mb-4">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
    <p class="mb-4">Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.</p>
    <blockquote class="border-l-4 border-gray-300 pl-4 italic my-6">"Esta es una cita importante relacionada con la noticia sobre ${title} que añade contexto y credibilidad a la narración."</blockquote>
    <p class="mb-4">At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.</p>
  `;
};

export const mockNewsData: NewsArticle[] = [
  {
    id: '1',
    title: 'Científicos Descubren Nuevo Tratamiento para Enfermedad Común',
    content: generateMockContent('Científicos Descubren Nuevo Tratamiento'),
    description: 'Investigadores de universidades líderes han publicado hallazgos revisados por pares sobre un tratamiento innovador que muestra resultados prometedores en ensayos clínicos.',
    imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80',
    source: 'Science Daily',
    date: '12 Ene, 2026',
    category: 'real',
    credibilityScore: 92,
    analysis: [
      {
        factor: 'Verificación de Fuente',
        score: 95,
        status: 'positive',
        description: 'Publicado por revista científica de renombre con proceso de revisión por pares.'
      },
      {
        factor: 'Precisión Factual',
        score: 93,
        status: 'positive',
        description: 'Las afirmaciones están respaldadas por datos verificables y múltiples fuentes independientes.'
      },
      {
        factor: 'Credibilidad del Autor',
        score: 90,
        status: 'positive',
        description: 'Los autores tienen credenciales establecidas en el campo con historial de investigación publicada.'
      },
      {
        factor: 'Detección de Sesgo',
        score: 88,
        status: 'positive',
        description: 'Sesgo mínimo detectado. Presenta perspectiva equilibrada con conclusiones basadas en datos.'
      }
    ]
  },
  {
    id: '2',
    title: 'Alcalde Local Anuncia Santuario Alienígena de un Millón de Dólares',
    description: 'En lo que parece ser una pieza satírica, el alcalde supuestamente planea construir una instalación para dar la bienvenida a visitantes extraterrestres con dinero de contribuyentes.',
    imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&q=80',
    source: 'The Onion Times',
    date: '11 Ene, 2026',
    category: 'misleading',
    credibilityScore: 15,
    analysis: [
      {
        factor: 'Verificación de Fuente',
        score: 20,
        status: 'neutral',
        description: 'Publicación satírica conocida. El contenido es intencionalmente fabricado para humor.'
      },
      {
        factor: 'Precisión Factual',
        score: 5,
        status: 'negative',
        description: 'La historia es completamente fabricada sin base en la realidad.'
      },
      {
        factor: 'Marcadores Satíricos',
        score: 95,
        status: 'positive',
        description: 'Indicadores claros de sátira incluyendo afirmaciones absurdas y tono humorístico.'
      },
      {
        factor: 'Análisis de Intención',
        score: 90,
        status: 'neutral',
        description: 'El propósito es entretenimiento y comentario social, no engañar.'
      }
    ]
  },
  {
    id: '3',
    title: 'Cura Milagrosa: ¡Bebe Esto para Perder 25 Kilos en Una Semana!',
    description: 'Influencer de redes sociales afirma que esta bebida secreta ayudó a miles a perder peso instantáneamente. Los doctores supuestamente están sorprendidos por este descubrimiento.',
    imageUrl: 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800&q=80',
    source: 'ViralHealth24.net',
    date: '10 Ene, 2026',
    category: 'misleading',
    credibilityScore: 8,
    analysis: [
      {
        factor: 'Verificación de Fuente',
        score: 10,
        status: 'negative',
        description: 'El sitio web no tiene respaldo creíble ni proceso de verificación para afirmaciones.'
      },
      {
        factor: 'Precisión Factual',
        score: 5,
        status: 'negative',
        description: 'Las afirmaciones contradicen la ciencia médica establecida. Sin evidencia revisada por pares.'
      },
      {
        factor: 'Detección de Clickbait',
        score: 98,
        status: 'negative',
        description: 'Usa frases típicas de clickbait como "doctores sorprendidos" y "cura milagrosa".'
      },
      {
        factor: 'Desinformación Médica',
        score: 95,
        status: 'negative',
        description: 'Hace afirmaciones de salud peligrosas sin respaldo científico.'
      }
    ]
  },
  {
    id: '4',
    title: 'Estudio Muestra Posible Vínculo Entre Dieta y Calidad del Sueño',
    description: 'Un estudio preliminar sugiere que puede haber una conexión entre ciertos patrones dietéticos y la calidad del sueño, aunque los investigadores instan a más investigación.',
    imageUrl: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800&q=80',
    source: 'Health News Network',
    date: '13 Ene, 2026',
    category: 'misleading',
    credibilityScore: 58,
    analysis: [
      {
        factor: 'Verificación de Fuente',
        score: 65,
        status: 'neutral',
        description: 'La fuente es legítima pero el estudio presenta afirmaciones con contexto limitado.'
      },
      {
        factor: 'Estado de Investigación',
        score: 50,
        status: 'neutral',
        description: 'Hallazgos preliminares presentados como más concluyentes de lo que son.'
      },
      {
        factor: 'Evaluación de Afirmaciones',
        score: 60,
        status: 'neutral',
        description: 'Las afirmaciones omiten advertencias importantes sobre evidencia limitada.'
      },
      {
        factor: 'Detección de Sesgo',
        score: 55,
        status: 'negative',
        description: 'Presenta datos preliminares sin el contexto completo de limitaciones del estudio.'
      }
    ]
  },
  {
    id: '5',
    title: 'Economía Muestra Fuerte Crecimiento en Último Trimestre',
    description: 'Datos oficiales del gobierno muestran robusta expansión económica, aunque economistas independientes notan métricas seleccionadas que omiten preocupantes datos de inflación.',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
    source: 'Economic Times',
    date: '9 Ene, 2026',
    category: 'misleading',
    credibilityScore: 42,
    analysis: [
      {
        factor: 'Verificación de Fuente',
        score: 75,
        status: 'positive',
        description: 'Fuente de noticias legítima citando datos oficiales.'
      },
      {
        factor: 'Integridad del Contexto',
        score: 30,
        status: 'negative',
        description: 'Omite contexto importante sobre inflación y crecimiento de salarios reales.'
      },
      {
        factor: 'Selección de Datos',
        score: 35,
        status: 'negative',
        description: 'Presenta selectivamente métricas favorables mientras ignora datos contradictorios.'
      },
      {
        factor: 'Detección de Sesgo',
        score: 40,
        status: 'negative',
        description: 'Muestra claro sesgo en el encuadre. Carece de perspectiva equilibrada de expertos.'
      }
    ]
  },
  {
    id: '6',
    title: 'Empresa Tecnológica Anuncia Importantes Actualizaciones de Política de Privacidad',
    description: 'Empresa líder de tecnología publica revisiones integrales de política de privacidad siguiendo requisitos de cumplimiento regulatorio y comentarios de usuarios.',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
    source: 'TechNews Pro',
    date: '14 Ene, 2026',
    category: 'real',
    credibilityScore: 88,
    analysis: [
      {
        factor: 'Verificación de Fuente',
        score: 90,
        status: 'positive',
        description: 'Medio establecido de periodismo tecnológico con fuertes estándares editoriales.'
      },
      {
        factor: 'Precisión Factual',
        score: 92,
        status: 'positive',
        description: 'Información verificada a través de declaraciones oficiales de la empresa y documentos.'
      },
      {
        factor: 'Múltiples Fuentes',
        score: 85,
        status: 'positive',
        description: 'Corroborado por múltiples medios de noticias tecnológicas independientes.'
      },
      {
        factor: 'Transparencia',
        score: 86,
        status: 'positive',
        description: 'Atribución clara y enlaces a fuentes primarias proporcionados.'
      }
    ]
  },
  {
    id: '7',
    title: 'Gato Local Elegido como Alcalde del Pueblo en Victoria Aplastante',
    description: 'En una visión satírica humorística sobre política, un pequeño pueblo supuestamente elige a un felino como su nuevo alcalde después de que los ciudadanos se cansan de candidatos tradicionales.',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80',
    source: 'Satirical News Weekly',
    date: '8 Ene, 2026',
    category: 'misleading',
    credibilityScore: 12,
    analysis: [
      {
        factor: 'Verificación de Fuente',
        score: 15,
        status: 'neutral',
        description: 'Publicación satírica claramente etiquetada con descargo de responsabilidad.'
      },
      {
        factor: 'Indicadores de Absurdo',
        score: 98,
        status: 'positive',
        description: 'La historia contiene elementos absurdos obvios indicando intención satírica.'
      },
      {
        factor: 'Precisión Factual',
        score: 0,
        status: 'negative',
        description: 'Historia completamente fabricada sin base factual.'
      },
      {
        factor: 'Propósito Satírico',
        score: 95,
        status: 'neutral',
        description: 'Claro comentario social sobre insatisfacción política.'
      }
    ]
  },
  {
    id: '8',
    title: 'Celebridad Respalda Esquema de Criptomonedas Prometiendo 1000% de Retornos',
    description: 'Publicación en redes sociales muestra a celebridad supuestamente garantizando retornos masivos en nueva inversión de criptomonedas, prometiendo que seguidores se harán ricos rápidamente.',
    imageUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&q=80',
    source: 'CryptoScoop.biz',
    date: '7 Ene, 2026',
    category: 'misleading',
    credibilityScore: 6,
    analysis: [
      {
        factor: 'Verificación de Fuente',
        score: 5,
        status: 'negative',
        description: 'Sitio web no verificado sin supervisión editorial o verificación de hechos.'
      },
      {
        factor: 'Indicadores de Estafa',
        score: 99,
        status: 'negative',
        description: 'Esquema clásico de pump-and-dump con promesas de retornos irrealistas.'
      },
      {
        factor: 'Autenticidad de Imagen',
        score: 10,
        status: 'negative',
        description: 'El análisis de IA sugiere que las imágenes pueden estar manipuladas o ser deepfakes.'
      },
      {
        factor: 'Riesgo Financiero',
        score: 100,
        status: 'negative',
        description: 'Riesgo extremadamente alto de fraude financiero y pérdida.'
      }
    ]
  },
  {
    id: '9',
    title: 'Nuevo Descubrimiento Arqueológico Puede Reescribir Historia Antigua',
    description: 'Equipo de excavación afirma haber encontrado artefactos que podrían cambiar nuestra comprensión de civilizaciones antiguas, aunque expertos están esperando resultados de datación por carbono.',
    imageUrl: 'https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=800&q=80',
    source: 'Archaeology Today',
    date: '6 Ene, 2026',
    category: 'misleading',
    credibilityScore: 62,
    analysis: [
      {
        factor: 'Credibilidad de Fuente',
        score: 70,
        status: 'positive',
        description: 'Publicación de arqueología de renombre pero con afirmaciones sensacionalistas.'
      },
      {
        factor: 'Verificación de Expertos',
        score: 55,
        status: 'neutral',
        description: 'Afirmaciones aún no verificadas por expertos arqueológicos independientes.'
      },
      {
        factor: 'Integridad del Contexto',
        score: 48,
        status: 'negative',
        description: 'Presenta hallazgos preliminares de manera más concluyente de lo justificado.'
      },
      {
        factor: 'Detección de Sesgo',
        score: 58,
        status: 'negative',
        description: 'Titular exagerado que no refleja la naturaleza preliminar de los hallazgos.'
      }
    ]
  }
];