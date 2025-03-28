/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  OrganizationalNode,
  NodeType,
  ApiCompany,
  ApiBranch,
  ApiDepartment,
  ApiSection,
  ApiUnit,
  ApiNode,
  CreateNodeDtoUnion,
  UpdateNodeDtoUnion,
} from "../../../../model/organizationalStructure";
import { NodeFormData } from "../schemas/nodeSchema";

/**
 * Transforma la estructura anidada de la API (ApiCompany[]) a un árbol plano de UI (OrganizationalNode[]).
 */
export const transformApiCompaniesToTree = (
  apiCompanies: ApiCompany[],
  licenseId?: string
): OrganizationalNode[] => {
  const tree: OrganizationalNode[] = [];

  function processCompany(company: ApiCompany) {
    const companyNode: OrganizationalNode = transformApiNodeToUiNode(
      company,
      "company",
      null,
      licenseId
    );
    tree.push(companyNode);
    if (company.branches && company.branches.length > 0) {
      companyNode.children = [];
      company.branches.forEach((branch) =>
        processBranch(branch, companyNode, companyNode.children!)
      );
    }
  }

  function processBranch(
    branch: ApiBranch,
    parent: OrganizationalNode,
    childrenList: OrganizationalNode[]
  ) {
    const branchNode: OrganizationalNode = transformApiNodeToUiNode(
      branch,
      "branch",
      parent.id,
      licenseId
    );
    childrenList.push(branchNode);
    if (branch.departments && branch.departments.length > 0) {
      branchNode.children = [];
      branch.departments.forEach((dept) =>
        processDepartment(dept, branchNode, branchNode.children!)
      );
    }
  }

  function processDepartment(
    dept: ApiDepartment,
    parent: OrganizationalNode,
    childrenList: OrganizationalNode[]
  ) {
    const deptNode: OrganizationalNode = transformApiNodeToUiNode(
      dept,
      "department",
      parent.id,
      licenseId
    );
    childrenList.push(deptNode);
    if (dept.sections && dept.sections.length > 0) {
      deptNode.children = [];
      dept.sections.forEach((section) =>
        processSection(section, deptNode, deptNode.children!)
      );
    }
  }

  function processSection(
    section: ApiSection,
    parent: OrganizationalNode,
    childrenList: OrganizationalNode[]
  ) {
    const sectionNode: OrganizationalNode = transformApiNodeToUiNode(
      section,
      "section",
      parent.id,
      licenseId
    );
    childrenList.push(sectionNode);
    if (section.units && section.units.length > 0) {
      sectionNode.children = [];
      section.units.forEach((unit) =>
        processUnit(unit, sectionNode, sectionNode.children!)
      );
    }
  }

  function processUnit(
    unit: ApiUnit,
    parent: OrganizationalNode,
    childrenList: OrganizationalNode[]
  ) {
    const unitNode: OrganizationalNode = transformApiNodeToUiNode(
      unit,
      "unit",
      parent.id,
      licenseId
    );
    childrenList.push(unitNode);
    // Las unidades no tienen hijos en este modelo
  }

  apiCompanies.forEach(processCompany);
  return tree;
};

/**
 * Transforma un nodo individual de la API a un nodo de la UI.
 */
export const transformApiNodeToUiNode = (
  apiNode: ApiNode,
  type: NodeType,
  parentId: string | null = null,
  licenseId?: string | null,
  currentLevel: number = 1 // Nivel base
): OrganizationalNode => {
  let commonData: Pick<OrganizationalNode, "id" | "name" | "status">;
  const specificData: Partial<
    Omit<
      OrganizationalNode,
      "id" | "name" | "status" | "type" | "level" | "parentId" | "licenseId"
    >
  > = {};
  const metadataContact: any = {};
  const metadataLocation: any = {};
  const metadataOther: any = {};

  switch (type) {
    case "company": {
      const company = apiNode as ApiCompany;
      commonData = {
        id: company.comp_iden,
        name: company.comp_raso,
        status: company.comp_stat ? "active" : "inactive",
      };
      specificData.code = company.comp_rnc1;
      metadataContact.email = company.comp_emai;
      metadataOther.countryId = company.pais_iden;
      // Si la API de compañía también trae contacto directamente
      metadataContact.managerFullName = company.contact_name;
      metadataContact.phone = company.phone;
      specificData.licenseId = company.license_id;
      break;
    }
    case "branch": {
      const branch = apiNode as ApiBranch;
      commonData = {
        id: branch.branch_id,
        name: branch.branch_name,
        status: branch.branch_status ? "active" : "inactive",
      };
      metadataOther.address = branch.branch_address;
      metadataContact.phone = branch.branch_phone;
      break;
    }
    case "department": {
      const department = apiNode as ApiDepartment;
      commonData = {
        id: department.department_id,
        name: department.department_name,
        status: department.department_status ? "active" : "inactive",
      };
      break;
    }
    case "section": {
      const section = apiNode as ApiSection;
      commonData = {
        id: section.section_id,
        name: section.section_name,
        status: section.section_status ? "active" : "inactive",
      };
      break;
    }
    case "unit": {
      const unit = apiNode as ApiUnit;
      commonData = {
        id: unit.unit_id,
        name: unit.unit_name,
        status: unit.unit_status ? "active" : "inactive",
      };
      break;
    }
    default:
      throw new Error(`Tipo de nodo desconocido: ${type}`);
  }

  // Construir nodo UI
  const uiNode: OrganizationalNode = {
    ...commonData,
    type,
    parentId,
    level: currentLevel,
    children: [], // Inicialmente vacío, se poblará recursivamente si es necesario
    metadata: {
      ...metadataOther,
      contact:
        Object.keys(metadataContact).length > 0
          ? {
              ...metadataContact,
              physicalLocation:
                Object.keys(metadataLocation).length > 0
                  ? metadataLocation
                  : undefined,
            }
          : undefined,
    },
    // Añadir otros campos si vienen de la API y no encajan directamente
    // description: (apiNode as any).description || undefined,
  };

  // Procesar hijos recursivamente (si el endpoint individual los devolviera)
  // Esta lógica es más para construir el árbol desde GET /companies-with-relations
  const apiChildren: any[] | undefined =
    (apiNode as any).branches ||
    (apiNode as any).departments ||
    (apiNode as any).sections ||
    (apiNode as any).units;
  if (apiChildren && Array.isArray(apiChildren)) {
    const childType = getChildNodeType(type);
    if (childType) {
      uiNode.children = apiChildren.map((child) =>
        transformApiNodeToUiNode(
          child,
          childType,
          uiNode.id,
          licenseId,
          currentLevel + 1
        )
      );
    }
  }

  return uiNode;
};

/**
 * Determina el tipo de nodo hijo basado en el tipo del padre.
 */
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
    case "unit":
      return null; // Units don't have children
    default:
      return null;
  }
};

/**
 * Transforma los datos del formulario (NodeFormData) a un DTO para **crear** un nodo específico.
 * Requiere saber el ID del padre y el tipo de nodo a crear.
 */
export const transformNodeToCreateDto = (
  parentId: string | null, // null si se crea una compañía raíz (no soportado por API actual)
  formData: NodeFormData,
  targetType: NodeType // El tipo de nodo que se está creando
): { type: NodeType; dto: CreateNodeDtoUnion | null } => {
  const commonData = {
    // Datos comunes a muchos DTOs
    status: formData.status === "active",
    // name: formData.name, // El nombre está en el campo específico del DTO
  };

  let dto: CreateNodeDtoUnion | null = null;

  switch (targetType) {
    // case 'company': // No hay endpoint documentado para crear company directamente
    //     if (!licenseId) return { type: targetType, dto: null }; // Necesita licenseId
    //     dto = {
    //         license_id: licenseId,
    //         comp_raso: formData.name,
    //         comp_rnc1: formData.code,
    //         pais_iden: formData.metadata?.countryId,
    //         comp_emai: formData.metadata?.contact?.email,
    //         comp_stat: commonData.status,
    //         // ... otros campos de compañía
    //     };
    //     break;
    case "branch":
      if (!parentId) return { type: targetType, dto: null }; // Necesita company_id (parentId)
      dto = {
        company_id: parentId,
        branch_name: formData.name,
        branch_address: formData.metadata?.address,
        branch_phone: formData.metadata?.contact?.phone,
        branch_status: commonData.status,
      };
      break;
    case "department":
      if (!parentId) return { type: targetType, dto: null }; // Necesita branch_id
      dto = {
        branch_id: parentId,
        department_name: formData.name,
        department_status: commonData.status,
      };
      break;
    case "section":
      if (!parentId) return { type: targetType, dto: null }; // Necesita department_id
      dto = {
        department_id: parentId,
        section_name: formData.name,
        section_status: commonData.status,
      };
      break;
    case "unit":
      if (!parentId) return { type: targetType, dto: null }; // Necesita section_id
      dto = {
        section_id: parentId,
        unit_name: formData.name,
        unit_status: commonData.status,
      };
      break;
    default:
      return { type: targetType, dto: null }; // Tipo no soportado
  }

  return { type: targetType, dto };
};

/**
 * Transforma los datos del formulario (NodeFormData) a un DTO para **actualizar** un nodo.
 * El tipo de nodo se infiere del formulario o del nodo existente.
 */
export const transformNodeToUpdateDto = (
  formData: NodeFormData
): UpdateNodeDtoUnion | null => {
  const commonData = {
    status: formData.status === "active",
  };

  let dto: UpdateNodeDtoUnion | null = null;

  switch (formData.type) {
    // case 'company': // No hay endpoint documentado para actualizar company directamente
    //     dto = {
    //         comp_raso: formData.name,
    //         comp_rnc1: formData.code,
    //         pais_iden: formData.metadata?.countryId,
    //         comp_emai: formData.metadata?.contact?.email,
    //         comp_stat: commonData.status,
    //         // ... otros campos opcionales de compañía
    //     };
    //     break;
    case "branch":
      dto = {
        // company_id no se actualiza
        branch_name: formData.name,
        branch_address: formData.metadata?.address,
        branch_phone: formData.metadata?.contact?.phone,
        branch_status: commonData.status,
      };
      break;
    case "department":
      dto = {
        // branch_id no se actualiza
        department_name: formData.name,
        department_status: commonData.status,
      };
      break;
    case "section":
      dto = {
        // department_id no se actualiza
        section_name: formData.name,
        section_status: commonData.status,
      };
      break;
    case "unit":
      dto = {
        // section_id no se actualiza
        unit_name: formData.name,
        unit_status: commonData.status,
      };
      break;
    default:
      return null; // Tipo no soportado
  }
  return dto;
};

// --- Funciones de Utilidad para Manipular el Árbol en el Frontend ---

/**
 * Busca un nodo por su ID en una estructura de árbol.
 */
export const findNodeById = (
  nodes: OrganizationalNode[],
  id: string
): OrganizationalNode | null => {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

/**
 * Añade un nuevo nodo al árbol bajo el padre especificado (o como raíz si parentId es null).
 * Devuelve una nueva instancia del árbol con el nodo añadido.
 */
export const addNodeToTree = (
  tree: OrganizationalNode[],
  parentId: string | null,
  newNode: OrganizationalNode
): OrganizationalNode[] => {
  if (parentId === null) {
    // Añadir como raíz (asumiendo que solo compañías son raíz)
    if (newNode.type === "company") {
      return [...tree, newNode];
    } else {
      console.warn("Intentando añadir nodo no-compañía como raíz.");
      return tree; // No modificar si no es compañía
    }
  }

  // Función recursiva para añadir al hijo correcto
  const addRecursively = (
    nodes: OrganizationalNode[]
  ): OrganizationalNode[] => {
    return nodes.map((node) => {
      if (node.id === parentId) {
        // Encontrado el padre, añadir el nuevo nodo a sus hijos
        const updatedChildren = [...(node.children || []), newNode];
        return { ...node, children: updatedChildren };
      } else if (node.children) {
        // Buscar en los hijos
        return { ...node, children: addRecursively(node.children) };
      }
      // Nodo no es el padre y no tiene hijos, devolver sin cambios
      return node;
    });
  };

  return addRecursively(tree);
};

/**
 * Actualiza un nodo existente en el árbol con nuevos datos.
 * Devuelve una nueva instancia del árbol con el nodo actualizado.
 */
export const updateNodeInTree = (
  tree: OrganizationalNode[],
  nodeId: string,
  updatedNodeData: Partial<OrganizationalNode> // Datos a actualizar
): OrganizationalNode[] => {
  const updateRecursively = (
    nodes: OrganizationalNode[]
  ): OrganizationalNode[] => {
    return nodes.map((node) => {
      if (node.id === nodeId) {
        // Encontrado el nodo, fusionar con nuevos datos
        // Asegurarse de no sobreescribir 'children' si no está en updatedNodeData
        const { children, ...restOfUpdatedData } = updatedNodeData;
        return {
          ...node, // Mantener datos existentes
          ...restOfUpdatedData, // Aplicar cambios
          children: children !== undefined ? children : node.children, // Mantener hijos si no se actualizan
        };
      } else if (node.children) {
        // Buscar en los hijos
        return { ...node, children: updateRecursively(node.children) };
      }
      // No es el nodo y no tiene hijos, devolver sin cambios
      return node;
    });
  };
  return updateRecursively(tree);
};

/**
 * Elimina un nodo del árbol por su ID.
 * Devuelve una nueva instancia del árbol sin el nodo eliminado (y sus descendientes).
 */
export const removeNodeFromTree = (
  tree: OrganizationalNode[],
  nodeId: string
): OrganizationalNode[] => {
  const removeRecursively = (
    nodes: OrganizationalNode[]
  ): OrganizationalNode[] => {
    // Filtrar el nodo a eliminar en este nivel
    const filteredNodes = nodes.filter((node) => node.id !== nodeId);

    // Mapear los nodos restantes y buscar en sus hijos
    return filteredNodes.map((node) => {
      if (node.children) {
        // Si tiene hijos, aplicar recursivamente
        return { ...node, children: removeRecursively(node.children) };
      }
      // Si no tiene hijos, devolver tal cual
      return node;
    });
  };

  return removeRecursively(tree);
};

/**
 * Encuentra la ruta (array de IDs) desde la raíz hasta un nodo específico.
 * Útil para saber qué nodos expandir al seleccionar un resultado de búsqueda.
 */
export const getNodePath = (
  tree: OrganizationalNode[],
  nodeId: string
): string[] => {
  const findPath = (
    nodes: OrganizationalNode[],
    targetId: string,
    currentPath: string[]
  ): string[] | null => {
    for (const node of nodes) {
      const newPath = [...currentPath, node.id];
      if (node.id === targetId) {
        return newPath; // Ruta encontrada
      }
      if (node.children) {
        const result = findPath(node.children, targetId, newPath);
        if (result) {
          return result; // Propagar la ruta encontrada hacia arriba
        }
      }
    }
    return null; // No encontrado en esta rama
  };

  return findPath(tree, nodeId, []) || []; // Devuelve la ruta o un array vacío si no se encuentra
};
