import React, { useState, useEffect, useMemo } from "react";
import { toast as notify } from "react-hot-toast"; // Renombrado para evitar colisión con Toast local
import { useOrganizationalStructure } from "./hooks/useOrganizationalStructure";
import { useDebounce } from "./hooks/useDebounce";
import {
  OrganizationalNode,
  NodeType,
} from "../../../model/organizationalStructure";
import { OrganizationalTreeDisplay } from "./components/OrganizationalTreeDisplay";
import { NodeDetailPanel } from "./components/NodeDetailPanel";
import { SearchComponent } from "./components/SearchComponent"; // Corregido nombre
import { NodeForm } from "./components/NodeForm";
import { NodeFormData } from "./schemas/nodeSchema";
import { ConfirmationModal } from "./components/ConfirmationModal";
import { Toast } from "./components/Toast"; // Tu componente Toast local
import { Briefcase, Building2, FolderTree, Users } from "lucide-react";

// Mapeo de tipos (puede ir en utils si se repite)
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

export function StructureScreen() {
  // --- Estados de UI ---
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // Delay para búsqueda
  const [showForm, setShowForm] = useState(false);
  const [nodeForForm, setNodeForForm] = useState<OrganizationalNode | null>(
    null
  ); // Nodo a editar o padre al crear
  const [isCreating, setIsCreating] = useState(false); // Distingue entre crear y editar en el form
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<OrganizationalNode | null>(
    null
  );
  const [localToast, setLocalToast] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);

  // --- Hook Principal ---
  // TODO: Obtener el licenseId dinámicamente (ej: desde un selector o contexto)
  const TEMP_LICENSE_ID = "12cf0e46-963b-40d7-92f7-a2e3b740501b"; // <--- REEMPLAZAR CON LÓGICA REAL
  const {
    treeData,
    selectedNode,
    loading: loadingTree,
    saving: isSavingNode, // Renombrado para claridad
    error: structureError,
    // Métodos del hook
    addNode,
    updateNode,
    handleSelectNode, // Usar el selector del hook
    // loadTree, // Para recargar manualmente
    // setViewingLicense, // Para cambiar licencia
  } = useOrganizationalStructure(TEMP_LICENSE_ID);

  // --- Búsqueda ---
  const searchResults = useMemo(() => {
    if (!debouncedSearchTerm) return [];

    const term = debouncedSearchTerm.toLowerCase();
    const results: OrganizationalNode[] = [];
    const search = (nodes: OrganizationalNode[]) => {
      nodes.forEach((node) => {
        if (
          node.name.toLowerCase().includes(term) ||
          node.type.toLowerCase().includes(term) ||
          node.code?.toLowerCase().includes(term)
        ) {
          results.push(node);
        }
        if (node.children) search(node.children);
      });
    };
    search(treeData);
    return results;
  }, [debouncedSearchTerm, treeData]);

  // --- Handlers de UI para abrir Modales/Formularios ---
  const handleSearch = (term: string) => setSearchTerm(term);

  const handleSelectSearchResult = (node: OrganizationalNode) => {
    handleSelectNode(node); // Usa el handler del hook para seleccionar
    setSearchTerm(""); // Limpia la búsqueda al seleccionar
  };

  // Abre el formulario para crear un nodo raíz (Compañía) - Requiere adaptación si API no lo soporta

  // Abre el formulario para crear un hijo del nodo seleccionado
  const handleAddNewChild = (parentNode: OrganizationalNode) => {
    const childType = getChildNodeType(parentNode.type);
    if (!childType) {
      notify.error(
        `${nodeTypesConfig[parentNode.type].label} no puede tener subniveles.`
      );
      return;
    }
    setNodeForForm(parentNode); // Pasamos el padre para saber dónde añadir
    setIsCreating(true);
    setShowForm(true);
  };

  // Abre el formulario para editar el nodo dado
  const handleEdit = (nodeToEdit: OrganizationalNode) => {
    setNodeForForm(nodeToEdit);
    setIsCreating(false);
    setShowForm(true);
  };

  // Abre el modal de confirmación para eliminar
  const handleDelete = (node: OrganizationalNode) => {
    setNodeToDelete(node);
    setShowDeleteConfirmation(true);
  };

  // --- Handlers para Acciones (Submit, Confirm) ---
  const handleSubmitForm = async (formData: NodeFormData, type: NodeType) => {
    if (isCreating && nodeForForm) {
      // Creando hijo
      await addNode(nodeForForm.id, formData, type); // Usa addNode del hook
      // addNode ya muestra toast y actualiza estado si tiene éxito
    } else if (!isCreating && nodeForForm) {
      // Editando
      await updateNode(nodeForForm.id, formData); // Usa updateNode del hook
      // updateNode ya muestra toast y actualiza estado
    } else {
      console.error("Estado inválido para guardar formulario");
      notify.error("No se pudo determinar la acción a realizar.");
    }
    // Cerramos el formulario independientemente del resultado (el hook maneja errores)
    setShowForm(false);
  };

  const confirmDelete = async () => {
    if (!nodeToDelete) return;
    // deleteNode ya muestra toast y actualiza estado
    setShowDeleteConfirmation(false);
    setNodeToDelete(null);
    // Si el nodo eliminado era el seleccionado, deseleccionar
    if (selectedNode?.id === nodeToDelete?.id) {
      handleSelectNode(null);
    }
  };

  // --- Efecto para mostrar errores del hook ---
  useEffect(() => {
    if (structureError) {
      // Usamos el Toast local o react-hot-toast si prefieres consistencia
      setLocalToast({ type: "error", message: structureError });
      // notify.error(structureError); // Alternativa
    }
  }, [structureError]);

  // --- Renderizado ---
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-100">
      {/* Panel Izquierdo - Árbol */}
      <div className="w-1/3 min-w-[300px] max-w-md border-r border-gray-200 bg-white flex flex-col h-full">
        {/* Cabecera Panel Izquierdo */}
        <div className="p-3 sm:p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-medium text-gray-900">
              Estructura Organizacional
            </h2>
            {/* Botón Añadir Raíz (Compañía) - Deshabilitado si API no soporta */}
            {/*
                    <button
                        onClick={handleAddNewRoot}
                        className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                        title="Agregar Compañía Raíz"
                        disabled={isSavingNode} // Deshabilitar si se está guardando algo
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                    */}
          </div>
          {/* Búsqueda */}
          <SearchComponent
            onSearch={handleSearch}
            searchResults={searchResults}
            onSelectNode={handleSelectSearchResult}
            searchTerm={searchTerm}
            isLoading={loadingTree && searchTerm.length > 0} // Muestra spinner si busca y carga
          />
        </div>

        {/* Contenedor del Árbol */}
        <div className="flex-1 overflow-y-auto p-2">
          {
            loadingTree && treeData.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                Cargando estructura...
              </div>
            ) : !loadingTree && treeData.length === 0 && !structureError ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No hay compañías en esta licencia.
              </div>
            ) : treeData.length > 0 ? (
              <OrganizationalTreeDisplay
                nodes={treeData}
                selectedNode={selectedNode}
                // expandedNodes={expandedNodes} // El display maneja su propio estado de expansión ahora
                // onToggleExpand={handleToggleExpand} // El display maneja su propio toggle
                highlightedNodes={new Set(searchResults.map((n) => n.id))} // Resalta resultados
                onSelectNode={handleSelectNode} // Pasa el selector del hook
                onAddChild={handleAddNewChild} // Pasa el handler para añadir
                onEditNode={handleEdit} // Pasa el handler para editar
                onDeleteNode={handleDelete} // Pasa el handler para eliminar
              />
            ) : null /* Error ya se maneja con toast */
          }
        </div>
      </div>

      {/* Panel Derecho - Detalles */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {selectedNode ? (
          <NodeDetailPanel
            node={selectedNode}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddChild={handleAddNewChild}
            isLoading={isSavingNode} // Pasa estado de guardado para deshabilitar botones
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 p-8 text-center">
            Selecciona un nodo de la estructura <br /> para ver o editar sus
            detalles.
          </div>
        )}
      </div>

      {/* Modales */}
      {showForm && (
        <NodeForm
          // Pasa el nodo a editar O el nodo padre al que se añadirá el hijo
          node={isCreating ? null : nodeForForm}
          parentNode={isCreating ? nodeForForm : null}
          onClose={() => setShowForm(false)}
          onSubmit={handleSubmitForm}
          isLoading={isSavingNode} // Pasa estado de guardado
        />
      )}

      {showDeleteConfirmation && nodeToDelete && (
        <ConfirmationModal
          title={`Eliminar ${
            nodeTypesConfig[nodeToDelete.type]?.label || "Nodo"
          }`}
          message={`¿Está seguro de eliminar "${nodeToDelete.name}"? Esta acción eliminará también todos sus subniveles y no se puede deshacer.`}
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteConfirmation(false)}
          type="danger"
        />
      )}

      {/* Toast Local */}
      {localToast && (
        <Toast
          type={localToast.type}
          message={localToast.message}
          onClose={() => setLocalToast(null)}
        />
      )}
    </div>
  );
}

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
