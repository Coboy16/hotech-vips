import React from "react";
import { ListChecks } from "lucide-react"; // O cualquier otro icono relevante
import { RoleKPIsData } from "../types";

interface RoleKPIsProps {
  kpiData: RoleKPIsData;
  isLoading: boolean;
}

const RoleKPIs: React.FC<RoleKPIsProps> = ({ kpiData, isLoading }) => {
  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
  }> = ({ title, value, icon }) => (
    <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
      <div className="p-3 rounded-full bg-blue-100 text-blue-600">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        {isLoading ? (
          <div className="h-6 bg-gray-200 rounded w-12 animate-pulse"></div>
        ) : (
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Total de Roles"
        value={kpiData.totalRoles}
        icon={<ListChecks className="h-6 w-6" />}
      />
      {/* Puedes añadir más StatCards aquí para otros KPIs */}
      {/* Ejemplo placeholder:
       <StatCard
         title="Roles Activos"
         value={isLoading ? '...' : kpiData.rolesActivos || 0}
         icon={<Activity className="h-6 w-6" />}
       />
      */}
    </div>
  );
};

export default RoleKPIs;
