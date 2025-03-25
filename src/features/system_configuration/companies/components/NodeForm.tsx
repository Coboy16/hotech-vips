// src/components/components/NodeForm.tsx

import React, { useState } from "react";
import {
  X,
  User,
  Mail,
  MapPin,
  Briefcase,
  Building2,
  Users,
  FolderTree,
} from "lucide-react";
import { Country, OrganizationalNode } from "../types";

interface NodeFormProps {
  node?: OrganizationalNode | null;
  parentType?: string;
  onClose: () => void;
  onSubmit: (data: Partial<OrganizationalNode>) => void;
  countries?: Country[]; // Añadir propiedad para países
}

const nodeTypes = [
  { value: "company", label: "Compañía", icon: "Building2" },
  { value: "branch", label: "Sucursal", icon: "Building" },
  { value: "department", label: "Departamento", icon: "Users" },
  { value: "section", label: "Sección", icon: "FolderTree" },
  { value: "unit", label: "Unidad", icon: "Briefcase" },
];

export function NodeForm({
  node,
  parentType,
  onClose,
  onSubmit,
  countries = [],
}: NodeFormProps) {
  // Estado para manejar las pestañas
  const [activeTab, setActiveTab] = useState("general");

  // Crear un objeto inicial válido con todos los campos requeridos
  const initialFormData: Partial<OrganizationalNode> = {
    name: "",
    type: "company", // Valor por defecto
    status: "active",
    description: "",
    level: 1,
    code: "", // Añadir campo para RNC
    metadata: {
      employeeCount: 0,
      countryId: countries.length > 0 ? countries[0].pais_iden : "",
      contact: {
        managerFullName: "",
        position: "",
        email: "",
        phone: "",
        extension: "",
        physicalLocation: {
          building: "",
          floor: "",
          office: "",
        },
      },
    },
  };

  // Si existe un parentType, intentar determinar el tipo de nodo hijo adecuado
  if (parentType) {
    const parentIndex = nodeTypes.findIndex((t) => t.value === parentType);
    if (parentIndex !== -1 && parentIndex < nodeTypes.length - 1) {
      initialFormData.type = nodeTypes[parentIndex + 1]
        .value as OrganizationalNode["type"];
    }
  }

  // Si hay un nodo existente, usarlo; de lo contrario, usar el initialFormData
  const [formData, setFormData] = useState<Partial<OrganizationalNode>>(
    node || initialFormData
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Determinar los tipos permitidos basados en el parentType
  const allowedTypes = parentType
    ? nodeTypes.slice(nodeTypes.findIndex((t) => t.value === parentType) + 1)
    : nodeTypes;

  // Obtener el icono según el tipo de nodo
  const getNodeIcon = (type: string) => {
    switch (type) {
      case "company":
        return <Building2 className="w-5 h-5 text-blue-500" />;
      case "branch":
        return <Building2 className="w-5 h-5 text-green-500" />;
      case "department":
        return <Users className="w-5 h-5 text-purple-500" />;
      case "section":
        return <FolderTree className="w-5 h-5 text-amber-500" />;
      case "unit":
        return <Briefcase className="w-5 h-5 text-blue-500" />;
      default:
        return <Building2 className="w-5 h-5 text-gray-500" />;
    }
  };

  const nodeNames: Record<string, string> = {
    company: "Empresa",
    branch: "Sucursal",
    department: "Departamento",
    section: "Sección",
    unit: "Unidad",
  };

  const nodeTitle = formData.type ? nodeNames[formData.type] || "Nodo" : "Nodo";

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            {formData.type && getNodeIcon(formData.type as string)}
            <h2 className="text-xl font-semibold text-gray-900">
              {node ? `Editar ${nodeTitle}` : `Nuevo ${nodeTitle}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Pestañas horizontales */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px px-6">
            <button
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "general"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("general")}
            >
              <div className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Datos generales
              </div>
            </button>
            <button
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "contact"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("contact")}
            >
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Información de contacto
              </div>
            </button>
            <button
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "location"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("location")}
            >
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Ubicación física
              </div>
            </button>
            <button
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "additional"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("additional")}
            >
              <div className="flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Información adicional
              </div>
            </button>
          </nav>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {/* Contenido de la pestaña Datos generales */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.type || "company"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as OrganizationalNode["type"],
                        })
                      }
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      {allowedTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      value={formData.status || "active"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as "active" | "inactive",
                        })
                      }
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </div>

                  {formData.type === "company" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        RNC / Identificación{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.code || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, code: e.target.value })
                        }
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required={formData.type === "company"}
                      />
                    </div>
                  )}

                  {formData.type !== "company" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código
                      </label>
                      <input
                        type="text"
                        value={formData.code || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, code: e.target.value })
                        }
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>

                {formData.type === "company" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      País <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.metadata?.countryId || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          metadata: {
                            ...formData.metadata,
                            countryId: e.target.value,
                          },
                        })
                      }
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required={formData.type === "company"}
                    >
                      {countries.length === 0 ? (
                        <option value="">Cargando países...</option>
                      ) : (
                        countries.map((country) => (
                          <option
                            key={country.pais_iden}
                            value={country.pais_iden}
                          >
                            {country.pais_desc}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Contenido de la pestaña Información de contacto */}
            {activeTab === "contact" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del responsable
                    </label>
                    <input
                      type="text"
                      value={formData.metadata?.contact?.managerFullName || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          metadata: {
                            ...formData.metadata,
                            contact: {
                              ...(formData.metadata?.contact || {}),
                              managerFullName: e.target.value,
                            },
                          },
                        })
                      }
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cargo
                    </label>
                    <input
                      type="text"
                      value={formData.metadata?.contact?.position || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          metadata: {
                            ...formData.metadata,
                            contact: {
                              ...(formData.metadata?.contact || {}),
                              position: e.target.value,
                            },
                          },
                        })
                      }
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      value={formData.metadata?.contact?.email || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          metadata: {
                            ...formData.metadata,
                            contact: {
                              ...(formData.metadata?.contact || {}),
                              email: e.target.value,
                            },
                          },
                        })
                      }
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formData.metadata?.contact?.phone || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          metadata: {
                            ...formData.metadata,
                            contact: {
                              ...(formData.metadata?.contact || {}),
                              phone: e.target.value,
                            },
                          },
                        })
                      }
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Extensión
                  </label>
                  <input
                    type="text"
                    value={formData.metadata?.contact?.extension || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metadata: {
                          ...formData.metadata,
                          contact: {
                            ...(formData.metadata?.contact || {}),
                            extension: e.target.value,
                          },
                        },
                      })
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Contenido de la pestaña Ubicación física */}
            {activeTab === "location" && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Edificio
                    </label>
                    <input
                      type="text"
                      value={
                        formData.metadata?.contact?.physicalLocation
                          ?.building || ""
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          metadata: {
                            ...formData.metadata,
                            contact: {
                              ...(formData.metadata?.contact || {}),
                              physicalLocation: {
                                ...(formData.metadata?.contact
                                  ?.physicalLocation || {}),
                                building: e.target.value,
                              },
                            },
                          },
                        })
                      }
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Piso
                    </label>
                    <input
                      type="text"
                      value={
                        formData.metadata?.contact?.physicalLocation?.floor ||
                        ""
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          metadata: {
                            ...formData.metadata,
                            contact: {
                              ...(formData.metadata?.contact || {}),
                              physicalLocation: {
                                ...(formData.metadata?.contact
                                  ?.physicalLocation || {}),
                                floor: e.target.value,
                              },
                            },
                          },
                        })
                      }
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Oficina
                    </label>
                    <input
                      type="text"
                      value={
                        formData.metadata?.contact?.physicalLocation?.office ||
                        ""
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          metadata: {
                            ...formData.metadata,
                            contact: {
                              ...(formData.metadata?.contact || {}),
                              physicalLocation: {
                                ...(formData.metadata?.contact
                                  ?.physicalLocation || {}),
                                office: e.target.value,
                              },
                            },
                          },
                        })
                      }
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Contenido de la pestaña Información adicional */}
            {activeTab === "additional" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad de empleados
                    </label>
                    <input
                      type="number"
                      value={formData.metadata?.employeeCount || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          metadata: {
                            ...formData.metadata,
                            employeeCount: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nivel
                    </label>
                    <input
                      type="number"
                      value={formData.level || 1}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          level: parseInt(e.target.value) || 1,
                        })
                      }
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {node ? "Guardar cambios" : `Crear ${nodeTitle}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
