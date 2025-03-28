/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { organizationalStructureService } from "../services/organizationalStructureService";
import {
  OrganizationalNode,
  NodeType,
  CreateNodeDtoUnion,
  UpdateNodeDtoUnion,
} from "../../../../model/organizationalStructure";
import { NodeFormData } from "../schemas/nodeSchema";
import {
  transformApiCompaniesToTree,
  transformApiNodeToUiNode,
  transformNodeToCreateDto,
  transformNodeToUpdateDto,
  findNodeById,
  addNodeToTree,
  updateNodeInTree,
  removeNodeFromTree,
} from "../utils/adapters";

/**
 * Hook para gestionar el estado y las operaciones de la estructura organizacional.
 * @param initialLicenseId El ID de la licencia inicial para cargar el árbol.
 */
export const useOrganizationalStructure = (initialLicenseId: string | null) => {
  // Estado del Árbol
  const [treeData, setTreeData] = useState<OrganizationalNode[]>([]); // Estructura de árbol para la UI

  // Estado de Selección y UI
  const [selectedNode, setSelectedNode] = useState<OrganizationalNode | null>(
    null
  );
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set()); // IDs de nodos expandidos

  // Estado de Carga y Errores
  const [loading, setLoading] = useState<boolean>(false); // Para carga inicial del árbol
  const [saving, setSaving] = useState<boolean>(false); // Para operaciones CRUD
  const [error, setError] = useState<string | null>(null);

  // Estado del Contexto Actual
  const [currentLicenseId, setCurrentLicenseId] = useState<string | null>(
    initialLicenseId
  );

  // --- Carga del Árbol ---
  const loadTree = useCallback(async (licenseIdToLoad: string | null) => {
    if (!licenseIdToLoad) {
      setTreeData([]); // Limpiar árbol si no hay licencia
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setSelectedNode(null); // Deseleccionar al cargar nuevo árbol
    setExpandedNodes(new Set()); // Colapsar todo
    console.log(`[Hook] Cargando árbol para licencia: ${licenseIdToLoad}`);
    try {
      // Usa el servicio para obtener las compañías y sus relaciones
      const apiCompanies =
        await organizationalStructureService.getOrganizationalTree(
          licenseIdToLoad
        );
      // Transforma la respuesta de la API a la estructura de árbol de UI
      const uiTree = transformApiCompaniesToTree(apiCompanies, licenseIdToLoad);
      setTreeData(uiTree);
      console.log("[Hook] Árbol cargado y transformado.");
      // Podrías auto-expandir el primer nivel si lo deseas
      // if (uiTree.length > 0) {
      //     setExpandedNodes(new Set(uiTree.map(node => node.id)));
      // }
    } catch (err: any) {
      const message = `Error al cargar la estructura organizacional: ${
        err.message || "Error desconocido"
      }`;
      setError(message);
      console.error(message, err);
      toast.error("Error al cargar la estructura.");
      setTreeData([]); // Limpiar árbol en caso de error
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar árbol inicial o cuando cambie currentLicenseId
  useEffect(() => {
    loadTree(currentLicenseId);
  }, [currentLicenseId, loadTree]);

  // --- Operaciones CRUD ---

  /** Añade un nuevo nodo */
  const addNode = useCallback(
    async (
      parentId: string | null, // null para compañía raíz
      formData: NodeFormData,
      targetType: NodeType // Tipo del nodo a crear
    ): Promise<OrganizationalNode | null> => {
      setSaving(true);
      setError(null);
      console.log(
        `[Hook] Creando nodo tipo ${targetType} bajo padre ${parentId}`
      );
      try {
        // Transforma los datos del formulario al DTO apropiado usando el adapter
        const { dto } = transformNodeToCreateDto(
          parentId,
          formData,
          targetType
        );
        if (!dto)
          throw new Error(
            `Datos inválidos para crear nodo tipo ${targetType}.`
          );

        // Llama al servicio para crear el nodo
        const newNodeApi = await organizationalStructureService.createNode(
          targetType,
          dto as CreateNodeDtoUnion
        );
        if (!newNodeApi)
          throw new Error(`Error en la API al crear el nodo ${targetType}.`);

        // Transforma el nodo de API a nodo de UI
        const newNodeUi = transformApiNodeToUiNode(
          newNodeApi,
          targetType,
          parentId,
          currentLicenseId
        );

        // Actualiza el estado del árbol localmente
        setTreeData((prevTree) => addNodeToTree(prevTree, parentId, newNodeUi));

        toast.success(
          `"${newNodeUi.name}" (${targetType}) creado exitosamente.`
        );
        setSelectedNode(newNodeUi); // Seleccionar el nuevo nodo
        // Asegurarse que el padre esté expandido
        if (parentId) {
          setExpandedNodes((prev) => new Set(prev).add(parentId));
        }
        return newNodeUi;
      } catch (err: any) {
        const message = `Error al crear nodo: ${
          err.message || "Error desconocido"
        }`;
        setError(message);
        console.error(message, err);
        toast.error("Error al crear el nodo.");
        return null;
      } finally {
        setSaving(false);
      }
    },
    [currentLicenseId]
  ); // Depende de currentLicenseId si crea compañía

  /** Actualiza un nodo existente */
  const updateNode = useCallback(
    async (
      nodeId: string,
      formData: NodeFormData // Ya viene validado por Zod
    ): Promise<OrganizationalNode | null> => {
      setSaving(true);
      setError(null);
      console.log(`[Hook] Actualizando nodo ID: ${nodeId}`);
      try {
        // Encuentra el nodo existente para obtener su tipo y parentId
        const existingNode = findNodeById(treeData, nodeId);
        if (!existingNode)
          throw new Error("Nodo no encontrado en el árbol local.");

        // Transforma los datos del formulario al DTO de actualización
        const updateDto = transformNodeToUpdateDto(formData);
        if (!updateDto) throw new Error("Datos inválidos para actualizar.");

        // Llama al servicio para actualizar
        const updatedNodeApi = await organizationalStructureService.updateNode(
          existingNode.type,
          nodeId,
          updateDto as UpdateNodeDtoUnion
        );
        if (!updatedNodeApi)
          throw new Error(
            `Error en la API al actualizar el nodo ${existingNode.type}.`
          );

        // Transforma la respuesta de API a nodo de UI
        const updatedNodeUi = transformApiNodeToUiNode(
          updatedNodeApi,
          existingNode.type,
          existingNode.parentId,
          existingNode.licenseId
        );

        // Actualiza el estado del árbol localmente
        setTreeData((prevTree) =>
          updateNodeInTree(prevTree, nodeId, updatedNodeUi)
        );

        toast.success(`"${updatedNodeUi.name}" actualizado exitosamente.`);
        // Actualizar nodo seleccionado si es el mismo
        if (selectedNode?.id === nodeId) {
          setSelectedNode(updatedNodeUi);
        }
        return updatedNodeUi;
      } catch (err: any) {
        const message = `Error al actualizar nodo: ${
          err.message || "Error desconocido"
        }`;
        setError(message);
        console.error(message, err);
        toast.error("Error al actualizar el nodo.");
        return null;
      } finally {
        setSaving(false);
      }
    },
    [treeData, selectedNode]
  ); // Depende del árbol actual y del nodo seleccionado

  /** Elimina un nodo */
  const deleteNode = useCallback(
    async (nodeId: string): Promise<boolean> => {
      setSaving(true);
      setError(null);
      console.log(`[Hook] Eliminando nodo ID: ${nodeId}`);
      try {
        const nodeToDelete = findNodeById(treeData, nodeId);
        if (!nodeToDelete) throw new Error("Nodo no encontrado para eliminar.");

        // Llama al servicio para eliminar
        const success = await organizationalStructureService.deleteNode(
          nodeToDelete.type,
          nodeId
        );
        if (!success)
          throw new Error(
            `Error en la API al eliminar el nodo ${nodeToDelete.type}.`
          );

        // Actualiza el estado del árbol localmente
        setTreeData((prevTree) => removeNodeFromTree(prevTree, nodeId));

        toast.success(`"${nodeToDelete.name}" eliminado exitosamente.`);
        // Deseleccionar si era el nodo seleccionado
        if (selectedNode?.id === nodeId) {
          setSelectedNode(null);
        }
        return true;
      } catch (err: any) {
        const message = `Error al eliminar nodo: ${
          err.message || "Error desconocido"
        }`;
        setError(message);
        console.error(message, err);
        toast.error("Error al eliminar el nodo.");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [treeData, selectedNode]
  ); // Depende del árbol y nodo seleccionado

  /** Cambia el estado (activo/inactivo) de un nodo */
  const toggleNodeStatus = useCallback(
    async (nodeId: string): Promise<OrganizationalNode | null> => {
      setSaving(true);
      setError(null);
      console.log(`[Hook] Cambiando estado nodo ID: ${nodeId}`);
      try {
        const existingNode = findNodeById(treeData, nodeId);
        if (!existingNode) throw new Error("Nodo no encontrado.");

        // Llama al servicio PATCH /status
        const updatedNodeApi =
          await organizationalStructureService.updateNodeStatus(
            existingNode.type,
            nodeId
          );
        if (!updatedNodeApi)
          throw new Error(
            `Error en la API al cambiar estado del nodo ${existingNode.type}.`
          );

        // Transforma respuesta y actualiza UI
        const updatedNodeUi = transformApiNodeToUiNode(
          updatedNodeApi,
          existingNode.type,
          existingNode.parentId,
          existingNode.licenseId
        );
        setTreeData((prevTree) =>
          updateNodeInTree(prevTree, nodeId, updatedNodeUi)
        );

        toast.success(
          `Estado de "${updatedNodeUi.name}" cambiado a ${updatedNodeUi.status}.`
        );
        if (selectedNode?.id === nodeId) {
          setSelectedNode(updatedNodeUi);
        }
        return updatedNodeUi;
      } catch (err: any) {
        const message = `Error al cambiar estado: ${
          err.message || "Error desconocido"
        }`;
        setError(message);
        console.error(message, err);
        toast.error("Error al cambiar el estado del nodo.");
        return null;
      } finally {
        setSaving(false);
      }
    },
    [treeData, selectedNode]
  );

  // --- Handlers de UI (Selección, Expansión) ---
  const handleSelectNode = useCallback((node: OrganizationalNode | null) => {
    console.log("[Hook] Nodo seleccionado:", node?.id ?? "Ninguno");
    setSelectedNode(node);
  }, []);

  const handleToggleExpand = useCallback((nodeId: string) => {
    console.log(`[Hook] Toggle expand nodo: ${nodeId}`);
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  // Función para cambiar la licencia que se visualiza
  const setViewingLicense = useCallback((newLicenseId: string | null) => {
    console.log(`[Hook] Cambiando a licencia: ${newLicenseId}`);
    setCurrentLicenseId(newLicenseId);
    // La carga se disparará por el useEffect que depende de currentLicenseId
  }, []);

  return {
    // Estado
    treeData,
    selectedNode,
    expandedNodes,
    loading,
    saving,
    error,
    currentLicenseId, // Exponer ID de licencia actual
    // Acciones
    setViewingLicense, // Para cambiar la licencia
    loadTree, // Para recargar manualmente si es necesario
    addNode,
    updateNode,
    deleteNode,
    toggleNodeStatus, // Exponer cambio de estado
    // Handlers UI
    handleSelectNode,
    handleToggleExpand,
  };
};
