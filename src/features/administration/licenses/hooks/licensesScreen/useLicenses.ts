/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";

import { licenseService } from "../../services/licenseService";
import { moduleService } from "../../services/moduleService";
import { apiToUiLicense } from "../../utils/adapters";
import { ApiLicense, License, ModuleFromApi } from "../../../../../model";

export function useLicenses() {
  // --- Estados principales ---
  const [licenses, setLicenses] = useState<License[]>([]);
  const [apiLicensesData, setApiLicensesData] = useState<ApiLicense[]>([]);
  const [allModules, setAllModules] = useState<ModuleFromApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Estados para filtros ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterExpiration, setFilterExpiration] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // --- Estados para ordenamiento ---
  const [sortKey, setSortKey] = useState<string>("companyName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // --- Estados para paginación ---
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // --- Carga de Datos ---
  const loadLicensesAndModules = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Cargar módulos globales primero (usa caché interna)
      const modulesData = await moduleService.getAllModules();
      setAllModules(modulesData);

      // Cargar licencias (datos crudos de API)
      const apiLicenses = await licenseService.getAll();
      setApiLicensesData(apiLicenses);

      // Transformar a formato UI para mostrar
      const uiLicenses = apiLicenses.map((apiLic) => apiToUiLicense(apiLic));
      setLicenses(uiLicenses);
    } catch (err) {
      console.error("Error al cargar datos iniciales:", err);
      setError("Error al cargar datos. Intente recargar la página.");
      toast.error("Error al cargar datos.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLicensesAndModules();
  }, [loadLicensesAndModules]);

  // Función para filtrar las licencias
  const getFilteredLicenses = useCallback(() => {
    return licenses.filter((license) => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const matchesSearch =
        license.companyName.toLowerCase().includes(lowerSearchTerm) ||
        license.id.toLowerCase().includes(lowerSearchTerm) ||
        license.rnc.includes(searchTerm);

      const matchesStatus =
        filterStatus === "all" || license.status === filterStatus;

      const matchesExpiration =
        filterExpiration === "all" ||
        (() => {
          if (!license.expirationDate) return false;
          try {
            const expirationDate = new Date(license.expirationDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            expirationDate.setHours(0, 0, 0, 0); // Comparar solo fechas
            const diffTime = expirationDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            switch (filterExpiration) {
              case "danger":
                return diffDays <= 30;
              case "warning":
                return diffDays > 30 && diffDays <= 90;
              case "safe":
                return diffDays > 90;
              default:
                return true;
            }
          } catch {
            return false;
          }
        })();

      return matchesSearch && matchesStatus && matchesExpiration;
    });
  }, [licenses, searchTerm, filterStatus, filterExpiration]);

  // --- Handlers de Filtrado ---
  const handleFilterChange = (filterName: string, value: string) => {
    // Mapea el nombre del filtro al estado correspondiente
    const setters: Record<
      string,
      React.Dispatch<React.SetStateAction<string>>
    > = {
      status: setFilterStatus,
      expiration: setFilterExpiration,
    };
    if (setters[filterName]) {
      setters[filterName](value);
      setCurrentPage(1); // Resetear paginación al cambiar filtros
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterExpiration("all");
    setCurrentPage(1);
    setSortKey("companyName"); // Resetear ordenamiento
    setSortDirection("asc");
  };

  // --- Manipulación de Licencias ---
  const addOrUpdateLicense = useCallback((updatedLicense: License) => {
    setLicenses((prevLicenses) => {
      const index = prevLicenses.findIndex((l) => l.id === updatedLicense.id);
      if (index > -1) {
        // Reemplazar existente
        const newLicenses = [...prevLicenses];
        newLicenses[index] = updatedLicense;
        return newLicenses;
      } else {
        // Añadir nueva
        return [...prevLicenses, updatedLicense];
      }
    });
  }, []);

  const removeLicense = useCallback((licenseId: string) => {
    setLicenses((prevLicenses) =>
      prevLicenses.filter((lic) => lic.id !== licenseId)
    );
  }, []);

  // --- Helpers para obtener información filtrada y paginada ---
  const getSortedAndFilteredLicenses = useCallback(
    (columnDefinitions: any[]) => {
      const filteredLicenses = getFilteredLicenses();

      return [...filteredLicenses].sort((a, b) => {
        const column = columnDefinitions.find((col) => col.key === sortKey);
        if (!column?.sortable) return 0;

        let valueA: any;
        let valueB: any;
        const sortKeyPath = column.sortKey || sortKey;

        if (typeof sortKeyPath === "function") {
          valueA = sortKeyPath(a);
          valueB = sortKeyPath(b);
        } else {
          // Acceder a propiedades anidadas si es necesario (ej: contactInfo.name)
          const keys = sortKeyPath.split(".");
          valueA = keys.reduce(
            (obj: any, key: string) => obj?.[key as keyof typeof obj],
            a as any
          );
          valueB = keys.reduce(
            (obj: any, key: string) => obj?.[key as keyof typeof obj],
            b as any
          );
        }

        // Comparación
        if (valueA === valueB) return 0;
        if (valueA == null) return sortDirection === "asc" ? -1 : 1; // nulls primero o último
        if (valueB == null) return sortDirection === "asc" ? 1 : -1;

        if (typeof valueA === "string" && typeof valueB === "string") {
          return sortDirection === "asc"
            ? valueA.localeCompare(valueB, undefined, { sensitivity: "base" })
            : valueB.localeCompare(valueA, undefined, { sensitivity: "base" });
        }

        // Comparación numérica o de fechas (asumiendo que las fechas ya son comparables)
        const comparison = valueA < valueB ? -1 : 1;
        return sortDirection === "asc" ? comparison : -comparison;
      });
    },
    [getFilteredLicenses, sortKey, sortDirection]
  );

  const getPaginatedLicenses = useCallback(
    (sortedLicenses: License[]) => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return sortedLicenses.slice(startIndex, endIndex);
    },
    [currentPage, itemsPerPage]
  );

  return {
    // Estados principales
    licenses,
    apiLicensesData,
    allModules,
    isLoading,
    setIsLoading, // Exportamos el setter para que sea accesible
    error,
    setError, // También exportamos este setter que podría ser necesario

    // Filtros y ordenamiento
    searchTerm,
    setSearchTerm,
    filterStatus,
    filterExpiration,
    viewMode,
    setViewMode,
    sortKey,
    sortDirection,

    // Paginación
    currentPage,
    itemsPerPage,
    setItemsPerPage,

    // Métodos
    loadLicensesAndModules,
    getFilteredLicenses,
    handleFilterChange,
    handleResetFilters,
    addOrUpdateLicense,
    removeLicense,
    getSortedAndFilteredLicenses,
    getPaginatedLicenses,

    // Setters para ordenamiento y paginación
    setSortKey,
    setSortDirection,
    setCurrentPage,
  };
}
