import { useMemo } from "react";
import React from "react";
import {
  BarChart2,
  Users,
  Clock,
  DoorClosed,
  Utensils,
  AlignCenter,
  AlertTriangle,
} from "lucide-react";
import { formatDateForDisplay } from "../../utils/adapters";

/**
 * Hook para obtener funciones de ayuda para mostrar y formatear información de licencias
 */
export function useLicenseDisplay() {
  // Mapeo de nombres de módulos a etiquetas legibles
  const moduleLabels = useMemo(
    () => ({
      panel_monitoreo: "Panel de Monitoreo",
      empleados: "Empleados",
      control_tiempo: "Control de Tiempo",
      control_acceso: "Control de Acceso",
      comedor: "Comedor",
      reportes: "Reportes",
      gestion_empleados: "Gestión de Empleados",
      planificador_horarios: "Planificador de horarios",
      gestion_incidencias: "Gestión de Incidencias",
      calendario: "Calendario",
      visitantes: "Visitantes",
      permisos_acceso: "Permisos de Acceso",
      reportes_mas_usados: "Reportes más usados",
    }),
    []
  );

  // Función para determinar el estado de vencimiento
  const getExpirationStatus = (
    dateString: string | undefined
  ): "danger" | "warning" | "success" | "unknown" => {
    if (!dateString) return "unknown";
    try {
      const expirationDate = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expirationDate.setHours(0, 0, 0, 0); // Comparar solo fechas
      const diffTime = expirationDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 30) return "danger";
      if (diffDays <= 90) return "warning";
      return "success";
    } catch {
      return "unknown";
    }
  };

  // Función para obtener el color de clase CSS según el estado de vencimiento
  const getExpirationStatusClass = (
    status: "danger" | "warning" | "success" | "unknown"
  ): string => {
    switch (status) {
      case "danger":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "success":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Función para obtener el ícono correspondiente a un módulo
  const getModuleIcon = (moduleName: string) => {
    const iconMap: Record<string, React.ElementType> = {
      panel_monitoreo: BarChart2,
      empleados: Users,
      control_tiempo: Clock,
      control_acceso: DoorClosed,
      comedor: Utensils,
      reportes: AlignCenter,
    };

    return React.createElement(iconMap[moduleName] || AlertTriangle, {
      className: "w-5 h-5 text-blue-500",
    });
  };

  // Función para obtener la etiqueta legible de un módulo
  const getModuleLabel = (moduleName: string): string => {
    return moduleLabels[moduleName as keyof typeof moduleLabels] || moduleName;
  };

  // Función para formatear la fecha de vencimiento con su clase de estado
  const formatExpirationDate = (dateString: string | undefined) => {
    const status = getExpirationStatus(dateString);
    const badgeClass = getExpirationStatusClass(status);

    return {
      formattedDate: formatDateForDisplay(dateString) || "N/A",
      badgeClass,
      status,
    };
  };

  return {
    moduleLabels,
    getExpirationStatus,
    getExpirationStatusClass,
    getModuleIcon,
    getModuleLabel,
    formatExpirationDate,
  };
}
