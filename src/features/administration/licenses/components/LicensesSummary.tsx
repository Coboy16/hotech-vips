import React from "react";
import { Building2, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { License } from "../types/license";

interface LicensesSummaryProps {
  licenses: License[];
}

export const LicensesSummary: React.FC<LicensesSummaryProps> = ({
  licenses,
}) => {
  // Calcular resumen
  const totalLicenses = licenses.length;
  const activeLicenses = licenses.filter(
    (license) => license.status === "active"
  ).length;

  // Calcular vencimientos
  const criticalExpirations = licenses.filter((license) => {
    const expirationDate = new Date(license.expirationDate);
    const today = new Date();
    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && license.status === "active";
  }).length;

  const upcomingExpirations = licenses.filter((license) => {
    const expirationDate = new Date(license.expirationDate);
    const today = new Date();
    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 30 && diffDays <= 90 && license.status === "active";
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Total de licencias */}
      <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-gray-500">Total Licencias</h2>
          <p className="text-3xl font-bold text-gray-800">{totalLicenses}</p>
        </div>
        <div className="bg-gray-100 p-3 rounded-full">
          <Building2 className="h-6 w-6 text-gray-600" />
        </div>
      </div>

      {/* Licencias activas */}
      <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-gray-500">Activas</h2>
          <p className="text-3xl font-bold text-green-600">{activeLicenses}</p>
        </div>
        <div className="bg-green-100 p-3 rounded-full">
          <CheckCircle className="h-6 w-6 text-green-500" />
        </div>
      </div>

      {/* Vencimientos críticos */}
      <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-gray-500">Venc. Críticos</h2>
          <p className="text-3xl font-bold text-red-600">
            {criticalExpirations}
          </p>
          <p className="text-xs text-gray-500">Próximos 30 días</p>
        </div>
        <div className="bg-red-100 p-3 rounded-full">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
      </div>

      {/* Próximos vencimientos */}
      <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-gray-500">
            Próx. Vencimientos
          </h2>
          <p className="text-3xl font-bold text-amber-500">
            {upcomingExpirations}
          </p>
          <p className="text-xs text-gray-500">31-90 días</p>
        </div>
        <div className="bg-amber-100 p-3 rounded-full">
          <Clock className="h-6 w-6 text-amber-500" />
        </div>
      </div>
    </div>
  );
};

export default LicensesSummary;
