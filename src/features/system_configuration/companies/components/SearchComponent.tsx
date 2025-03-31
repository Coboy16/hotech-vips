import React from "react";
import { Search, X } from "lucide-react";
import { Building2, Users, FolderTree, Briefcase } from "lucide-react"; // Reusar iconos de NodeDetailPanel
import {
  OrganizationalNode,
  NodeType,
} from "../../../../model/organizationalStructure"; // Importar desde model

// Reusar config de iconos
const nodeTypesConfig: Record<
  NodeType,
  { label: string; icon: React.ElementType }
> = {
  company: { label: "Compañía", icon: Building2 },
  branch: { label: "Sucursal", icon: Building2 },
  department: { label: "Departamento", icon: Users },
  section: { label: "Sección", icon: FolderTree },
  unit: { label: "Unidad", icon: Briefcase },
};

interface SearchComponentProps {
  onSearch: (term: string) => void;
  searchResults: OrganizationalNode[];
  onSelectNode: (node: OrganizationalNode) => void;
  searchTerm: string;
  isLoading?: boolean; // Opcional: para mostrar indicador de búsqueda
}

export function SearchComponent({
  onSearch,
  searchResults,
  onSelectNode,
  searchTerm,
  isLoading = false,
}: SearchComponentProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  const clearSearch = () => {
    onSearch("");
  };

  // Obtener el icono según el tipo de nodo
  const getNodeIcon = (type: NodeType) => {
    const { icon: NodeIcon } = nodeTypesConfig[type] || { icon: Building2 };
    return <NodeIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />;
  };

  return (
    <div className="w-full relative">
      {" "}
      {/* Relative para posicionar resultados */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar en estructura..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full pl-9 pr-10 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
        {/* Mostrar icono de carga o botón de limpiar */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-400"></div>
          ) : searchTerm ? (
            <button
              onClick={clearSearch}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>
      {/* Resultados de Búsqueda */}
      {searchTerm && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white rounded-md shadow-lg border border-gray-200 z-30">
          {searchResults.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {searchResults.map((node) => (
                <li
                  key={node.id}
                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center space-x-2 text-sm"
                  onClick={() => {
                    onSelectNode(node);
                    onSearch(""); // Opcional: limpiar búsqueda al seleccionar
                  }}
                >
                  {getNodeIcon(node.type)}
                  <span
                    className="truncate font-medium text-gray-800"
                    title={node.name}
                  >
                    {node.name}
                  </span>
                  <span className="ml-auto text-xs text-gray-500 capitalize flex-shrink-0">
                    {nodeTypesConfig[node.type]?.label || node.type}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-3 px-3 text-center text-sm text-gray-500">
              No se encontraron resultados.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
