import React from "react";
import { Search, X } from "lucide-react";
import {
  Building2,
  Users,
  FolderTree,
  Briefcase,
  Building,
} from "lucide-react";
import { OrganizationalNode } from "../types";

interface SearchComponentProps {
  onSearch: (term: string) => void;
  searchResults: OrganizationalNode[];
  onSelectNode: (node: OrganizationalNode) => void;
  searchTerm: string;
}

export function SearchComponent({
  onSearch,
  searchResults,
  onSelectNode,
  searchTerm,
}: SearchComponentProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  const clearSearch = () => {
    onSearch("");
  };

  // Obtener el icono según el tipo de nodo
  const getNodeIcon = (type: string) => {
    switch (type) {
      case "company":
        return <Building2 className="w-5 h-5 text-blue-500 flex-shrink-0" />;
      case "branch":
        return <Building className="w-5 h-5 text-green-500 flex-shrink-0" />;
      case "department":
        return <Users className="w-5 h-5 text-purple-500 flex-shrink-0" />;
      case "section":
        return <FolderTree className="w-5 h-5 text-amber-500 flex-shrink-0" />;
      case "unit":
        return <Briefcase className="w-5 h-5 text-blue-500 flex-shrink-0" />;
      default:
        return <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0" />;
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Buscar por nombre, responsable o tipo..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {searchTerm && (
        <div className="mt-2 max-h-60 overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-200">
          {searchResults.length > 0 ? (
            <div>
              <div className="py-2 px-3 bg-gray-100">
                <p className="text-xs text-gray-500">
                  {searchResults.length} resultados encontrados
                </p>
              </div>
              <div className="divide-y divide-gray-100">
                {searchResults.map((node) => (
                  <div
                    key={node.id}
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center space-x-2"
                    onClick={() => onSelectNode(node)}
                  >
                    {getNodeIcon(node.type)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {node.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {node.metadata?.contact?.managerFullName || ""}
                        {node.metadata?.contact?.managerFullName &&
                          node.metadata?.contact?.position &&
                          " • "}
                        {node.metadata?.contact?.position || ""}
                      </p>
                    </div>
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      {node.type.charAt(0).toUpperCase() + node.type.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-4 px-3 text-center text-sm text-gray-500">
              No se encontraron resultados para "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
