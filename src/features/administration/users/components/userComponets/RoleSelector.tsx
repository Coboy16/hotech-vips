import { useEffect, useState } from "react";
import { roleService } from "../../services/roleService";
import { ApiRole } from "../../../../../model/role";
import { Loader2, AlertCircle } from "lucide-react";

interface RoleSelectorProps {
  selectedRole: string;
  onChange: (
    roleId: string,
    modules?: { module_id: string; name: string }[]
  ) => void;
  className?: string;
  disabled?: boolean;
}

export function RoleSelector({
  selectedRole,
  onChange,
  className = "",
  disabled = false,
}: RoleSelectorProps) {
  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedRoles = await roleService.getAllRoles();
        setRoles(fetchedRoles);
      } catch (err) {
        console.error("Error fetching roles:", err);
        setError("No se pudieron cargar los roles.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const handleRoleChange = (roleId: string) => {
    console.log("[RoleSelector] Rol seleccionado:", roleId);

    // Si el ID es vacío, alertar
    if (!roleId || roleId.trim() === "") {
      console.warn("[RoleSelector] Se seleccionó un rol con ID vacío");
    }

    // Buscar el rol seleccionado para obtener sus módulos
    const selectedRoleObj = roles.find((role) => role.rol_id === roleId);
    console.log("[RoleSelector] Objeto de rol encontrado:", selectedRoleObj);

    // Llamar a onChange con el ID del rol
    onChange(roleId);
  };

  const baseClasses =
    "block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-2 border border-gray-300 rounded-md bg-gray-50">
        <Loader2 className="w-4 h-4 mr-2 animate-spin text-gray-500" />
        <span className="text-sm text-gray-500">Cargando roles...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center p-2 border border-red-300 rounded-md bg-red-50 text-red-700">
        <AlertCircle className="w-4 h-4 mr-2" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  return (
    <select
      value={selectedRole}
      onChange={(e) => handleRoleChange(e.target.value)}
      className={`${baseClasses} ${className}`}
      disabled={disabled || roles.length === 0}
    >
      <option value="">
        {roles.length > 0 ? "Seleccione un rol" : "No hay roles disponibles"}
      </option>
      {roles.map((role) => (
        <option key={role.rol_id} value={role.rol_id}>
          {role.nombre}
        </option>
      ))}
    </select>
  );
}
