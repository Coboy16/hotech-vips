import React, { useState } from 'react';
import { ChevronRight, Building2, Building, Users, FolderTree, Briefcase, MoreVertical } from 'lucide-react';
import { ContextMenu } from './ContextMenu';
import { ConfirmationModal } from './ConfirmationModal';
import { Toast } from './Toast';
import { OrganizationalNode } from '../types';

interface OrganizationalTreeProps {
  node: OrganizationalNode;
  onSelect: (node: OrganizationalNode) => void;
  selectedNode?: OrganizationalNode | null;
  expandedNodes: string[];
  onToggleExpand: (nodeId: string) => void;
  level?: number;
  onEdit?: (node: OrganizationalNode) => void; // Nueva prop para manejar edición
}

export function OrganizationalTree({
  node,
  onSelect,
  selectedNode,
  expandedNodes,
  onToggleExpand,
  level = 0,
  onEdit
}: OrganizationalTreeProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<'create' | 'delete' | null>(null);
  const [showToast, setShowToast] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);

  const isExpanded = expandedNodes.includes(node.id);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedNode?.id === node.id;

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'company':
        return <Building2 className="w-5 h-5 text-blue-500 flex-shrink-0" />;
      case 'branch':
        return <Building className="w-5 h-5 text-green-500 flex-shrink-0" />;
      case 'department':
        return <Users className="w-5 h-5 text-purple-500 flex-shrink-0" />;
      case 'section':
        return <FolderTree className="w-5 h-5 text-amber-500 flex-shrink-0" />;
      case 'unit':
        return <Briefcase className="w-5 h-5 text-blue-500 flex-shrink-0" />;
      default:
        return <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0" />;
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleCreateNode = () => {
    setContextMenu(null);
    setShowConfirmation('create');
  };

  const handleEditNode = () => {
    setContextMenu(null);
    // Seleccionar el nodo actual
    onSelect(node);
    // Llamar a la función de edición si está disponible
    if (onEdit) {
      onEdit(node);
    } else {
      // Si no hay función de edición, mostrar un toast informativo
      setShowToast({
        type: 'warning',
        message: 'Funcionalidad de edición no disponible'
      });
    }
  };

  const handleDeleteNode = () => {
    setContextMenu(null);
    setShowConfirmation('delete');
  };

  const handleConfirmCreate = () => {
    setShowConfirmation(null);
    // Lógica para crear nuevo nodo
    setShowToast({
      type: 'success',
      message: `Nuevo ${getNodeTypeName(node.type)} creado correctamente`
    });
  };

  const handleConfirmDelete = () => {
    setShowConfirmation(null);
    // Lógica para eliminar nodo
    setShowToast({
      type: 'success',
      message: `${getNodeTypeName(node.type)} eliminado correctamente`
    });
  };

  const getNodeTypeName = (type: string) => {
    switch (type) {
      case 'company':
        return 'Compañía';
      case 'branch':
        return 'Sucursal';
      case 'department':
        return 'Departamento';
      case 'section':
        return 'Sección';
      case 'unit':
        return 'Unidad';
      default:
        return type;
    }
  };

  return (
    <div className="select-none">
      <div
        className={`
          group relative flex items-start px-2 py-2 rounded-lg cursor-pointer
          ${isSelected ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-700'}
          transition-colors duration-150
        `}
        style={{ paddingLeft: `${(level * 1.5) + 0.5}rem` }}
        onClick={() => onSelect(node)}
        onDoubleClick={() => hasChildren && onToggleExpand(node.id)}
        onContextMenu={handleContextMenu}
        title={`${node.name}${node.metadata?.contact ? `\n\nResponsable: ${node.metadata.contact.managerFullName}\nCargo: ${node.metadata.contact.position}\nEmail: ${node.metadata.contact.email}\nTeléfono: ${node.metadata.contact.phone} ext. ${node.metadata.contact.extension}\nUbicación: ${node.metadata.contact.physicalLocation.building}, ${node.metadata.contact.physicalLocation.floor}, ${node.metadata.contact.physicalLocation.office}` : ''}`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) {
              onToggleExpand(node.id);
            }
          }}
          className={`
            mt-1 w-5 h-5 flex items-center justify-center mr-1 rounded 
            hover:bg-gray-100 flex-shrink-0
            ${!hasChildren && 'invisible'}
          `}
        >
          <ChevronRight
            className={`w-4 h-4 transition-transform duration-150 ${
              isExpanded ? 'transform rotate-90' : ''
            }`}
          />
        </button>

        {getNodeIcon(node.type)}
        
        <div className="ml-2 min-w-0 flex-1">
          <div className="flex items-start">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium leading-5 whitespace-normal break-words">
                {node.name}
                {node.metadata?.employeeCount !== undefined && (
                  <span className="ml-1 text-xs text-gray-500">
                    ({node.metadata.employeeCount})
                  </span>
                )}
              </div>
              {node.metadata?.contact && (
                <div className="text-xs text-gray-500 whitespace-normal break-words">
                  {node.metadata.contact.managerFullName}
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setContextMenu({ x: e.clientX, y: e.clientY });
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-opacity duration-150 flex-shrink-0 ml-2"
        >
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-1">
          {node.children?.map((child) => (
            <OrganizationalTree
              key={child.id}
              node={child}
              onSelect={onSelect}
              selectedNode={selectedNode}
              expandedNodes={expandedNodes}
              onToggleExpand={onToggleExpand}
              level={level + 1}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}

      {contextMenu && (
        <ContextMenu
          node={node}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onCreateClick={handleCreateNode}
          onEditClick={handleEditNode}
          onDeleteClick={handleDeleteNode}
        />
      )}

      {showConfirmation === 'create' && (
        <ConfirmationModal
          title={`Crear nuevo ${getNodeTypeName(node.type)}`}
          message={`¿Desea crear un nuevo ${getNodeTypeName(node.type)}?`}
          confirmLabel="Crear"
          cancelLabel="Cancelar"
          onConfirm={handleConfirmCreate}
          onCancel={() => setShowConfirmation(null)}
        />
      )}

      {showConfirmation === 'delete' && (
        <ConfirmationModal
          title={`Eliminar ${getNodeTypeName(node.type)}`}
          message={`¿Está seguro que desea eliminar este ${getNodeTypeName(node.type)}? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirmation(null)}
          type="danger"
        />
      )}

      {showToast && (
        <Toast
          type={showToast.type}
          message={showToast.message}
          onClose={() => setShowToast(null)}
        />
      )}
    </div>
  );
}