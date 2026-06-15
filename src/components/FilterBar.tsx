import type { NewsCategory } from '../types/types';

interface FilterBarProps {
  selectedCategory: NewsCategory;
  onCategoryChange: (category: NewsCategory) => void;
}

const categories: { value: NewsCategory; label: string }[] = [
  { value: 'all', label: 'Todas las Noticias' },
  { value: 'verdadera', label: 'Verdaderas' },
   { value: 'falsa', label: 'Falsas' },
  /*{ value: 'satire', label: 'Sátira' }, */
  { value: 'engañosa', label: 'Engañosas' },
];

export function FilterBar({ selectedCategory, onCategoryChange }: FilterBarProps) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-white mb-4">Filtrar por Categoría</h2>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => onCategoryChange(category.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              selectedCategory === category.value
                ? 'bg-white text-black scale-105 shadow-lg'
                : 'bg-gray-900 text-gray-300 border border-gray-800 hover:bg-gray-800 hover:text-white hover:scale-105 hover:border-gray-700'
            } active:scale-95`}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
}