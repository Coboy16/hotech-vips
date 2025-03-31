import React, { useState, useEffect, useCallback } from "react";
import { OrganizationalNode } from "../../../../model/organizationalStructure";
import { OrganizationalTreeItem } from "./OrganizationalTreeItem";
import { findNodeById, getNodePath } from "../utils/adapters"; // Importar utilidades

interface OrganizationalTreeDisplayProps {
  nodes: OrganizationalNode[]; // Los nodos raíz del árbol
  selectedNode: OrganizationalNode | null;
  onSelectNode: (node: OrganizationalNode | null) => void;
  onAddChild: (parentNode: OrganizationalNode) => void;
  onEditNode: (node: OrganizationalNode) => void;
  onDeleteNode: (node: OrganizationalNode) => void;
  isLoading?: boolean; // Indicador de carga general del árbol
  highlightedNodes?: Set<string>; // IDs de nodos a resaltar (ej: resultados búsqueda)
}

export const OrganizationalTreeDisplay: React.FC<
  OrganizationalTreeDisplayProps
> = ({
  nodes,
  selectedNode,
  onSelectNode,
  onAddChild,
  onEditNode,
  onDeleteNode,
  isLoading = false,
  highlightedNodes = new Set(),
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Efecto para expandir nodos cuando cambian los resultados de búsqueda (highlightedNodes)
  // o cuando se selecciona un nodo directamente.
  useEffect(() => {
    const nodeToExpandTo =
      selectedNode ||
      (highlightedNodes.size > 0
        ? findNodeById(nodes, Array.from(highlightedNodes)[0])
        : null);

    if (nodeToExpandTo) {
      const path = getNodePath(nodes, nodeToExpandTo.id);
      if (path.length > 0) {
        setExpandedNodes((prev) => {
          const newSet = new Set(prev);
          // Añadir todos los nodos en la ruta, excepto el último (el nodo hoja mismo)
          path.slice(0, -1).forEach((id) => newSet.add(id));
          return newSet;
        });
      }
    }
    // Si no hay nodo seleccionado ni resaltado, podríamos colapsar todo o mantener el estado
    // else {
    //     setExpandedNodes(new Set());
    // }
  }, [selectedNode, highlightedNodes, nodes]); // Depende de la selección y los nodos resaltados

  const handleToggleExpand = useCallback((nodeId: string) => {
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

  // Función para renderizar recursivamente
  const renderNodes = (nodeList: OrganizationalNode[], level: number) => {
    if (!nodeList || nodeList.length === 0) return null;

    return nodeList.map((node) => (
      <OrganizationalTreeItem
        key={node.id}
        node={node}
        level={level}
        isSelected={selectedNode?.id === node.id}
        isExpanded={expandedNodes.has(node.id)}
        isHighlighted={highlightedNodes.has(node.id)}
        onSelect={onSelectNode}
        onToggleExpand={handleToggleExpand}
        onAddChild={onAddChild}
        onEdit={onEditNode}
        onDelete={onDeleteNode}
      >
        {/* Renderizar hijos recursivamente si está expandido */}
        {node.children &&
          expandedNodes.has(node.id) &&
          renderNodes(node.children, level + 1)}
      </OrganizationalTreeItem>
    ));
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
        Cargando estructura...
      </div>
    );
  }

  if (!nodes || nodes.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No hay compañías para mostrar.
      </div>
    );
  }

  return <div className="space-y-1">{renderNodes(nodes, 0)}</div>;
};
