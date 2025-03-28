import React, { useState } from "react";
import {
  ChevronRight,
  Plus,
  Edit,
  Trash,
  MoreVertical,
  Building2,
  Users,
  FolderTree,
  Briefcase,
} from "lucide-react";
import {
  OrganizationalNode,
  NodeType,
} from "../../../../model/organizationalStructure";
import { ConfirmationModal } from "./ConfirmationModal"; // Asume que está en el mismo directorio o ruta correcta

interface OrganizationalTreeItemProps {
  node: OrganizationalNode;
  level: number;
  isSelected: boolean;
  isExpanded: boolean;
  isHighlighted?: boolean; // Para resaltar resultados de búsqueda
  onSelect: (node: OrganizationalNode) => void;
  onToggleExpand: (nodeId: string) => void;
  onAddChild: (parentNode: OrganizationalNode) => void;
  onEdit: (node: OrganizationalNode) => void;
  onDelete: (node: OrganizationalNode) => void;
  children?: React.ReactNode; // Para renderizar nodos hijos
}

// Mapeo de tipos a iconos y nombres (podría ser un utilitario)
const nodeTypesConfig: Record<
  NodeType,
  { label: string; icon: React.ElementType; canHaveChildren: boolean }
> = {
  company: { label: "Compañía", icon: Building2, canHaveChildren: true },
  branch: { label: "Sucursal", icon: Building2, canHaveChildren: true },
  department: { label: "Departamento", icon: Users, canHaveChildren: true },
  section: { label: "Sección", icon: FolderTree, canHaveChildren: true },
  unit: { label: "Unidad", icon: Briefcase, canHaveChildren: false },
};

export const OrganizationalTreeItem: React.FC<OrganizationalTreeItemProps> = ({
  node,
  level,
  isSelected,
  isExpanded,
  isHighlighted = false,
  onSelect,
  onToggleExpand,
  onAddChild,
  onEdit,
  onDelete,
  children,
}) => {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    label: nodeTypeName,
    icon: NodeIcon,
    canHaveChildren,
  } = nodeTypesConfig[node.type] || {
    label: node.type,
    icon: Building2,
    canHaveChildren: false,
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Evita que se propague al contenedor
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleSelect = () => {
    onSelect(node);
    // Si no tiene hijos, no necesita toggle
    if (canHaveChildren && node.children && node.children.length > 0) {
      // Podrías decidir si quieres expandir/colapsar al hacer clic
      // onToggleExpand(node.id);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita seleccionar al hacer clic en el icono
    if (canHaveChildren && node.children && node.children.length > 0) {
      onToggleExpand(node.id);
    }
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddChild(node);
    setContextMenu(null);
  };
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(node);
    setContextMenu(null);
  };
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true); // Abre modal de confirmación
    setContextMenu(null);
  };
  const confirmDelete = () => {
    onDelete(node);
    setShowDeleteConfirm(false);
  };

  const canCreateChild = getChildNodeType(node.type) !== null;

  return (
    <div className="select-none relative">
      {" "}
      {/* Relative para posicionar menú */}
      <div
        className={`
          group flex items-center px-2 py-1.5 rounded-md cursor-pointer transition-colors duration-150
          ${
            isSelected
              ? "bg-blue-100 text-blue-700"
              : "hover:bg-gray-100 text-gray-700"
          }
          ${isHighlighted ? "ring-2 ring-offset-1 ring-blue-400" : ""}
        `}
        style={{ paddingLeft: `${level * 1.25 + 0.5}rem` }} // Ajusta indentación
        onClick={handleSelect}
        onContextMenu={handleContextMenu}
      >
        {/* Botón de Expansión */}
        <button
          onClick={handleToggle}
          className={`
            flex-shrink-0 w-5 h-5 flex items-center justify-center mr-1 rounded hover:bg-gray-200
            ${
              !(canHaveChildren && node.children && node.children.length > 0) &&
              "invisible"
            } // Ocultar si no tiene hijos
          `}
          aria-expanded={isExpanded}
        >
          <ChevronRight
            className={`w-4 h-4 transition-transform duration-150 ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
        </button>

        {/* Icono del Nodo */}
        <NodeIcon
          className={`w-4 h-4 mr-2 flex-shrink-0 ${
            isSelected ? "text-blue-600" : "text-gray-500"
          }`}
        />

        {/* Nombre y Detalles */}
        <div className="flex-1 min-w-0 truncate">
          <span className="text-sm font-medium truncate" title={node.name}>
            {node.name}
          </span>
          {node.metadata?.employeeCount !== undefined &&
            node.metadata.employeeCount > 0 && (
              <span className="ml-1 text-xs text-gray-500">
                ({node.metadata.employeeCount})
              </span>
            )}
          {node.status === "inactive" && (
            <span className="ml-2 text-xs font-semibold text-red-600">
              (Inactivo)
            </span>
          )}
        </div>

        {/* Botón de Acciones (Más Opciones) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setContextMenu({ x: e.clientX, y: e.clientY });
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity duration-150 flex-shrink-0 ml-2"
          aria-label="Más opciones"
        >
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      {/* Hijos Renderizados */}
      {isExpanded && (
        <div className="mt-0.5">
          {" "}
          {/* Ajusta margen si es necesario */}
          {children}
        </div>
      )}
      {/* Menú Contextual */}
      {contextMenu && (
        <>
          {/* Overlay para cerrar menú al hacer clic fuera */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="absolute z-50 bg-white rounded-md shadow-lg border border-gray-200 py-1 w-48 text-sm"
            style={{ top: contextMenu.y + 5, left: contextMenu.x + 5 }} // Posicionamiento ligero
          >
            {canCreateChild && (
              <button
                onClick={handleAddClick}
                className="w-full px-3 py-1.5 text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4 text-blue-500" />
                <span>Añadir Subnivel</span>
              </button>
            )}
            <button
              onClick={handleEditClick}
              className="w-full px-3 py-1.5 text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
            >
              <Edit className="w-4 h-4 text-gray-500" />
              <span>Editar</span>
            </button>
            <button
              onClick={handleDeleteClick}
              className="w-full px-3 py-1.5 text-left text-red-600 hover:bg-red-50 flex items-center space-x-2"
            >
              <Trash className="w-4 h-4" />
              <span>Eliminar</span>
            </button>
          </div>
        </>
      )}
      {/* Modal de Confirmación de Eliminación */}
      {showDeleteConfirm && (
        <ConfirmationModal
          title={`Eliminar ${nodeTypeName}`}
          message={`¿Seguro que desea eliminar "${node.name}"? Esta acción eliminará también todos sus subniveles y no se puede deshacer.`}
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          type="danger"
        />
      )}
    </div>
  );
};

// Helper local (o mover a utils/adapters)
const getChildNodeType = (parentType: NodeType): NodeType | null => {
  switch (parentType) {
    case "company":
      return "branch";
    case "branch":
      return "department";
    case "department":
      return "section";
    case "section":
      return "unit";
    default:
      return null;
  }
};
