export interface LicenseResponse {
  statusCode: number;
  data: ApiLicense | ApiLicense[];
  message: string;
  error: string;
}

export interface ModuleCompanyLicense {
  module_company_license_id: string;
  module: {
    name: string;
    module_id: string;
  };
}

export interface ApiLicense {
  license_id: string;
  company_name: string;
  rnc: string;
  expiration_date: string;
  allowed_companies: number;
  allowed_employees: number;
  contact_name: string;
  email: string;
  phone: string;
  status: boolean;
  used_companies?: number;
  active_employees?: number;
  modules?: string[];
  modules_licence?: ModuleCompanyLicense[];
  created_at?: string;
  creation_date?: string;
  updated_at?: string;
  last_update?: string;
  notes?: string;
}

export interface CreateLicenseDto {
  company_name: string;
  rnc: string;
  expiration_date: string;
  allowed_companies: number;
  allowed_employees: number;
  contact_name: string;
  email: string;
  phone: string;
  status: boolean;
  modules?: string[];
  notes?: string;
}

export interface UpdateLicenseDto {
  company_name?: string;
  rnc?: string;
  expiration_date?: string;
  allowed_companies?: number;
  allowed_employees?: number;
  contact_name?: string;
  email?: string;
  phone?: string;
  status?: boolean;
  modules?: string[];
  notes?: string;
}

export interface License {
  id: string;
  companyName: string;
  rnc: string;
  usedCompanies: number;
  allowedCompanies: number;
  activeEmployees: number;
  allowedEmployees: number;
  expirationDate: string;
  modules: string[];
  status: "active" | "inactive";
  creationDate?: string;
  lastUpdate?: string;
  notes?: string;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface Module {
  module_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ModuleGroup {
  id: string;
  label: string;
  modules: Module[];
}
