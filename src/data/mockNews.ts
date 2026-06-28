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
  category: string
  classification: Exclude<NewsCategory, 'all'>;
  credibilityScore: number;
  engine?: string; // Campo opcional para indicar el motor de análisis utilizado
  ai_report?: string; // Campo opcional para el reporte de IA
  content?: string;
  analysis: AnalysisFactor[];
  summary?: string;
  url: string;
}
