// import { useState, useEffect, useCallback } from 'react';
// import { toast } from 'react-hot-toast';
// import { Company, CreateCompanyDto, UpdateCompanyDto } from '../types';
// import { companyService } from '../services/companyService';

// export const useCompanies = () => {
//   const [companies, setCompanies] = useState<Company[]>([]);
//   const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   // Cargar todas las compañías
//   const loadCompanies = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await companyService.getAllCompanies();
//       setCompanies(data);
//     } catch (err) {
//       console.error('Error al cargar todas las compañías :', err);
//       setError('Error al cargar las compañías');
//       toast.error('No se pudieron cargar las compañías');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Cargar una compañía por ID
//   const loadCompany = useCallback(async (id: string) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await companyService.getById(id);
//       setSelectedCompany(data);
//     } catch (err) {
//       console.error('Error al cargar la compañía:', err);
//       setError('Error al cargar la compañía');
//       toast.error('No se pudo cargar la compañía seleccionada');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Crear una nueva compañía
//   const createCompany = useCallback(async (companyData: CreateCompanyDto) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const newCompany = await companyService.create(companyData);
//       if (newCompany) {
//         setCompanies(prev => [...prev, newCompany]);
//         toast.success('Compañía creada exitosamente');
//         return newCompany;
//       }
//       throw new Error('No se pudo crear la compañía');
//     } catch (err) {
//       console.error('Error al crear una compañía:', err);
//       setError('Error al crear la compañía');
//       toast.error('No se pudo crear la compañía');
//       return null;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Actualizar una compañía existente
//   const updateCompany = useCallback(async (id: string, companyData: UpdateCompanyDto) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const updatedCompany = await companyService.update(id, companyData);
//       if (updatedCompany) {
//         setCompanies(prev =>
//           prev.map(company => company.comp_iden === id ? updatedCompany : company)
//         );

//         if (selectedCompany?.comp_iden === id) {
//           setSelectedCompany(updatedCompany);
//         }

//         toast.success('Compañía actualizada exitosamente');
//         return updatedCompany;
//       }
//       throw new Error('No se pudo actualizar la compañía');
//     } catch (err) {
//       console.error('Error al actualizar compañía:', err);
//       setError('Error al actualizar la compañía');
//       toast.error('No se pudo actualizar la compañía');
//       return null;
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedCompany]);

//   // Eliminar una compañía
//   const deleteCompany = useCallback(async (id: string) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const success = await companyService.delete(id);
//       if (success) {
//         setCompanies(prev => prev.filter(company => company.comp_iden !== id));

//         if (selectedCompany?.comp_iden === id) {
//           setSelectedCompany(null);
//         }

//         toast.success('Compañía eliminada exitosamente');
//         return true;
//       }
//       throw new Error('No se pudo eliminar la compañía');
//     } catch (err) {
//       console.error('Error al elimanar compañía:', err);
//       setError('Error al eliminar la compañía');
//       toast.error('No se pudo eliminar la compañía');
//       return false;
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedCompany]);

//   // Cargar compañías al montar el componente
//   useEffect(() => {
//     loadCompanies();
//   }, [loadCompanies]);

//   return {
//     companies,
//     selectedCompany,
//     loading,
//     error,
//     loadCompanies,
//     loadCompany,
//     createCompany,
//     updateCompany,
//     deleteCompany,
//     setSelectedCompany
//   };
// };
