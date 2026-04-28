export type NewsCategory = 'all' | 'real'  | 'fake' /*| 'satire' */ | 'misleading' | 'none';

export interface SearchFilters {
  text: string;
  language: string;
  country: string;
  category: string;
  dateFrom: string;
  dateTo: string;
  sourceDomain: string;
  credibilityMin: number;
  credibilityMax: number;
}
