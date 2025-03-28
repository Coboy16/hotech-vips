export interface Company {
  comp_iden: string;
  comp_raso: string;
  comp_noco: string;
  comp_rnc1: string;
  comp_emai: string;
  comp_stat: boolean;
  pais_iden: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCompanyDto {
  comp_raso: string;
  comp_noco: string;
  comp_rnc1: string;
  comp_emai: string;
  comp_stat: boolean;
  pais_iden: string;
}

export type UpdateCompanyDto = Partial<CreateCompanyDto>;

export interface CompanyResponse {
  statusCode: number;
  message: string;
  data: Company | Company[];
  error?: string;
}

export interface OrganizationalNode {
  id: string;
  name: string;
  type: 'company' | 'branch' | 'department' | 'section' | 'unit';
  description?: string;
  code?: string;
  manager?: string;
  status: 'active' | 'inactive';
  children?: OrganizationalNode[];
  parent?: string;
  level: number;
  metadata?: {
    employeeCount?: number;
    location?: string;
    contact?: {
      managerFullName: string;
      position: string;
      email: string;
      phone: string;
      extension?: string;
      physicalLocation: {
        building: string;
        floor: string;
        office: string;
      };
    };
  };
}