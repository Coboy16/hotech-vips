// Tipos relacionados con Módulos movidos aquí

// Interfaz que representa un módulo (puede venir de la API o definirse localmente)
export interface Module {
  module_id: string;
  name: string; // Identificador único (ej: 'panel_monitoreo')
  label?: string; // Nombre legible (ej: 'Panel de Monitoreo')
  // Puedes añadir más campos si son necesarios (icono, descripción, etc.)
}

// Estructura para agrupar módulos en el selector
export interface ModuleGroup {
  id: string; // ID del módulo principal del grupo
  label: string;
  permission: string; // Permiso asociado al grupo principal
  icon: React.ElementType; // Icono para el grupo
  isExpanded?: boolean; // Estado de expansión en UI
  modules: ModuleItem[]; // Submódulos dentro del grupo
}

// Estructura para un item de módulo individual dentro de un grupo
export interface ModuleItem {
  id: string; // ID del submódulo
  label: string;
  permission: string; // Permiso asociado al submódulo
  isSelected?: boolean; // Estado de selección en UI
}

// Si la API devuelve los módulos con una estructura específica, define esa interfaz aquí también
// Ejemplo basado en licenseService.getAllModules
export interface ModuleFromApi {
  module_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}
