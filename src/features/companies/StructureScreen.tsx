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
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [showForm, setShowForm] = useState(false);
  const [nodeForForm, setNodeForForm] = useState<OrganizationalNode | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<OrganizationalNode | null>(
    null
  );
  const [localToast, setLocalToast] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);

  // --- Hook Principal ---
  // TODO: Reemplazar con lógica real para obtener licenseId
  const TEMP_LICENSE_ID = "12cf0e46-963b-40d7-92f7-a2e3b740501b"; // <-- TEMPORAL
  const {
    treeData,
    selectedNode,
    loading: loadingTree,
    saving: isSavingNode,
    error: structureError, // Este es el error del hook
    // Métodos del hook
    addNode,
    updateNode,
    deleteNode, // Asegúrate que el hook lo exporte si confirmDelete lo usa
    // toggleNodeStatus, // Descomentar si se implementa botón
    handleSelectNode,
    // handleToggleExpand, // El árbol display ahora maneja expansión interna
  } = useOrganizationalStructure(TEMP_LICENSE_ID);

  // --- Búsqueda ---
  const searchResults = useMemo(() => {
    if (!debouncedSearchTerm) return [];
    const term = debouncedSearchTerm.toLowerCase();
    const results: OrganizationalNode[] = [];
    const search = (nodes: OrganizationalNode[]) => {
      nodes.forEach((node) => {
        let isMatch = false;
        if (node.name?.toLowerCase().includes(term)) isMatch = true;
        if (node.type?.toLowerCase().includes(term)) isMatch = true;
        if (node.code?.toLowerCase().includes(term)) isMatch = true;
        // Podrías añadir búsqueda en metadata si es necesario
        // if (node.metadata?.contact?.managerFullName?.toLowerCase().includes(term)) isMatch = true;

        if (isMatch) {
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
    handleSelectNode(node);
    setSearchTerm(""); // Limpiar búsqueda
  };

  const handleAddNewChild = (parentNode: OrganizationalNode) => {
    const childType = getChildNodeType(parentNode.type);
    if (!childType) {
      notify.error(
        `${nodeTypesConfig[parentNode.type].label} no puede tener subniveles.`
      );
      return;
    }
    setNodeForForm(parentNode); // Guardamos el padre
    setIsCreating(true);
    setShowForm(true);
  };

  const handleEdit = (nodeToEdit: OrganizationalNode) => {
    setNodeForForm(nodeToEdit); // Guardamos el nodo a editar
    setIsCreating(false);
    setShowForm(true);
  };

  const handleDelete = (node: OrganizationalNode) => {
    setNodeToDelete(node);
    setShowDeleteConfirmation(true);
  };

  // --- Handlers para Acciones (Submit, Confirm) ---
  const handleSubmitForm = async (formData: NodeFormData, type: NodeType) => {
    let success = false;
    if (isCreating && nodeForForm) {
      // Creando hijo
      // Pasamos el ID del padre (nodeForForm.id), los datos del form, y el tipo del *nuevo* nodo
      const newNode = await addNode(nodeForForm.id, formData, type);
      success = !!newNode;
    } else if (!isCreating && nodeForForm) {
      // Editando
      // Pasamos el ID del nodo a editar (nodeForForm.id) y los datos del form
      const updatedNode = await updateNode(nodeForForm.id, formData);
      success = !!updatedNode;
    } else {
      console.error(
        "Estado inválido para guardar formulario (isCreating o nodeForForm incorrecto)"
      );
      notify.error("No se pudo determinar la acción a realizar.");
    }

    if (success) {
      setShowForm(false); // Cerrar el formulario solo si la operación fue exitosa (según el hook)
    }
    // Los toasts de éxito/error ya los maneja el hook `useOrganizationalStructure`
  };

  const confirmDelete = async () => {
    if (!nodeToDelete) return;
    // const nodeName = nodeToDelete.name; // Guardar nombre para el toast
    const success = await deleteNode(nodeToDelete.id); // Usa deleteNode del hook
    setShowDeleteConfirmation(false);
    if (success) {
      // El hook ya actualiza treeData y muestra toast
      if (selectedNode?.id === nodeToDelete?.id) {
        handleSelectNode(null); // Deseleccionar si se eliminó el nodo seleccionado
      }
      setNodeToDelete(null);
    } else {
      // El hook ya mostró el toast de error
      setNodeToDelete(null); // Asegurarse de limpiar incluso si falló
    }
  };

  // --- Efecto para mostrar errores generales del hook ---
  useEffect(() => {
    if (structureError) {
      // **ASEGURARSE QUE structureError ES UN STRING**
      const errorMessage =
        typeof structureError === "string"
          ? structureError
          : "Ocurrió un error inesperado cargando la estructura."; // Mensaje fallback

      // Usa tu componente Toast local o react-hot-toast
      setLocalToast({ type: "error", message: errorMessage });
      // O usa notify: notify.error(errorMessage, { id: 'structure-error' }); // id para evitar duplicados
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
            {/* <button onClick={handleAddNewRoot} ... > ... </button> // Botón raíz opcional */}
          </div>
          <SearchComponent
            onSearch={handleSearch}
            searchResults={searchResults}
            onSelectNode={handleSelectSearchResult}
            searchTerm={searchTerm}
            isLoading={loadingTree && !!debouncedSearchTerm} // Indicador mientras busca + carga
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
                No hay estructura definida.
              </div>
            ) : treeData.length > 0 ? (
              <OrganizationalTreeDisplay
                nodes={treeData}
                selectedNode={selectedNode}
                highlightedNodes={new Set(searchResults.map((n) => n.id))}
                onSelectNode={handleSelectNode}
                onAddChild={handleAddNewChild}
                onEditNode={handleEdit}
                onDeleteNode={handleDelete}
              />
            ) : null /* Error se muestra en Toast */
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
            isLoading={isSavingNode} // Pasa estado de guardado
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
          node={isCreating ? null : nodeForForm} // Nodo a editar (null si crea)
          parentNode={isCreating ? nodeForForm : null} // Padre si crea hijo
          onClose={() => setShowForm(false)}
          onSubmit={handleSubmitForm}
          isLoading={isSavingNode}
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

// Exportación por defecto si es el componente principal de la ruta
export default StructureScreen;
