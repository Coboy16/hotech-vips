import React, { useState } from "react";
import { LogOut, ChevronRight, ChevronLeft, Menu } from "lucide-react";
import { useSidebarStore } from "../store/sidebarStore";
import { menuItems } from "../config/menuItems";
import { MenuItemComponent } from "./MenuItem";
import { useModulePermissions } from "../../../../features/auth/contexts/ModulePermissionsContext";
import { MenuItem } from "../types";

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onLogout: () => void;
  logoUrl?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  onLogout,
  logoUrl = "https://i.postimg.cc/jdTNsfWq/Logo-Ho-Tech-Blanco.png",
}) => {
  const { isExpanded, toggleExpanded } = useSidebarStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { hasModuleAccess } = useModulePermissions();

  // Filtrar elementos del menú según los permisos de módulos
  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items.filter((item) => {
      // Verificar si el usuario tiene acceso a este módulo
      const hasAccess = hasModuleAccess(item.modulePermission);

      // Si tiene hijos, filtrar recursivamente
      if (item.children && item.children.length > 0) {
        const filteredChildren = filterMenuItems(item.children);

        // Si no tiene hijos después de filtrar y el módulo principal no tiene acceso específico, ocultar
        if (
          filteredChildren.length === 0 &&
          item.modulePermission !== "always_visible"
        ) {
          return false;
        }

        // Actualizar los hijos con los elementos filtrados
        item.children = filteredChildren;
      }

      return hasAccess;
    });
  };

  // Obtener elementos filtrados
  const filteredMenuItems = filterMenuItems([...menuItems]);

  // Reordenar el menú (como en tu implementación original)
  const reorderedMenuItems = [...filteredMenuItems].sort((a, b) => {
    if (a.id === "administration" || a.id === "system-config") return 1;
    if (b.id === "administration" || b.id === "system-config") return -1;
    return 0;
  });

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-blue-600 text-white"
        aria-label="Toggle mobile menu"
        aria-expanded={isMobileMenuOpen}
      >
        <Menu className="w-6 h-6" aria-hidden="true" />
      </button>

      <aside
        className={`
          ${isExpanded ? "w-64" : "w-20"} 
          ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
          fixed inset-y-0 left-0 lg:relative
          bg-gradient-to-b from-blue-600 to-blue-800 text-white
          flex flex-col transition-all duration-300
          z-40
        `}
      >
        <div className="p-6 flex flex-col items-center justify-center">
          <div className="flex items-center justify-center mb-4">
            <img
              src={logoUrl}
              alt="Company Logo"
              className={`h-[100px] object-contain transition-all duration-300 ${
                isExpanded ? "w-full" : "w-12"
              }`}
            />
          </div>
          <button
            onClick={toggleExpanded}
            className="p-1 rounded-lg hover:bg-white hover:bg-opacity-10"
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isExpanded ? (
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            ) : (
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>

        <nav
          className="flex-1 overflow-y-auto px-3 space-y-1"
          aria-label="Sidebar navigation"
        >
          {reorderedMenuItems.map((item) => (
            <MenuItemComponent
              key={item.id}
              item={item}
              currentView={currentView}
              setCurrentView={setCurrentView}
            />
          ))}
          <button
            onClick={onLogout}
            className="w-full mt-4 px-3 py-2 rounded-lg text-sm hover:bg-white hover:bg-opacity-10 transition-all flex items-center"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            {isExpanded && <span className="ml-3">Cerrar sesión</span>}
          </button>
        </nav>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};
