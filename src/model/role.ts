/**
 * Representa un Rol como viene de la API
 */
export interface ApiRole {
  id: string;
  rol_id: string;
  nombre: string;
  created_at?: string; // Opcional, según la respuesta del GET
  updated_at?: string; // Opcional
  rolesModules?: {
    module: {
      module_id: string;
      name: string;
    };
  }[];
}

/**
 * Representa un Rol simplificado para usar en selectores, etc.
 */
export interface Role {
  id: string;
  name: string;
}
