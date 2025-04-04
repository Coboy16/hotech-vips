export interface ApiUnit {
  unit_id: string;
  section_id: string;
  unit_name: string;
  unit_status: boolean;
  container_positio: string | null; // Cuidado con el typo en la API: 'container_positio'
  created_at: string;
  updated_at: string;
}

export interface ApiSection {
  section_id: string;
  department_id: string;
  section_name: string;
  section_status: boolean;
  container_position_id: string | null;
  created_at: string;
  updated_at: string;
  units: ApiUnit[];
}

export interface ApiDepartment {
  department_id: string;
  branch_id: string;
  department_name: string;
  department_status: boolean;
  container_position_id: string | null;
  created_at: string;
  updated_at: string;
  sections: ApiSection[];
}

export interface ApiBranch {
  branch_id: string;
  company_id: string;
  branch_name: string;
  branch_address: string;
  branch_phone: string;
  branch_status: boolean;
  container_position_id: string | null;
  created_at: string;
  updated_at: string;
  departments: ApiDepartment[];
}

export interface ApiCompanyWithStructure {
  comp_iden: string;
  comp_raso: string;
  comp_noco: string;
  comp_rnc1: string;
  comp_emai: string;
  comp_stat: boolean;
  pais_iden: string;
  license_id: string;
  container_position_id: string | null;
  created_at: string;
  updated_at: string;
  branches: ApiBranch[];
}

// Tipo para la respuesta completa de la API de estructura
export interface ApiStructureTreeResponse {
  license_id: string;
  company_name: string;
  rnc: string;
  // ...otros campos de la licencia...
  companies: ApiCompanyWithStructure[];
}

// Tipo simplificado para usar en el selector de estructuras
export interface StructureSelectItem {
  id: string;
  name: string;
  type: "company" | "sede" | "department" | "section" | "unit"; // 'sede' es 'branch' en la API
}
