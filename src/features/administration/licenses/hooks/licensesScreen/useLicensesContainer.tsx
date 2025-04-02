import { useState } from "react";
import { toast } from "react-hot-toast";
import React from "react";

import { License } from "../../../../../model/license";
import {
  LicenseFormData,
  RenewLicenseFormData,
} from "../../schemas/licenseSchema";
import { UserFormData } from "../../schemas/userSchema";

import { useLicenses } from "./useLicenses";
import { useLicenseActions } from "./useLicenseActions";
import { useModal } from "./useModals"; // Corregido el import
import { useLicenseUsers } from "./useLicenseUsers";
import { useContextMenu } from "./useContextMenu";
import { useLicenseColumns } from "./useLicenseColumns";
import LicenseContextMenu from "../../components/LincensesComponets/LicenseContextMenu";

// Mapa de permisos a etiquetas
const permissionToLabelMap: Record<string, string> = {
  panel_monitoreo: "Panel de Monitoreo",
  empleados: "Empleados",
  gestion_empleados: "Gestión de Empleados",
  control_tiempo: "Control de Tiempo",
  planificador_horarios: "Planificador de horarios",
  gestion_incidencias: "Gestión de Incidencias",
  calendario: "Calendario",
  control_acceso: "Control de Acceso",
  visitantes: "Visitantes",
  permisos_acceso: "Permisos de Acceso",
  comedor: "Comedor",
  reportes: "Reportes",
  reportes_mas_usados: "Reportes más usados",
};

/**
 * Hook principal que integra todos los hooks necesarios para el componente LicensesScreen
 */
export function useLicensesContainer() {
  // ---- Hooks básicos ----
  // Hook para la gestión y filtrado de licencias
  const licenseHook = useLicenses();

  // Hook para acciones CRUD de licencias
  const licenseActions = useLicenseActions(
    // Callback cuando una licencia es actualizada
    (updatedLicense) => {
      licenseHook.addOrUpdateLicense(updatedLicense);
    },
    // Callback cuando una licencia es eliminada
    (licenseId) => {
      licenseHook.removeLicense(licenseId);
    }
  );

  // ---- Estados para modales ----
  // Modal de formulario de licencia
  const licenseFormModal = useModal<License>();

  // Modal de renovación
  const renewalModal = useModal<License>();

  // Modal de eliminación
  const deleteModal = useModal<License>();

  // Modal de historial (comentado como en el código original)
  // const historyModal = useModal<License>();

  // Modal de formulario de usuario
  const userFormModal = useModal<License>();

  // ---- Hook para menú contextual ----
  const contextMenu = useContextMenu<License>();

  // ---- Hook para usuarios de licencias ----
  const licenseUsers = useLicenseUsers({
    apiLicensesData: licenseHook.apiLicensesData,
    permissionToLabelMap,
  });

  // ---- Estados de procesamiento ----
  const [isSaving, setIsSaving] = useState(false);

  // ---- Handlers de acciones principales ----

  // Crear nueva licencia
  const handleCreateNew = () => {
    licenseFormModal.open(null);
  };

  // Editar licencia existente
  const handleEdit = async (license: License) => {
    licenseHook.setIsLoading(true);
    const freshLicense = await licenseActions.getLicenseById(license.id);
    licenseHook.setIsLoading(false);

    if (freshLicense) {
      licenseFormModal.open(freshLicense);
    } else {
      // Si falla la recarga, usar la licencia existente
      licenseFormModal.open(license);
    }

    contextMenu.closeMenu();
  };

  // Guardar licencia (crear o actualizar)
  const handleSaveLicense = async (formData: LicenseFormData) => {
    setIsSaving(true);
    const selectedLicense = licenseFormModal.data;

    let success: License | null;
    if (selectedLicense) {
      // Actualización
      success = await licenseActions.updateLicense(
        selectedLicense.id,
        formData
      );
    } else {
      // Creación
      success = await licenseActions.createLicense(formData);
    }

    if (success) {
      licenseFormModal.close();
    }

    setIsSaving(false);
  };

  // Abrir modal de renovación
  const handleOpenRenewModal = (license: License) => {
    renewalModal.open(license);
    contextMenu.closeMenu();
  };

  // Renovar licencia
  const handleRenewLicense = async (renewalData: RenewLicenseFormData) => {
    if (!renewalModal.data) return;

    const success = await licenseActions.renewLicense(
      renewalModal.data.id,
      renewalData
    );

    if (success) {
      renewalModal.close();
    }
  };

  // Abrir modal de eliminación
  const handleOpenDeleteModal = (license: License) => {
    deleteModal.open(license);
    contextMenu.closeMenu();
  };

  // Confirmar eliminación
  const confirmDeleteLicense = async () => {
    if (!deleteModal.data) return;

    licenseHook.setIsLoading(true);
    const success = await licenseActions.deleteLicense(deleteModal.data.id);
    licenseHook.setIsLoading(false);

    if (success) {
      deleteModal.close();
    }
  };

  // Exportar licencia
  const handleExportLicense = (license: License) => {
    console.log("Exportar datos de licencia:", license.id);
    toast("Funcionalidad de exportación no implementada", { icon: "ℹ️" });
    contextMenu.closeMenu();
  };

  // ---- Handlers de formulario de usuario ----

  // Abrir formulario de usuario
  const handleOpenUserForm = (license: License) => {
    const success = licenseUsers.handleOpenUserForm(license);
    if (success) {
      userFormModal.open(license);
    }
    contextMenu.closeMenu();
  };

  // Guardar usuario
  const handleSaveUser = async (formData: UserFormData) => {
    const success = await licenseUsers.handleSaveUser(formData);
    if (success) {
      userFormModal.close();
      licenseUsers.handleCloseUserForm();
    }
  };

  // ---- Hook para columnas de tabla ----

  // Definir las columnas para la tabla usando las funciones de este hook
  const { columns } = useLicenseColumns({
    onEdit: handleEdit,
    onRenew: handleOpenRenewModal,
    onDelete: handleOpenDeleteModal,
    onContextMenu: contextMenu.toggleMenu,
    contextMenuLicense: contextMenu.contextItem,
    renderContextMenu: (license) => (
      <LicenseContextMenu
        license={license}
        isOpen={true}
        onClose={contextMenu.closeMenu}
        onEdit={handleEdit}
        onRenew={handleOpenRenewModal}
        onExport={handleExportLicense}
        // onHistory={handleOpenHistoryModal}
        onDelete={handleOpenDeleteModal}
        onOpenUserForm={handleOpenUserForm}
      />
    ),
  });

  return {
    // Estados de licencias y filtrado
    ...licenseHook,

    // Estado de acciones CRUD
    ...licenseActions,

    // Columnas
    columns,

    // Estado de modales
    licenseFormModal,
    renewalModal,
    deleteModal,
    // historyModal,
    userFormModal,

    // Estado de menú contextual
    contextMenu,

    // Estado de usuarios
    licenseUsers: {
      ...licenseUsers,
      selectedLicenseForUserCreation:
        licenseUsers.selectedLicenseForUserCreation,
      modulesForSelectedLicense: licenseUsers.modulesForSelectedLicense,
    },

    // Estados de procesamiento
    isSaving,

    // Handlers principales
    handleCreateNew,
    handleEdit,
    handleSaveLicense,
    handleOpenRenewModal,
    handleRenewLicense,
    handleOpenDeleteModal,
    confirmDeleteLicense,
    handleExportLicense,

    // Handlers de usuario
    handleOpenUserForm,
    handleSaveUser,

    // Configuración
    permissionToLabelMap,
  };
}
