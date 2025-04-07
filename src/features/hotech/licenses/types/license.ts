import { ColumnDefinition } from "../../../../components/common";
import { License } from "../../../../model/license";

// Props para el componente presentacional LicenseList
export interface LicenseListProps {
  licenses: License[];
  columns: ColumnDefinition<License>[]; // Asegúrate que ColumnDefinition esté importado o definido
  isLoading: boolean;
  emptyMessage: string;
  pagination: {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (itemsPerPage: number) => void;
    itemsPerPageOptions?: number[];
  };
  sorting: {
    sortKey: string;
    sortDirection: "asc" | "desc";
    onSort: (key: string, direction: "asc" | "desc") => void;
  };
  onRowClick: (license: License) => void;
}

// Props para el componente presentacional LicenseGridDisplay
export interface LicenseGridDisplayProps {
  licenses: License[];
  isLoading: boolean;
  emptyMessage: string;
  pagination: {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (itemsPerPage: number) => void;
    itemsPerPageOptions?: number[];
  };
  contextMenu: {
    contextMenuLicense: License | null;
    renderContextMenu?: (license: License) => React.ReactNode;
  };
  onCardClick: (license: License) => void;
  onMenuClick: (license: License, e: React.MouseEvent) => void;
  // Pasa las funciones específicas del menú si son necesarias aquí
  onRenew: (license: License) => void;
  onHistory: (license: License) => void;
  onDelete: (license: License) => void;
}

// Props para los filtros (si decides crear un componente presentacional para ellos)
export interface FiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterValues: { [key: string]: string };
  onFilterChange: (filterName: string, value: string) => void;
  filterOptions: {
    [key: string]: {
      label: string;
      options: { value: string; label: string }[];
    };
  };
  viewMode: "list" | "grid";
  onViewModeChange: (mode: "list" | "grid") => void;
  onResetFilters: () => void;
}
