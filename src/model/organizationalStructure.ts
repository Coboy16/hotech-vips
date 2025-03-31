/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiLicense } from "./license"; // Importa interfaz de licencia si es necesaria aquí

// Tipos de nodos permitidos
export type NodeType = "company" | "branch" | "department" | "section" | "unit";

// --- Interfaces para datos recibidos de la API ---
// Estas interfaces reflejan la estructura anidada del endpoint GET /companies-with-relations/{licenseId}

export interface ApiUnit {
  unit_id: string;
  section_id: string;
  unit_name: string;
  unit_status: boolean;
  created_at?: string;
  updated_at?: string;
  // Otros campos que pueda devolver la API
}

export interface ApiSection {
  section_id: string;
  department_id: string;
  section_name: string;
  section_status: boolean;
  created_at?: string;
  updated_at?: string;
  units?: ApiUnit[]; // Anidación
  // Otros campos
}

export interface ApiDepartment {
  department_id: string;
  branch_id: string;
  department_name: string;
  department_status: boolean;
  created_at?: string;
  updated_at?: string;
  sections?: ApiSection[]; // Anidación
  // Otros campos
}

export interface ApiBranch {
  branch_id: string;
  company_id: string;
  branch_name: string;
  branch_address?: string; // Campo opcional según tu API
  branch_phone?: string; // Campo opcional
  branch_status: boolean;
  created_at?: string;
  updated_at?: string;
  departments?: ApiDepartment[]; // Anidación
  // Otros campos
}

export interface ApiCompany {
  comp_iden: string; // ID de la compañía
  license_id: string; // ID de la licencia a la que pertenece
  comp_raso: string; // Razón Social (Nombre principal)
  comp_noco?: string; // Nombre Comercial (Opcional)
  comp_rnc1?: string; // RNC (Opcional)
  comp_emai?: string; // Email (Opcional)
  comp_stat: boolean; // Estado
  pais_iden?: string; // ID del país (Opcional)
  created_at?: string;
  updated_at?: string;
  branches?: ApiBranch[]; // Anidación
  // Otros campos (Ej: Información de contacto si viene aquí)
  contact_name?: string;
  phone?: string;
}

// Interfaz para la respuesta completa del endpoint que trae la licencia con sus compañías
export interface ApiLicenseWithCompanies extends ApiLicense {
  // Extiende la interfaz de licencia base
  companies?: ApiCompany[];
}

// Interfaz genérica para cualquier nodo devuelto por endpoints individuales (GET /branches/{id}, etc.)
export type ApiNode =
  | ApiCompany
  | ApiBranch
  | ApiDepartment
  | ApiSection
  | ApiUnit;

// --- Interfaz para la UI (Árbol y Detalles) ---
// Esta interfaz unifica los diferentes tipos de nodos para facilitar su manejo en el frontend.
export interface OrganizationalNode {
  id: string; // ID único del nodo (comp_iden, branch_id, department_id, etc.)
  parentId?: string | null; // ID del nodo padre (null para compañías raíz)
  licenseId?: string; // ID de la licencia (relevante para compañías)
  name: string; // Nombre del nodo (comp_raso, branch_name, etc.)
  type: NodeType; // Tipo de nodo ('company', 'branch', etc.)
  status: "active" | "inactive"; // Estado unificado
  code?: string; // Código (RNC para compañía, u otro código)
  description?: string; // Descripción (puede venir de metadatos o un campo específico)
  level?: number; // Nivel en la jerarquía (calculado en el frontend)
  children?: OrganizationalNode[]; // Nodos hijos (para el árbol)
  // Metadatos específicos del nodo (información adicional)
  metadata?: {
    // Campos comunes o específicos por tipo
    employeeCount?: number; // Puede venir de la API o calcularse
    countryId?: string; // Para compañía
    address?: string; // Para sucursal
    // Información de contacto (puede estar en compañía o en otros niveles)
    contact?: {
      managerFullName?: string; // Nombre del responsable
      position?: string; // Cargo
      email?: string; // Email
      phone?: string; // Teléfono (puede ser branch_phone o contact_phone)
      extension?: string; // Extensión telefónica
      // Ubicación física (puede estar en sucursal o departamento)
      physicalLocation?: {
        building?: string;
        floor?: string;
        office?: string;
      };
    };
    // Permite añadir otras propiedades específicas si es necesario
    [key: string]: any;
  };
}

// --- DTOs (Data Transfer Objects) para Crear/Actualizar ---
// Estos reflejan lo que se envía a la API

// DTO Base (si hay campos comunes)
export interface BaseNodeDto {
  name: string; // Nombre del nodo (ej: branch_name, department_name)
  status: boolean; // Estado (ej: branch_status)
  // Otros campos comunes si existen
}

// DTOs específicos por tipo de nodo (ajusta según los campos requeridos por cada endpoint POST/PUT)

// export interface CreateCompanyDto { // Endpoint POST /companies no documentado
//     license_id: string;
//     comp_raso: string;
//     comp_noco?: string;
//     comp_rnc1?: string;
//     comp_emai?: string;
//     pais_iden?: string;
//     comp_stat: boolean;
//     // contacto?
// }
// export type UpdateCompanyDto = Partial<CreateCompanyDto>;

export interface CreateBranchDto {
  company_id: string; // ID de la compañía padre
  branch_name: string;
  branch_address?: string;
  branch_phone?: string;
  branch_status: boolean;
}
export type UpdateBranchDto = Partial<Omit<CreateBranchDto, "company_id">>; // No se suele cambiar el padre

export interface CreateDepartmentDto {
  branch_id: string; // ID de la sucursal padre
  department_name: string;
  department_status: boolean;
}
export type UpdateDepartmentDto = Partial<
  Omit<CreateDepartmentDto, "branch_id">
>;

export interface CreateSectionDto {
  department_id: string; // ID del departamento padre
  section_name: string;
  section_status: boolean;
}
export type UpdateSectionDto = Partial<Omit<CreateSectionDto, "department_id">>;

export interface CreateUnitDto {
  section_id: string; // ID de la sección padre
  unit_name: string;
  unit_status: boolean;
}
export type UpdateUnitDto = Partial<Omit<CreateUnitDto, "section_id">>;

// Tipo unión para los DTOs de creación
export type CreateNodeDtoUnion =
  | CreateBranchDto
  | CreateDepartmentDto
  | CreateSectionDto
  | CreateUnitDto; // | CreateCompanyDto;
// Tipo unión para los DTOs de actualización
export type UpdateNodeDtoUnion =
  | UpdateBranchDto
  | UpdateDepartmentDto
  | UpdateSectionDto
  | UpdateUnitDto; // | UpdateCompanyDto;

// DTO para el endpoint PATCH /status (siempre es el mismo)
export interface UpdateNodeStatusDto {
  // Usualmente PATCH a /status no requiere body,
  // pero si lo necesitara, se definiría aquí.
  // status?: boolean; // Podría ser así
}
