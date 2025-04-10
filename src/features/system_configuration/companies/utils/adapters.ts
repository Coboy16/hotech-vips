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
  UpdateBranchDto,
  UpdateDepartmentDto,
  UpdateSectionDto,
  UpdateUnitDto,
} from "../../../../model/organizationalStructure";
import { NodeFormData } from "../schemas/nodeSchema";

/**
 * Determina el tipo de nodo hijo permitido basado en el tipo del padre.
 */
export const getChildNodeType = (parentType: NodeType): NodeType | null => {
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
    if (company.branches?.length) {
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
      licenseId,
      parent.level ? parent.level + 1 : 2
    );
    childrenList.push(branchNode);
    if (branch.departments?.length) {
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
      licenseId,
      parent.level ? parent.level + 1 : 3
    );
    childrenList.push(deptNode);
    if (dept.sections?.length) {
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
      licenseId,
      parent.level ? parent.level + 1 : 4
    );
    childrenList.push(sectionNode);
    if (section.units?.length) {
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
      licenseId,
      parent.level ? parent.level + 1 : 5
    );
    childrenList.push(unitNode);
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
  _licenseId?: string | null,
  currentLevel: number = 1
): OrganizationalNode => {
  let commonData: Pick<OrganizationalNode, "id" | "name" | "status">;
  // **CORRECCIÓN AQUÍ: No omitir licenseId si es parte del tipo OrganizationalNode**
  const specificData: Partial<
    Omit<
      OrganizationalNode,
      | "id"
      | "name"
      | "status"
      | "type"
      | "level"
      | "parentId"
      | "children"
      | "metadata"
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
      metadataContact.managerFullName = (apiNode as any).contact_name;
      metadataContact.phone = (apiNode as any).phone;
      specificData.licenseId = company.license_id; // <-- Se asigna aquí
      break;
    }
    case "branch": {
      /* ... (código anterior sin cambios) ... */
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
      /* ... (código anterior sin cambios) ... */
      const department = apiNode as ApiDepartment;
      commonData = {
        id: department.department_id,
        name: department.department_name,
        status: department.department_status ? "active" : "inactive",
      };
      break;
    }
    case "section": {
      /* ... (código anterior sin cambios) ... */
      const section = apiNode as ApiSection;
      commonData = {
        id: section.section_id,
        name: section.section_name,
        status: section.section_status ? "active" : "inactive",
      };
      break;
    }
    case "unit": {
      /* ... (código anterior sin cambios) ... */
      const unit = apiNode as ApiUnit;
      commonData = {
        id: unit.unit_id,
        name: unit.unit_name,
        status: unit.unit_status ? "active" : "inactive",
      };
      break;
    }
    default: {
      /* ... (código anterior sin cambios) ... */
      console.error(
        `Tipo de nodo desconocido recibido de API: ${type}`,
        apiNode
      );
      commonData = {
        id: (apiNode as any).id || "unknown",
        name: "Nodo Desconocido",
        status: "inactive",
      };
      break; // Añadir break
    }
  }

  const uiNode: OrganizationalNode = {
    ...commonData,
    type,
    parentId,
    level: currentLevel,
    children: [],
    metadata: {
      ...metadataOther,
      contact:
        Object.values(metadataContact).some((val) => val) ||
        Object.values(metadataLocation).some((val) => val)
          ? {
              ...metadataContact,
              physicalLocation: Object.values(metadataLocation).some(
                (val) => val
              )
                ? metadataLocation
                : undefined,
            }
          : undefined,
    },
    ...specificData,
  };

  return uiNode;
};

/**
 * Transforma los datos del formulario (NodeFormData) a un DTO para **crear** un nodo específico.
 */
export const transformNodeToCreateDto = (
  parentId: string | null,
  formData: NodeFormData,
  targetType: NodeType
): { type: NodeType; dto: CreateNodeDtoUnion | null } => {
  const commonData = { status: formData.status === "active" };
  let dto: CreateNodeDtoUnion | null = null;

  switch (targetType) {
    case "branch":
      if (!parentId) return { type: targetType, dto: null };
      dto = {
        company_id: parentId,
        branch_name: formData.name,
        branch_address: formData.metadata?.address,
        branch_phone: formData.metadata?.contact?.phone,
        branch_status: commonData.status,
      };
      break;
    case "department":
      if (!parentId) return { type: targetType, dto: null };
      dto = {
        branch_id: parentId,
        department_name: formData.name,
        department_status: commonData.status,
      };
      break;
    case "section":
      if (!parentId) return { type: targetType, dto: null };
      dto = {
        department_id: parentId,
        section_name: formData.name,
        section_status: commonData.status,
      };
      break;
    case "unit":
      if (!parentId) return { type: targetType, dto: null };
      dto = {
        section_id: parentId,
        unit_name: formData.name,
        unit_status: commonData.status,
      };
      break;
    case "company":
      console.warn("Creación de compañías no soportada.");
      return { type: targetType, dto: null };
    default:
      console.error(`Tipo no válido para creación: ${targetType}`);
      return { type: targetType, dto: null };
  }
  return { type: targetType, dto };
};

/**
 * Transforma los datos del formulario (NodeFormData) a un DTO para **actualizar** un nodo.
 */
export const transformNodeToUpdateDto = (
  formData: NodeFormData
): UpdateNodeDtoUnion | null => {
  const commonData = { status: formData.status === "active" };
  let dto: UpdateNodeDtoUnion | null = null;

  switch (formData.type) {
    case "branch":
      dto = {
        branch_name: formData.name,
        branch_address: formData.metadata?.address,
        branch_phone: formData.metadata?.contact?.phone,
        branch_status: commonData.status,
      } satisfies UpdateBranchDto; // Satisfies asegura que cumple el tipo
      break;
    case "department":
      dto = {
        department_name: formData.name,
        department_status: commonData.status,
      } satisfies UpdateDepartmentDto;
      break;
    case "section":
      dto = {
        section_name: formData.name,
        section_status: commonData.status,
      } satisfies UpdateSectionDto;
      break;
    case "unit":
      dto = {
        unit_name: formData.name,
        unit_status: commonData.status,
      } satisfies UpdateUnitDto;
      break;
    case "company":
      console.warn("Actualización de compañías no soportada.");
      return null;
    default:
      console.error(
        `Tipo no válido para actualización: ${(formData as NodeFormData).type}`
      );
      return null;
  }
  return dto;
};

// --- Funciones de Utilidad para Manipular el Árbol en el Frontend ---
export const findNodeById = (
  nodes: OrganizationalNode[],
  id: string
): OrganizationalNode | null => {
  /* ... (sin cambios) ... */
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};
export const addNodeToTree = (
  tree: OrganizationalNode[],
  parentId: string | null,
  newNode: OrganizationalNode
): OrganizationalNode[] => {
  /* ... (sin cambios) ... */
  if (parentId === null) {
    if (newNode.type === "company") return [...tree, newNode];
    else {
      console.warn("Intento de añadir nodo no-compañía como raíz.");
      return tree;
    }
  }
  const addRecursively = (nodes: OrganizationalNode[]): OrganizationalNode[] =>
    nodes.map((node) => {
      if (node.id === parentId)
        return {
          ...node,
          children: [...(node.children || []), newNode].sort((a, b) =>
            a.name.localeCompare(b.name)
          ),
        }; // Opcional: ordenar hijos
      if (node.children)
        return { ...node, children: addRecursively(node.children) };
      return node;
    });
  return addRecursively(tree);
};
export const updateNodeInTree = (
  tree: OrganizationalNode[],
  nodeId: string,
  updatedNodeData: Partial<OrganizationalNode>
): OrganizationalNode[] => {
  /* ... (sin cambios) ... */
  const updateRecursively = (
    nodes: OrganizationalNode[]
  ): OrganizationalNode[] =>
    nodes.map((node) => {
      if (node.id === nodeId) {
        const { children, ...restOfUpdatedData } = updatedNodeData;
        return {
          ...node,
          ...restOfUpdatedData,
          children: children !== undefined ? children : node.children,
        };
      }
      if (node.children)
        return { ...node, children: updateRecursively(node.children) };
      return node;
    });
  return updateRecursively(tree);
};
export const removeNodeFromTree = (
  tree: OrganizationalNode[],
  nodeId: string
): OrganizationalNode[] => {
  /* ... (sin cambios) ... */
  const removeRecursively = (
    nodes: OrganizationalNode[]
  ): OrganizationalNode[] => {
    const filteredNodes = nodes.filter((node) => node.id !== nodeId);
    return filteredNodes.map((node) =>
      node.children
        ? { ...node, children: removeRecursively(node.children) }
        : node
    );
  };
  return removeRecursively(tree);
};
export const getNodePath = (
  tree: OrganizationalNode[],
  nodeId: string
): string[] => {
  /* ... (sin cambios) ... */
  const findPath = (
    nodes: OrganizationalNode[],
    targetId: string,
    currentPath: string[]
  ): string[] | null => {
    for (const node of nodes) {
      const newPath = [...currentPath, node.id];
      if (node.id === targetId) return newPath;
      if (node.children) {
        const result = findPath(node.children, targetId, newPath);
        if (result) return result;
      }
    }
    return null;
  };
  return findPath(tree, nodeId, []) || [];
};
