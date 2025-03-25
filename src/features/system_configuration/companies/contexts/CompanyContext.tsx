import React, { createContext, useContext, ReactNode } from 'react';
import { useCompanies } from '../hooks/useCompanies';
import { Company, CreateCompanyDto, UpdateCompanyDto } from '../types';

interface CompanyContextType {
  companies: Company[];
  selectedCompany: Company | null;
  loading: boolean;
  error: string | null;
  loadCompanies: () => Promise<void>;
  loadCompany: (id: string) => Promise<void>;
  createCompany: (companyData: CreateCompanyDto) => Promise<Company | null>;
  updateCompany: (id: string, companyData: UpdateCompanyDto) => Promise<Company | null>;
  deleteCompany: (id: string) => Promise<boolean>;
  setSelectedCompany: React.Dispatch<React.SetStateAction<Company | null>>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const companyHook = useCompanies();
  
  return (
    <CompanyContext.Provider value={companyHook}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompanyContext = (): CompanyContextType => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompanyContext must be used within a CompanyProvider');
  }
  return context;
};