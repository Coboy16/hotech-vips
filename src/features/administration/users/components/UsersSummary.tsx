// src/features/users/components/UsersSummary.tsx

import React from "react";
import { Users, CheckCircle, XCircle, Shield } from "lucide-react";
import { User } from "../types/user";

interface UsersSummaryProps {
  users: User[];
}

const UsersSummary: React.FC<UsersSummaryProps> = ({ users }) => {
  // Calcular resumen
  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.status === "active").length;
  const inactiveUsers = users.filter(
    (user) => user.status === "inactive"
  ).length;

  // Contar usuarios por rol de administración
  const adminUsers = users.filter(
    (user) =>
      user.role === "admin" ||
      user.permissions.adminAccess ||
      (user.permissions.approveHours &&
        user.permissions.modifyChecks &&
        user.permissions.manageReports)
  ).length;

  // Calcular usuarios con acceso reciente (últimos 7 días)
  // const recentlyActive = users.filter(user => {
  //   const lastLogin = new Date(user.lastLogin);
  //   const today = new Date();
  //   const diffTime = today.getTime() - lastLogin.getTime();
  //   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  //   return diffDays <= 7 && user.status === 'active';
  // }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Total de usuarios */}
      <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-gray-500">Total Usuarios</h2>
          <p className="text-3xl font-bold text-gray-800">{totalUsers}</p>
        </div>
        <div className="bg-gray-100 p-3 rounded-full">
          <Users className="h-6 w-6 text-gray-600" />
        </div>
      </div>

      {/* Usuarios activos */}
      <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-gray-500">Activos</h2>
          <p className="text-3xl font-bold text-green-600">{activeUsers}</p>
        </div>
        <div className="bg-green-100 p-3 rounded-full">
          <CheckCircle className="h-6 w-6 text-green-500" />
        </div>
      </div>

      {/* Usuarios inactivos */}
      <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-gray-500">Inactivos</h2>
          <p className="text-3xl font-bold text-red-600">{inactiveUsers}</p>
        </div>
        <div className="bg-red-100 p-3 rounded-full">
          <XCircle className="h-6 w-6 text-red-500" />
        </div>
      </div>

      {/* Administradores */}
      <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-gray-500">Administradores</h2>
          <p className="text-3xl font-bold text-purple-600">{adminUsers}</p>
        </div>
        <div className="bg-purple-100 p-3 rounded-full">
          <Shield className="h-6 w-6 text-purple-500" />
        </div>
      </div>
    </div>
  );
};

export default UsersSummary;
