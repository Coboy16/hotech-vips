// src/components/StructureScreen.tsx (parte relevante)

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Building2,
  Users,
  MapPin,
  Phone,
  Mail,
  Edit,
  Trash,
  FolderTree,
  Briefcase,
  ChevronRight,
  Building,
} from "lucide-react";
import { OrganizationalTree } from "../components/OrganizationalTree";
import { NodeForm } from "../components/NodeForm";
import { SearchComponent } from "../components/SearchComponentProps";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { Toast } from "../components/Toast";
import { useCompanies } from "../hooks/useCompanies";
import { useCountries } from "../hooks/useCountries";
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  OrganizationalNode,
} from "../types";

export function StructureScreen() {
  // Hooks para API
  const {
    companies,
    loading: loadingCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    loadCompanies,
  } = useCompanies();
  const { countries } = useCountries();

  // Estado local para la UI
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNode, setSelectedNode] = useState<OrganizationalNode | null>(
    null
  );
  const [showForm, setShowForm] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const [toast, setToast] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Convertir las compañías de la API a formato de nodos organizacionales
  const organizationalData = useMemo(() => {
    if (!companies || companies.length === 0)
      return { root: null, children: [] };

    // Convertir la primera compañía a nodo raíz (ejemplo)
    const root: OrganizationalNode = {
      id: companies[0]?.comp_iden || "",
      name: companies[0]?.comp_noco || "",
      type: "company",
      status: companies[0]?.comp_stat ? "active" : "inactive",
      level: 1,
      metadata: {
        contact: {
          managerFullName: "",
          position: "Director General",
          email: companies[0]?.comp_emai || "",
          phone: "",
          extension: "",
          physicalLocation: {
            building: "",
            floor: "",
            office: "",
          },
        },
      },
      children: [],
    };

    // Convertir el resto de compañías a nodos hijos
    const children: OrganizationalNode[] = companies
      .slice(1)
      .map((company) => ({
        id: company.comp_iden,
        name: company.comp_noco,
        type: "company",
        status: company.comp_stat ? "active" : "inactive",
        level: 1,
        metadata: {
          contact: {
            managerFullName: "",
            position: "Director General",
            email: company.comp_emai || "",
            phone: "",
            extension: "",
            physicalLocation: {
              building: "",
              floor: "",
              office: "",
            },
          },
        },
        children: [],
      }));

    return { root, children };
  }, [companies]);

  // Función recursiva para buscar nodos que coincidan con el término de búsqueda
  const searchNodes = (
    nodes: OrganizationalNode[],
    term: string
  ): OrganizationalNode[] => {
    if (!term) return [];

    const results: OrganizationalNode[] = [];

    const search = (nodeArray: OrganizationalNode[]) => {
      nodeArray.forEach((node) => {
        // Buscar en el nombre del nodo, responsable o tipo
        if (
          node.name.toLowerCase().includes(term.toLowerCase()) ||
          node.metadata?.contact?.managerFullName
            ?.toLowerCase()
            .includes(term.toLowerCase()) ||
          node.type.toLowerCase().includes(term.toLowerCase())
        ) {
          results.push(node);
        }

        // Buscar recursivamente en los hijos
        if (node.children && node.children.length > 0) {
          search(node.children);
        }
      });
    };

    // Iniciar búsqueda con el nodo raíz y los hijos principales
    const allNodes = [
      ...(organizationalData.root ? [organizationalData.root] : []),
      ...organizationalData.children,
    ];
    search(allNodes);

    return results;
  };

  // Memorizar los resultados de búsqueda
  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    return searchNodes(
      [
        ...(organizationalData.root ? [organizationalData.root] : []),
        ...organizationalData.children,
      ],
      searchTerm
    );
  }, [searchTerm, organizationalData]);

  // Expandir automáticamente los nodos padres de los resultados de búsqueda
  useEffect(() => {
    if (searchResults.length > 0 && searchTerm) {
      // Seleccionar automáticamente el primer resultado si hay una búsqueda activa
      setSelectedNode(searchResults[0]);
    }
  }, [searchResults, searchTerm]);

  // Manejar cambios en el estado de expansión de nodos
  const handleNodeToggle = (nodeId: string) => {
    setExpandedNodes((prev) =>
      prev.includes(nodeId)
        ? prev.filter((id) => id !== nodeId)
        : [...prev, nodeId]
    );
  };

  // Abrir formulario para añadir un nuevo nodo
  const handleAddNode = () => {
    setSelectedNode(null);
    setShowForm(true);
  };

  // Abrir formulario para editar un nodo
  const handleEditNode = (nodeToEdit?: OrganizationalNode) => {
    const nodeToUpdate = nodeToEdit || selectedNode;
    if (nodeToUpdate) {
      setSelectedNode(nodeToUpdate);
      setShowForm(true);
    }
  };

  // Manejar envío del formulario (crear o actualizar)
  const handleSubmitNode = async (data: Partial<OrganizationalNode>) => {
    try {
      // Convertir datos del formulario al DTO de la API
      if (data.type === "company") {
        const companyData: CreateCompanyDto | UpdateCompanyDto = {
          comp_noco: data.name || "",
          comp_raso: data.name || "", // Usar el mismo nombre para razón social
          comp_rnc1: data.code || "000000000", // RNC default o del formulario
          comp_emai: data.metadata?.contact?.email || "",
          comp_stat: data.status === "active",
          pais_iden: countries[0]?.pais_iden || "", // Primer país disponible por defecto
        };

        if (selectedNode?.id) {
          // Actualizar compañía existente
          await updateCompany(selectedNode.id, companyData);
        } else {
          // Crear nueva compañía
          await createCompany(companyData);
        }

        // Recargar lista de compañías
        loadCompanies();

        // Cerrar formulario
        setShowForm(false);

        // Mostrar toast de éxito
        setToast({
          type: "success",
          message: selectedNode
            ? "Cambios guardados exitosamente"
            : "Nueva compañía creada exitosamente",
        });
      } else {
        // Aquí iría la lógica para otros tipos de nodos
        console.log("Submitting other node type:", data);
        // Simulación de éxito para prototipo
        setShowForm(false);
        setToast({
          type: "success",
          message: selectedNode
            ? "Cambios guardados exitosamente"
            : "Nuevo nodo creado exitosamente",
        });
      }
    } catch (error) {
      console.error("Error submitting node:", error);
      setToast({
        type: "error",
        message: "Error al guardar los cambios",
      });
    }
  };

  // Manejar solicitud de eliminación de nodo
  const handleDeleteNode = () => {
    setShowDeleteConfirmation(true);
  };

  // Confirmar eliminación de nodo
  const confirmDeleteNode = async () => {
    if (!selectedNode?.id) return;

    try {
      if (selectedNode.type === "company") {
        await deleteCompany(selectedNode.id);
        loadCompanies();
      } else {
        // Lógica para otros tipos de nodos
        console.log("Deleting other node type:", selectedNode);
      }

      setShowDeleteConfirmation(false);

      // Mostrar toast de éxito
      setToast({
        type: "success",
        message: `${
          selectedNode?.type === "company"
            ? "Compañía"
            : selectedNode?.type === "branch"
            ? "Sucursal"
            : selectedNode?.type === "department"
            ? "Departamento"
            : selectedNode?.type === "section"
            ? "Sección"
            : selectedNode?.type === "unit"
            ? "Unidad"
            : "Nodo"
        } eliminada correctamente`,
      });

      // Volver a null el nodo seleccionado después de eliminarlo
      setSelectedNode(null);
    } catch (error) {
      console.error("Error deleting node:", error);
      setToast({
        type: "error",
        message: "Error al eliminar el nodo",
      });
    }
  };

  // Manejar búsqueda
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Manejar selección de resultado de búsqueda
  const handleSelectSearchResult = (node: OrganizationalNode) => {
    setSelectedNode(node);
  };

  // Renderizar nodos del árbol
  const renderTreeNodes = (nodes: OrganizationalNode[]) => {
    return nodes.map((node) => (
      <OrganizationalTree
        key={node.id}
        node={node}
        onSelect={setSelectedNode}
        selectedNode={selectedNode}
        expandedNodes={expandedNodes}
        onToggleExpand={handleNodeToggle}
        onEdit={handleEditNode}
      />
    ));
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Panel izquierdo - Vista de árbol */}
      <div className="w-1/4 min-w-80 max-w-96 border-r border-gray-200 bg-white flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Estructura</h2>
            <button
              onClick={handleAddNode}
              className="p-1.5 text-gray-400 hover:bg-gray-50 rounded-lg"
              title="Agregar nuevo nodo"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Componente de búsqueda */}
          <SearchComponent
            onSearch={handleSearch}
            searchResults={searchResults}
            onSelectNode={handleSelectSearchResult}
            searchTerm={searchTerm}
          />
        </div>

        {/* Contenedor con scroll para el árbol de organización */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {loadingCompanies ? (
              <div className="text-center py-4 text-gray-500">Cargando...</div>
            ) : organizationalData.root ? (
              <>
                <OrganizationalTree
                  node={organizationalData.root}
                  onSelect={setSelectedNode}
                  selectedNode={selectedNode}
                  expandedNodes={expandedNodes}
                  onToggleExpand={handleNodeToggle}
                  onEdit={handleEditNode}
                />
                {organizationalData.children &&
                  renderTreeNodes(organizationalData.children)}
              </>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No hay datos disponibles
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Panel derecho - Detalles */}
      <div className="flex-1 overflow-auto bg-gray-50">
        {selectedNode ? (
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  {selectedNode.type === "company" && (
                    <Building2 className="w-8 h-8 text-blue-500" />
                  )}
                  {selectedNode.type === "branch" && (
                    <Building className="w-8 h-8 text-green-500" />
                  )}
                  {selectedNode.type === "department" && (
                    <Users className="w-8 h-8 text-purple-500" />
                  )}
                  {selectedNode.type === "section" && (
                    <FolderTree className="w-8 h-8 text-amber-500" />
                  )}
                  {selectedNode.type === "unit" && (
                    <Briefcase className="w-8 h-8 text-blue-500" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {selectedNode.name}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {selectedNode.metadata?.contact?.position}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleEditNode(selectedNode)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={handleDeleteNode}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Eliminar"
                >
                  <Trash className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Información de contacto
                </h3>
                <div className="space-y-4">
                  {selectedNode.metadata?.contact && (
                    <>
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-900">
                            {
                              selectedNode.metadata.contact.physicalLocation
                                .building
                            }
                          </p>
                          <p className="text-sm text-gray-500">
                            {
                              selectedNode.metadata.contact.physicalLocation
                                .floor
                            }
                            ,{" "}
                            {
                              selectedNode.metadata.contact.physicalLocation
                                .office
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {selectedNode.metadata.contact.phone} ext.{" "}
                          {selectedNode.metadata.contact.extension}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {selectedNode.metadata.contact.email}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Estadísticas
                </h3>
                <div className="space-y-4">
                  {selectedNode.metadata?.employeeCount !== undefined && (
                    <div>
                      <p className="text-sm text-gray-500">
                        Total de empleados
                      </p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {selectedNode.metadata.employeeCount}
                      </p>
                    </div>
                  )}
                  {selectedNode.children && (
                    <div>
                      <p className="text-sm text-gray-500">Subniveles</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {selectedNode.children.length}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Detalles
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Tipo</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedNode.type.charAt(0).toUpperCase() +
                        selectedNode.type.slice(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nivel</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedNode.level}
                    </p>
                  </div>
                  {selectedNode.description && (
                    <div>
                      <p className="text-sm text-gray-500">Descripción</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedNode.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {selectedNode.children && selectedNode.children.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">
                    Subniveles
                  </h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {selectedNode.children.map((child) => (
                    <div key={child.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {child.type === "company" && (
                            <Building2 className="w-5 h-5 text-blue-500" />
                          )}
                          {child.type === "branch" && (
                            <Building className="w-5 h-5 text-green-500" />
                          )}
                          {child.type === "department" && (
                            <Users className="w-5 h-5 text-purple-500" />
                          )}
                          {child.type === "section" && (
                            <FolderTree className="w-5 h-5 text-amber-500" />
                          )}
                          {child.type === "unit" && (
                            <Briefcase className="w-5 h-5 text-blue-500" />
                          )}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              {child.name}
                            </h4>
                            {child.metadata?.contact && (
                              <p className="text-sm text-gray-500">
                                {child.metadata.contact.managerFullName}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          {child.metadata?.employeeCount && (
                            <div className="text-sm text-gray-500">
                              {child.metadata.employeeCount} empleados
                            </div>
                          )}
                          <button
                            onClick={() => setSelectedNode(child)}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Selecciona un nodo para ver sus detalles
          </div>
        )}
      </div>

      {/* Formulario Modal */}
      {showForm && (
        <NodeForm
          node={selectedNode}
          parentType={selectedNode?.type}
          onClose={() => {
            setShowForm(false);
          }}
          onSubmit={handleSubmitNode}
          countries={countries}
        />
      )}

      {/* Toast de notificación */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Modal de confirmación para eliminar */}
      {showDeleteConfirmation && selectedNode && (
        <ConfirmationModal
          title={`Eliminar ${
            selectedNode.type === "company"
              ? "Compañía"
              : selectedNode.type === "branch"
              ? "Sucursal"
              : selectedNode.type === "department"
              ? "Departamento"
              : selectedNode.type === "section"
              ? "Sección"
              : selectedNode.type === "unit"
              ? "Unidad"
              : "Nodo"
          }`}
          message={`¿Está seguro que desea eliminar ${
            selectedNode.type === "company"
              ? "la compañía"
              : selectedNode.type === "branch"
              ? "la sucursal"
              : selectedNode.type === "department"
              ? "el departamento"
              : selectedNode.type === "section"
              ? "la sección"
              : selectedNode.type === "unit"
              ? "la unidad"
              : "el nodo"
          } "${selectedNode.name}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          onConfirm={confirmDeleteNode}
          onCancel={() => setShowDeleteConfirmation(false)}
          type="danger"
        />
      )}
    </div>
  );
}
