/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Tipo para las columnas de la tabla
export interface ColumnDefinition<T> {
  key: string;               // Identificador único para la columna
  header: string;            // Texto a mostrar en la cabecera
  render: (item: T) => ReactNode; // Función para renderizar el contenido de la celda
  sortable?: boolean;        // Si la columna permite ordenamiento
  className?: string;        // Clases adicionales para la cabecera
  cellClassName?: string;    // Clases adicionales para las celdas
  sortKey?: string | ((item: T) => any); // Clave o función para ordenar (opcional, usa key por defecto)
  align?: 'left' | 'center' | 'right';  // Alineación del contenido
}

// Tipo para las propiedades del componente SortableTable
interface SortableTableProps<T> {
  data: T[];                         // Datos a mostrar en la tabla
  columns: ColumnDefinition<T>[];    // Definición de columnas
  keyExtractor: (item: T) => string; // Función para extraer la clave única de cada elemento
  emptyMessage?: string;             // Mensaje a mostrar cuando no hay datos
  className?: string;                // Clases adicionales para la tabla
  onRowClick?: (item: T) => void;    // Función opcional que se ejecuta al hacer clic en una fila
  sortable?: boolean;                // Habilitar/deshabilitar el ordenamiento para toda la tabla
  initialSortKey?: string;           // Clave de ordenamiento inicial
  initialSortDirection?: 'asc' | 'desc'; // Dirección de ordenamiento inicial
  onSort?: (key: string, direction: 'asc' | 'desc') => void; // Callback cuando cambia el ordenamiento
}

const SortableTable = <T extends object>({
  data,
  columns,
  keyExtractor,
  emptyMessage = "No hay datos disponibles",
  className = "",
  onRowClick,
  sortable = true,
  initialSortKey,
  initialSortDirection = 'asc',
  onSort
}: SortableTableProps<T>) => {
  // Estado para el ordenamiento
  const [sortKey, setSortKey] = useState<string | undefined>(initialSortKey);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection);

  // Función para manejar el clic en la cabecera para ordenar
  const handleSortClick = (column: ColumnDefinition<T>) => {
    if (!sortable || !column.sortable) return;

    const key = column.key;
    
    // Si hacemos clic en la misma columna, invertimos la dirección
    if (key === sortKey) {
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
      if (onSort) onSort(key, newDirection);
    } else {
      // Si hacemos clic en una columna diferente, establecemos la nueva columna y dirección ascendente
      setSortKey(key);
      setSortDirection('asc');
      if (onSort) onSort(key, 'asc');
    }
  };

  // Ordenar los datos si se especifica una clave de ordenamiento
  const sortedData = [...data];
  if (sortable && sortKey) {
    const column = columns.find(col => col.key === sortKey);
    
    if (column) {
      sortedData.sort((a, b) => {
        let valueA: any;
        let valueB: any;

        // Determinar cómo obtener el valor para ordenar
        if (column.sortKey) {
          if (typeof column.sortKey === 'function') {
            valueA = column.sortKey(a);
            valueB = column.sortKey(b);
          } else {
            valueA = a[column.sortKey as keyof T];
            valueB = b[column.sortKey as keyof T];
          }
        } else {
          valueA = a[column.key as keyof T];
          valueB = b[column.key as keyof T];
        }

        // Manejar diferentes tipos de valores
        if (valueA === valueB) return 0;
        
        // Para strings, comparar sin distinguir entre mayúsculas y minúsculas
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return sortDirection === 'asc' 
            ? valueA.localeCompare(valueB, undefined, { sensitivity: 'base' })
            : valueB.localeCompare(valueA, undefined, { sensitivity: 'base' });
        }
        
        // Para otros tipos
        return sortDirection === 'asc' 
          ? (valueA < valueB ? -1 : 1)
          : (valueA > valueB ? -1 : 1);
      });
    }
  }

  // Función para obtener las clases de alineación
  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${getAlignClass(column.align)} ${
                  sortable && column.sortable ? 'cursor-pointer select-none' : ''
                } ${column.className || ''}`}
                onClick={() => sortable && column.sortable && handleSortClick(column)}
              >
                <div className="flex items-center space-x-1 justify-between">
                  <span>{column.header}</span>
                  {sortable && column.sortable && (
                    <div className="flex flex-col">
                      <ChevronUp 
                        className={`h-3 w-3 -mb-1 ${
                          sortKey === column.key && sortDirection === 'asc' 
                            ? 'text-blue-600' 
                            : 'text-gray-400'
                        }`} 
                      />
                      <ChevronDown 
                        className={`h-3 w-3 ${
                          sortKey === column.key && sortDirection === 'desc' 
                            ? 'text-blue-600' 
                            : 'text-gray-400'
                        }`} 
                      />
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.length > 0 ? (
            sortedData.map((item) => (
              <tr
                key={keyExtractor(item)}
                className={`${onRowClick ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(item)}
              >
                {columns.map((column) => (
                  <td
                    key={`${keyExtractor(item)}-${column.key}`}
                    className={`px-6 py-4 whitespace-nowrap ${getAlignClass(column.align)} ${column.cellClassName || ''}`}
                    onClick={(e) => column.cellClassName?.includes('stopPropagation') && e.stopPropagation()}
                  >
                    {column.render(item)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SortableTable;