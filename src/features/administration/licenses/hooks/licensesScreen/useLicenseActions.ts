import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";

import { licenseService } from "../../services/licenseService";
import {
  apiToUiLicense,
  licenseFormDataToApiCreateDto,
  licenseFormDataToApiUpdateDto,
  renewalFormDataToApiDto,
} from "../../utils/adapters";
import {
  LicenseFormData,
  RenewLicenseFormData,
} from "../../schemas/licenseSchema";
import { License } from "../../../../../model";

export function useLicenseActions(
  onLicenseUpdated?: (license: License) => void,
  onLicenseDeleted?: (licenseId: string) => void
) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  // Crear una nueva licencia
  const createLicense = useCallback(
    async (formData: LicenseFormData) => {
      setIsProcessing(true);
      setProcessingError(null);

      try {
        const createDto = licenseFormDataToApiCreateDto(formData);
        const result = await licenseService.create(createDto);

        if (result) {
          const newLicense = apiToUiLicense(result);
          toast.success("Licencia creada correctamente");
          if (onLicenseUpdated) onLicenseUpdated(newLicense);
          return newLicense;
        } else {
          // El servicio ya mostró el error
          return null;
        }
      } catch (error) {
        console.error("Error al crear licencia:", error);
        const errorMessage =
          "Ocurrió un error inesperado al crear la licencia.";
        toast.error(errorMessage);
        setProcessingError(errorMessage);
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [onLicenseUpdated]
  );

  // Actualizar una licencia existente
  const updateLicense = useCallback(
    async (licenseId: string, formData: LicenseFormData) => {
      setIsProcessing(true);
      setProcessingError(null);

      try {
        const updateDto = licenseFormDataToApiUpdateDto(formData);
        const result = await licenseService.update(licenseId, updateDto);

        if (result) {
          const updatedLicense = apiToUiLicense(result);
          toast.success("Licencia actualizada correctamente");
          if (onLicenseUpdated) onLicenseUpdated(updatedLicense);
          return updatedLicense;
        } else {
          // El servicio ya mostró el error
          return null;
        }
      } catch (error) {
        console.error("Error al actualizar licencia:", error);
        const errorMessage =
          "Ocurrió un error inesperado al actualizar la licencia.";
        toast.error(errorMessage);
        setProcessingError(errorMessage);
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [onLicenseUpdated]
  );

  // Renovar una licencia
  const renewLicense = useCallback(
    async (licenseId: string, renewalData: RenewLicenseFormData) => {
      setIsProcessing(true);
      setProcessingError(null);

      try {
        const renewDto = renewalFormDataToApiDto(renewalData);
        const result = await licenseService.renew(licenseId, renewDto);

        if (result) {
          const renewedLicense = apiToUiLicense(result);
          toast.success("Licencia renovada correctamente");
          if (onLicenseUpdated) onLicenseUpdated(renewedLicense);
          return renewedLicense;
        } else {
          // El servicio ya mostró el error
          return null;
        }
      } catch (error) {
        console.error("Error al renovar licencia:", error);
        const errorMessage =
          "Ocurrió un error inesperado al renovar la licencia.";
        toast.error(errorMessage);
        setProcessingError(errorMessage);
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [onLicenseUpdated]
  );

  // Eliminar una licencia
  const deleteLicense = useCallback(
    async (licenseId: string) => {
      setIsProcessing(true);
      setProcessingError(null);

      try {
        const success = await licenseService.delete(licenseId);

        if (success) {
          toast.success("Licencia eliminada correctamente");
          if (onLicenseDeleted) onLicenseDeleted(licenseId);
          return true;
        } else {
          // El servicio ya mostró el error
          return false;
        }
      } catch (error) {
        console.error("Error al eliminar licencia:", error);
        const errorMessage =
          "Ocurrió un error inesperado al eliminar la licencia.";
        toast.error(errorMessage);
        setProcessingError(errorMessage);
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [onLicenseDeleted]
  );

  // Obtener una licencia por ID (para edición o detalles)
  const getLicenseById = useCallback(
    async (licenseId: string): Promise<License | null> => {
      setIsProcessing(true);
      setProcessingError(null);

      try {
        const apiLicense = await licenseService.getById(licenseId);

        if (apiLicense) {
          return apiToUiLicense(apiLicense);
        } else {
          toast.error("No se pudo cargar la información de la licencia.");
          return null;
        }
      } catch (error) {
        console.error("Error al obtener licencia:", error);
        const errorMessage =
          "Ocurrió un error inesperado al obtener la licencia.";
        toast.error(errorMessage);
        setProcessingError(errorMessage);
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  // Función combinada para guardar (crear o actualizar)
  const saveLicense = useCallback(
    async (formData: LicenseFormData, licenseId?: string) => {
      if (licenseId) {
        return updateLicense(licenseId, formData);
      } else {
        return createLicense(formData);
      }
    },
    [createLicense, updateLicense]
  );

  return {
    isProcessing,
    processingError,
    createLicense,
    updateLicense,
    renewLicense,
    deleteLicense,
    getLicenseById,
    saveLicense,
  };
}
