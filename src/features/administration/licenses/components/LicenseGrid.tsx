import React, { useState } from "react";
import LicenseCard from "./LicenseCard";
import { License } from "../types/license";
import Pagination from "../../../../components/common/table/Pagination";

interface LicenseGridProps {
  licenses: License[];
  onCardClick: (license: License) => void;
  onMenuClick: (license: License, e: React.MouseEvent) => void;
  contextMenuLicense: License | null;
  renderContextMenu?: (license: License) => React.ReactNode;
  emptyMessage?: string;
}

const LicenseGrid: React.FC<LicenseGridProps> = ({
  licenses,
  onCardClick,
  onMenuClick,
  contextMenuLicense,
  renderContextMenu,
  emptyMessage = "No se encontraron licencias con los filtros seleccionados.",
}) => {
  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(12); // Opciones: 6, 12, 24, 36

  // Calcular las licencias que se mostrarán en la página actual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLicenses = licenses.slice(startIndex, endIndex);

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll al inicio de la cuadrícula
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Manejar cambio de elementos por página
  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Resetear a la primera página
  };

  return (
    <div>
      {licenses.length > 0 ? (
        <>
          {/* Cuadrícula de tarjetas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedLicenses.map((license) => (
              <div key={license.id} className="relative">
                <LicenseCard
                  license={license}
                  onCardClick={onCardClick}
                  onMenuClick={onMenuClick}
                  menuOpen={
                    contextMenuLicense
                      ? contextMenuLicense.id === license.id
                      : undefined
                  }
                />
                {/* Renderizar menú contextual si existe y está abierto para esta licencia */}
                {contextMenuLicense &&
                  contextMenuLicense.id === license.id &&
                  renderContextMenu &&
                  renderContextMenu(license)}
              </div>
            ))}
          </div>

          {/* Paginación */}
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalItems={licenses.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              itemsPerPageOptions={[6, 12, 24, 36]} // Opciones específicas para la vista de cuadrícula
            />
          </div>
        </>
      ) : (
        // Mensaje cuando no hay licencias
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
};

export default LicenseGrid;
