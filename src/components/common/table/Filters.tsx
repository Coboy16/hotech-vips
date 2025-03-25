import React from 'react';
import { Search, FilterX, LayoutGrid, List } from 'lucide-react';

// Tipos para las opciones de filtro
interface FilterOption {
  value: string;
  label: string;
}

// Props para el componente
interface FiltersProps {
  // Estado y manejo del término de búsqueda
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  
  // Estado y manejo de los filtros seleccionados
  filterValues: {
    [key: string]: string;
  };
  onFilterChange: (filterName: string, value: string) => void;
  
  // Opciones para los filtros
  filterOptions: {
    [key: string]: {
      label: string;
      options: FilterOption[];
    };
  };
  
  // Manejo de la vista (lista/cuadrícula)
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
  
  // Restablecer todos los filtros
  onResetFilters: () => void;
}

const Filters: React.FC<FiltersProps> = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  filterValues,
  onFilterChange,
  filterOptions,
  viewMode,
  onViewModeChange,
  onResetFilters
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 items-center">
        {/* Buscador */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          {/* Selectores de filtro */}
          {Object.keys(filterOptions).map((filterKey) => (
            <div key={filterKey}>
              <select
                value={filterValues[filterKey] || ''}
                onChange={(e) => onFilterChange(filterKey, e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {filterOptions[filterKey].options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
          
          {/* Botón para restablecer filtros */}
          <button
            onClick={onResetFilters}
            className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg flex items-center hover:bg-gray-200"
            title="Restablecer filtros"
          >
            <FilterX className="mr-2 h-5 w-5" />
            Restablecer
          </button>
          
          {/* Toggle de vista (lista/cuadrícula) */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => onViewModeChange('list')}
              className={`px-3 py-2 flex items-center ${
                viewMode === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              title="Vista de lista"
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`px-3 py-2 flex items-center ${
                viewMode === 'grid'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              title="Vista de cuadrícula"
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;