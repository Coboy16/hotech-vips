import { Plus, Edit, Trash } from 'lucide-react';
import { OrganizationalNode } from '../types';

interface ContextMenuProps {
  node: OrganizationalNode;
  x: number;
  y: number;
  onClose: () => void;
  onCreateClick: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

export function ContextMenu({ node, x, y, onClose, onCreateClick, onEditClick, onDeleteClick }: ContextMenuProps) {
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
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div
        className="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 w-56"
        style={{ left: x, top: y }}
      >
        <button
          onClick={onCreateClick}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Crear nuevo {getNodeTypeName(node.type)}</span>
        </button>
        <button
          onClick={onEditClick}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
        >
          <Edit className="w-4 h-4" />
          <span>Editar {getNodeTypeName(node.type)}</span>
        </button>
        <button
          onClick={onDeleteClick}
          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
        >
          <Trash className="w-4 h-4" />
          <span>Eliminar {getNodeTypeName(node.type)}</span>
        </button>
      </div>
    </>
  );
}