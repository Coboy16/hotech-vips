export interface LicenseResponse {
  statusCode: number;
  data: ApiLicense | ApiLicense[];
  message: string;
  error: string;
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
  creation_date?: string;
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
