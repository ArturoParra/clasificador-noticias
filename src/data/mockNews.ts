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
  content?: string;
  analysis: AnalysisFactor[];
}
