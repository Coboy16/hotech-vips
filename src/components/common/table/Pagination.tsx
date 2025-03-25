import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 25, 50, 100]
}) => {
  // Calcular el número total de páginas
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Calcular el rango de elementos que se están mostrando
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generar array de páginas a mostrar (siempre mostrar 5 páginas si es posible)
  const getPageNumbers = () => {
    const pages = [];
    
    // Si hay menos de 7 páginas en total, mostrarlas todas
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }
    
    // Siempre mostrar la primera página
    pages.push(1);
    
    // Si la página actual está entre las primeras 3, mostrar 1-5 y luego la última
    if (currentPage < 4) {
      for (let i = 2; i <= 5; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
      return pages;
    }
    
    // Si la página actual está entre las últimas 3, mostrar 1, luego las últimas 5
    if (currentPage > totalPages - 3) {
      pages.push('...');
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }
    
    // En cualquier otro caso, mostrar 1, ..., currentPage-1, currentPage, currentPage+1, ..., totalPages
    pages.push('...');
    pages.push(currentPage - 1);
    pages.push(currentPage);
    pages.push(currentPage + 1);
    pages.push('...');
    pages.push(totalPages);
    
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div>
          Mostrando {startItem} - {endItem} de {totalItems} resultados
        </div>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
        >
          {itemsPerPageOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex items-center gap-1">
        {/* Botón para ir a la primera página */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`p-1 rounded-md bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 ${
            currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : ''
          }`}
          aria-label="Primera página"
        >
          <ChevronsLeft className="h-5 w-5" />
        </button>

        
        {/* Botón para ir a la página anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-1 rounded-md bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 ${
            currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : ''
          }`}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        {/* Números de página */}
        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-500">
              ...
            </span>
          ) : (
            <button
              key={`page-${page}`}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              className={`px-3 py-1 rounded-md ${
                currentPage === page 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          )
        ))}
        
        {/* Botón para ir a la página siguiente */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-1 rounded-md bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 ${
            currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : ''
          }`}
          aria-label="Página siguiente"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Botón para ir a la última página */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`p-1 rounded-md bg-white  border border-gray-200  text-gray-500 hover:bg-gray-100 ${
            currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : ''
          }`}
          aria-label="Última página"
        >
          <ChevronsRight className="h-5 w-5" />
        </button>

      </div>
    </div>
  );
};

export default Pagination;