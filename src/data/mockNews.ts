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
  image: string;
  source: string;
  date: string;
  category: string;
  classification: Exclude<NewsCategory, 'all'>;
  credibilityScore: number;
  engine?: string; // Campo opcional para indicar el motor de análisis utilizado
  ai_report?: string; // Campo opcional para el reporte de IA
  claim?: string; // Campo opcional para la afirmación de la noticia ingresada por el usuario
  evidence_urls?: string[]; // Campo opcional para las URLs de evidencia ingresadas por el usuario
  content?: string;
  analysis: AnalysisFactor[];
  summary?: string;
  url: string;
}
