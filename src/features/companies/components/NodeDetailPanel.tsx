import React from "react";
import {
  Building2,
  Users,
  FolderTree,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  Edit,
  Trash,
  Plus,
} from "lucide-react";
import {
  OrganizationalNode,
  NodeType,
} from "../../../../model/organizationalStructure";

// Mapeo de tipos a iconos y nombres (similar a TreeItem)
const nodeTypesConfig: Record<
  NodeType,
  { label: string; icon: React.ElementType }
> = {
  company: { label: "Compañía", icon: Building2 },
  branch: { label: "Sucursal", icon: Building2 },
  department: { label: "Departamento", icon: Users },
  section: { label: "Sección", icon: FolderTree },
  unit: { label: "Unidad", icon: Briefcase },
};

interface NodeDetailPanelProps {
  node: OrganizationalNode;
  onEdit: (node: OrganizationalNode) => void;
  onDelete: (node: OrganizationalNode) => void;
  onAddChild: (parentNode: OrganizationalNode) => void; // Para añadir subnivel
  isLoading?: boolean; // Para mostrar estado de carga en acciones
}

export const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({
  node,
  onEdit,
  onDelete,
  onAddChild,
  isLoading = false,
}) => {
  const { label: nodeTypeName, icon: NodeIcon } = nodeTypesConfig[
    node.type
  ] || { label: node.type, icon: Building2 };
  const canCreateChild = node.type !== "unit"; // Asumiendo que las unidades no tienen hijos

  return (
    <div className="p-6 sm:p-8 h-full flex flex-col">
      {" "}
      {/* Ajusta padding y flex */}
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <NodeIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h1
              className="text-xl sm:text-2xl font-semibold text-gray-900 truncate"
              title={node.name}
            >
              {node.name}
            </h1>
            <p className="text-sm text-gray-500 capitalize">
              {nodeTypeName}{" "}
              {node.status === "inactive" ? (
                <span className="text-red-600">(Inactivo)</span>
              ) : (
                ""
              )}
            </p>
            {node.code && (
              <p className="text-xs text-gray-400 mt-1">Código: {node.code}</p>
            )}
          </div>
        </div>
        {/* Botones de Acción */}
        <div className="flex items-center space-x-2 flex-shrink-0 w-full sm:w-auto justify-end">
          {canCreateChild && (
            <button
              onClick={() => onAddChild(node)}
              disabled={isLoading}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Subnivel</span>
            </button>
          )}
          <button
            onClick={() => onEdit(node)}
            disabled={isLoading}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Editar</span>
          </button>
          <button
            onClick={() => onDelete(node)}
            disabled={isLoading}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
            title="Eliminar"
          >
            <Trash className="w-5 h-5" />
          </button>
        </div>
      </div>
      {/* Contenido Principal */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Columna 1: Contacto y Ubicación */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100 space-y-5">
          <h3 className="text-sm font-semibold text-gray-800 border-b pb-2 mb-3">
            Información de Contacto y Ubicación
          </h3>

          {/* Contacto */}
          {node.metadata?.contact ? (
            <div className="space-y-3 text-sm">
              {node.metadata.contact.managerFullName && (
                <DetailItem
                  icon={Users}
                  label="Responsable"
                  value={node.metadata.contact.managerFullName}
                />
              )}
              {node.metadata.contact.position && (
                <DetailItem
                  icon={Briefcase}
                  label="Cargo"
                  value={node.metadata.contact.position}
                />
              )}
              {node.metadata.contact.email && (
                <DetailItem
                  icon={Mail}
                  label="Email"
                  value={node.metadata.contact.email}
                  isLink={`mailto:${node.metadata.contact.email}`}
                />
              )}
              {node.metadata.contact.phone && (
                <DetailItem
                  icon={Phone}
                  label="Teléfono"
                  value={`${node.metadata.contact.phone}${
                    node.metadata.contact.extension
                      ? ` ext. ${node.metadata.contact.extension}`
                      : ""
                  }`}
                />
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">
              No hay información de contacto.
            </p>
          )}

          {/* Ubicación Física */}
          {(node.metadata?.address ||
            node.metadata?.contact?.physicalLocation) && (
            <div className="space-y-3 text-sm pt-3 border-t mt-4">
              {node.metadata?.address && ( // Dirección general (para sucursal)
                <DetailItem
                  icon={MapPin}
                  label="Dirección"
                  value={node.metadata.address}
                />
              )}
              {node.metadata?.contact?.physicalLocation?.building && (
                <DetailItem
                  icon={Building2}
                  label="Edificio"
                  value={node.metadata.contact.physicalLocation.building}
                />
              )}
              {node.metadata?.contact?.physicalLocation?.floor && (
                <DetailItem
                  icon={Users}
                  label="Piso"
                  value={node.metadata.contact.physicalLocation.floor}
                /> // Reusar icono o usar uno específico
              )}
              {node.metadata?.contact?.physicalLocation?.office && (
                <DetailItem
                  icon={Users}
                  label="Oficina"
                  value={node.metadata.contact.physicalLocation.office}
                /> // Reusar icono o usar uno específico
              )}
            </div>
          )}
        </div>

        {/* Columna 2: Estadísticas y Detalles */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100 space-y-5">
          <h3 className="text-sm font-semibold text-gray-800 border-b pb-2 mb-3">
            Estadísticas y Detalles
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {/* Cantidad Empleados */}
            <StatItem
              label="Empleados"
              value={node.metadata?.employeeCount ?? "-"}
            />
            {/* Subniveles */}
            <StatItem label="Subniveles" value={node.children?.length ?? 0} />
            {/* Nivel Jerárquico */}
            <StatItem label="Nivel" value={node.level ?? "-"} />
            {/* País (si es compañía) */}
            {node.type === "company" && node.metadata?.countryId && (
              <StatItem label="País ID" value={node.metadata.countryId} /> // Mostrar ID o buscar nombre
            )}
          </div>

          {/* Descripción */}
          {node.description && (
            <div className="pt-3 border-t mt-4">
              <h4 className="text-xs font-medium text-gray-500 mb-1 uppercase">
                Descripción
              </h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {node.description}
              </p>
            </div>
          )}
        </div>

        {/* Columna 3: Subniveles (Placeholder o contenido real) */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800 border-b pb-2 mb-3">
            Subniveles Directos
          </h3>
          {node.children && node.children.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {" "}
              {/* Scroll si hay muchos */}
              {node.children.map((child) => {
                const { icon: ChildIcon } = nodeTypesConfig[child.type] || {
                  icon: Building2,
                };
                return (
                  <div
                    key={child.id}
                    className="flex items-center justify-between text-sm p-1.5 rounded hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <ChildIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="truncate font-medium" title={child.name}>
                        {child.name}
                      </span>
                    </div>
                    {child.metadata?.employeeCount !== undefined && (
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {child.metadata.employeeCount} empl.
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">
              No tiene subniveles directos.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente auxiliar para mostrar detalles con icono
const DetailItem: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string | number;
  isLink?: string;
}> = ({ icon: Icon, label, value, isLink }) => (
  <div className="flex items-start space-x-3">
    <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
    <div className="min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      {isLink ? (
        <a
          href={isLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline break-words"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm text-gray-800 break-words">{value}</p>
      )}
    </div>
  </div>
);

// Componente auxiliar para mostrar estadísticas
const StatItem: React.FC<{ label: string; value: string | number }> = ({
  label,
  value,
}) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-base font-semibold text-gray-900">{value}</p>
  </div>
);
