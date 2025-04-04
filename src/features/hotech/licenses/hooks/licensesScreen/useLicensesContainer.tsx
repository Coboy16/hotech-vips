import { useState } from "react";
import { toast } from "react-hot-toast";

import { License } from "../../../../../model/license";
import {
  LicenseFormData,
  RenewLicenseFormData,
} from "../../schemas/licenseSchema";
import { UserFormData } from "../../schemas/userSchema";

import { useLicenses } from "./useLicenses";
import { useLicenseActions } from "./useLicenseActions";
import { useModal } from "./useModals";
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
  const licenseHook = useLicenses();
  const licenseActions = useLicenseActions(
    (updatedLicense) => {
      licenseHook.addOrUpdateLicense(updatedLicense);
    },
    (licenseId) => {
      licenseHook.removeLicense(licenseId);
    }
  );

  // ---- Modales ----
  const licenseFormModal = useModal<License>();
  const renewalModal = useModal<License>();
  const deleteModal = useModal<License>();
  // const historyModal = useModal<License>(); // Comentado
  const userFormModal = useModal<License>(); // El 'data' aquí es solo referencia inicial

  // ---- Menú Contextual ----
  const contextMenu = useContextMenu<License>();

  // ---- Hook de Usuarios (ya no necesita apiLicensesData) ----
  const licenseUsers = useLicenseUsers({
    permissionToLabelMap,
  });

  // ---- Estados de Procesamiento ----
  const [isSaving, setIsSaving] = useState(false); // Para LicenseForm

  // ---- Handlers de Acciones Principales (Licencia) ----
  const handleCreateNew = () => {
    licenseFormModal.open(null);
  };

  const handleEdit = async (license: License) => {
    // Usamos setIsLoading del hook de licencias para el feedback visual
    licenseHook.setIsLoading(true);
    const freshLicenseData = await licenseActions.getLicenseById(license.id);
    licenseHook.setIsLoading(false);

    if (freshLicenseData) {
      licenseFormModal.open(freshLicenseData); // Abrir con datos frescos
    } else {
      // Fallback si getLicenseById falla (ya muestra toast)
      toast.error("No se pudieron cargar los datos actualizados para editar.");
      // Opcional: abrir con los datos 'stale' que tenemos?
      // licenseFormModal.open(license);
    }
    contextMenu.closeMenu();
  };

  const handleSaveLicense = async (formData: LicenseFormData) => {
    setIsSaving(true);
    const selectedLicense = licenseFormModal.data; // Licencia que se está editando (o null si es nueva)

    // saveLicense ahora hace el getById internamente para create/update/renew
    const successLicense = await licenseActions.saveLicense(
      formData,
      selectedLicense?.id
    );

    if (successLicense) {
      licenseFormModal.close(); // Cerrar modal solo si tuvo éxito
      // La actualización del estado 'licenses' la maneja el callback de useLicenseActions
    } else {
      // El toast de error ya lo muestra saveLicense/createLicense/updateLicense
      console.error("[useLicensesContainer] Falló el guardado de la licencia.");
    }

    setIsSaving(false);
  };

  const handleOpenRenewModal = (license: License) => {
    renewalModal.open(license);
    contextMenu.closeMenu();
  };

  const handleRenewLicense = async (renewalData: RenewLicenseFormData) => {
    if (!renewalModal.data) return;

    // renewLicense ahora hace getById internamente
    const successLicense = await licenseActions.renewLicense(
      renewalModal.data.id,
      renewalData
    );

    if (successLicense) {
      renewalModal.close();
    }
  };

  const handleOpenDeleteModal = (license: License) => {
    deleteModal.open(license);
    contextMenu.closeMenu();
  };

  const confirmDeleteLicense = async () => {
    if (!deleteModal.data) return;

    // Indicador visual de carga general puede ser útil aquí
    licenseHook.setIsLoading(true);
    const success = await licenseActions.deleteLicense(deleteModal.data.id);
    licenseHook.setIsLoading(false); // Apagar indicador

    if (success) {
      deleteModal.close(); // Cerrar modal si se eliminó
    }
    // El toast de éxito/error lo maneja deleteLicense
  };

  const handleExportLicense = (license: License) => {
    console.log(
      "[useLicensesContainer] Exportar datos de licencia:",
      license.id
    );
    toast("Funcionalidad de exportación no implementada", { icon: "ℹ️" });
    contextMenu.closeMenu();
  };

  // ---- Handlers de Formulario de Usuario ----

  // Abrir formulario de usuario (AHORA ASÍNCRONO)
  const handleOpenUserForm = async (license: License) => {
    console.log(
      `[useLicensesContainer] Solicitando abrir UserForm para licencia: ${license.id}`
    );
    contextMenu.closeMenu(); // Cerrar menú contextual primero

    // Mostrar feedback de carga si es necesario (opcional, puede ser rápido)
    // licenseHook.setIsLoading(true); // O usar licenseUsers.isLoadingLicenseForUser

    // Llama al handler asíncrono en useLicenseUsers
    const canOpen = await licenseUsers.handleOpenUserForm(license);

    // licenseHook.setIsLoading(false); // Apagar feedback

    if (canOpen) {
      // Si handleOpenUserForm tuvo éxito (obtuvo datos frescos), abrir el modal
      console.log(
        `[useLicensesContainer] Datos preparados, abriendo UserForm modal.`
      );
      userFormModal.open(license); // Pasamos la licencia original por si se necesita info básica en el modal
    } else {
      // Si falló (no se pudieron obtener datos frescos), handleOpenUserForm ya mostró toast
      console.error(
        `[useLicensesContainer] No se pudo preparar UserForm para licencia ${license.id}.`
      );
    }
  };

  // Guardar usuario (ya era asíncrono)
  const handleSaveUser = async (formData: UserFormData) => {
    console.log("[useLicensesContainer] Intentando guardar usuario...");
    // Llama al handler en useLicenseUsers
    const success = await licenseUsers.handleSaveUser(formData);
    if (success) {
      console.log(
        "[useLicensesContainer] Guardado de usuario exitoso, cerrando modal."
      );
      userFormModal.close();
      // No necesitamos llamar a handleCloseUserForm aquí si se llama dentro de UserForm en su 'onClose' prop
    } else {
      console.error("[useLicensesContainer] Guardado de usuario falló.");
      // El toast de error ya lo debería mostrar handleSaveUser
    }
  };

  // ---- Hook para columnas de tabla ----
  const { columns } = useLicenseColumns({
    onEdit: handleEdit,
    onRenew: handleOpenRenewModal,
    onDelete: handleOpenDeleteModal,
    onContextMenu: contextMenu.toggleMenu,
    contextMenuLicense: contextMenu.contextItem,
    renderContextMenu: (license) => (
      <LicenseContextMenu
        license={license}
        isOpen={contextMenu.isMenuOpenForItem(license)} // Asegura que solo se muestre para el item correcto
        onClose={contextMenu.closeMenu}
        onEdit={handleEdit}
        onRenew={handleOpenRenewModal}
        onExport={handleExportLicense}
        // onHistory={handleOpenHistoryModal} // Comentado
        onDelete={handleOpenDeleteModal}
        onOpenUserForm={handleOpenUserForm} // Pasar el handler actualizado
      />
    ),
  });

  return {
    // Estados de licencias y filtrado
    ...licenseHook,

    // Estado de acciones CRUD (isProcessing aplica a acciones generales de licencia)
    isProcessing: licenseActions.isProcessing, // Usar el de licenseActions
    processingError: licenseActions.processingError,

    // Columnas
    columns,

    // Modales
    licenseFormModal,
    renewalModal,
    deleteModal,
    // historyModal,
    userFormModal,

    // Menú contextual
    contextMenu,

    // Usuarios (exportar estado de carga específico si se quiere feedback visual)
    licenseUsers: {
      ...licenseUsers,
      selectedLicenseForUserCreation:
        licenseUsers.selectedLicenseForUserCreation,
      modulesForSelectedLicense: licenseUsers.modulesForSelectedLicense,
      isLoadingLicenseForUser: licenseUsers.isLoadingLicenseForUser, // Exportar estado de carga
      isSavingUser: licenseUsers.isSavingUser, // Re-exportar isSavingUser
    },

    // Estado de guardado específico de LicenseForm
    isSaving, // Este es el estado local para el botón de LicenseForm

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
    handleOpenUserForm, // Ya es async
    handleSaveUser,

    // Configuración
    permissionToLabelMap,
  };
}
