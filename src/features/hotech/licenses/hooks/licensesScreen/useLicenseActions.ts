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
    async (formData: LicenseFormData): Promise<License | null> => {
      setIsProcessing(true);
      setProcessingError(null);
      let createdLicenseId: string | null = null;

      try {
        const createDto = licenseFormDataToApiCreateDto(formData);
        console.log(
          "[useLicenseActions] Llamando a licenseService.create con DTO:",
          createDto
        );
        const creationResult = await licenseService.create(createDto);

        if (creationResult && creationResult.license_id) {
          createdLicenseId = creationResult.license_id;
          console.log(
            `[useLicenseActions] Licencia creada (respuesta inicial) ID: ${createdLicenseId}. Respuesta API:`,
            creationResult
          );

          console.log(
            `[useLicenseActions] Obteniendo datos completos para la nueva licencia ID: ${createdLicenseId} con getById...`
          );
          const fullLicenseData = await licenseService.getById(
            createdLicenseId
          );

          if (fullLicenseData) {
            console.log(
              `[useLicenseActions] Datos completos obtenidos para ${createdLicenseId} vía getById. Datos:`,
              fullLicenseData
            );
            const newLicense = apiToUiLicense(fullLicenseData); // Convertir usando los datos completos
            console.log(
              `[useLicenseActions] Licencia convertida a formato UI:`,
              newLicense
            );
            toast.success("Licencia creada correctamente");
            if (onLicenseUpdated) {
              console.log(
                "[useLicenseActions] Llamando onLicenseUpdated (create) con datos completos:",
                newLicense
              );
              onLicenseUpdated(newLicense); // Actualizar UI con datos completos
            }
            return newLicense;
          } else {
            console.error(
              `[useLicenseActions] Error: No se pudieron obtener los datos completos para la licencia ${createdLicenseId} después de crearla.`
            );
            toast.error(
              "Licencia creada, pero hubo un problema al cargar sus detalles completos."
            );
            setProcessingError(
              "Error al cargar detalles completos de la nueva licencia."
            );
            return null;
          }
        } else {
          console.error(
            "[useLicenseActions] La creación de la licencia falló en el servicio (create). Respuesta:",
            creationResult
          );
          // No es necesario mostrar otro toast aquí si licenseService ya lo hizo.
          return null;
        }
      } catch (error) {
        console.error(
          "[useLicenseActions] Error inesperado durante createLicense:",
          error
        );
        const errorMessage =
          "Ocurrió un error inesperado al procesar la nueva licencia.";
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
    async (
      licenseId: string,
      formData: LicenseFormData
    ): Promise<License | null> => {
      setIsProcessing(true);
      setProcessingError(null);

      try {
        const updateDto = licenseFormDataToApiUpdateDto(formData);
        console.log(
          `[useLicenseActions] Llamando a licenseService.update para ID: ${licenseId} con DTO:`,
          updateDto
        );
        // --- Paso 1: Actualizar la licencia ---
        const updateResult = await licenseService.update(licenseId, updateDto);

        if (updateResult) {
          // Aunque la actualización fue exitosa, la respuesta 'updateResult' podría no tener los detalles completos.
          console.log(
            `[useLicenseActions] Licencia ${licenseId} actualizada (respuesta inicial). Respuesta API:`,
            updateResult
          );

          // --- Paso 2: Obtener los datos completos actualizados ---
          console.log(
            `[useLicenseActions] Obteniendo datos completos actualizados para ${licenseId} con getById...`
          );
          const fullLicenseData = await licenseService.getById(licenseId);

          if (fullLicenseData) {
            console.log(
              `[useLicenseActions] Datos completos actualizados obtenidos para ${licenseId} vía getById. Datos:`,
              fullLicenseData
            );
            const updatedLicense = apiToUiLicense(fullLicenseData); // Convertir usando los datos completos
            console.log(
              `[useLicenseActions] Licencia actualizada convertida a formato UI:`,
              updatedLicense
            );
            toast.success("Licencia actualizada correctamente");
            if (onLicenseUpdated) {
              console.log(
                "[useLicenseActions] Llamando onLicenseUpdated (update) con datos completos:",
                updatedLicense
              );
              onLicenseUpdated(updatedLicense); // Actualizar UI con datos completos
            }
            return updatedLicense;
          } else {
            // Error al obtener los datos completos después de la actualización exitosa.
            console.error(
              `[useLicenseActions] Error: No se pudieron obtener los datos completos para la licencia ${licenseId} después de actualizarla.`
            );
            toast.error(
              "Licencia actualizada, pero hubo un problema al recargar sus detalles."
            );
            setProcessingError(
              "Error al recargar detalles de la licencia actualizada."
            );
            // Podríamos intentar usar los datos parciales de 'updateResult' como fallback
            // const partialLicense = apiToUiLicense(updateResult);
            // if (onLicenseUpdated) onLicenseUpdated(partialLicense);
            // return partialLicense;
            return null;
          }
        } else {
          // El servicio 'update' ya mostró el error o devolvió null
          console.error(
            `[useLicenseActions] La actualización de la licencia ${licenseId} falló en el servicio (update). Respuesta:`,
            updateResult
          );
          return null;
        }
      } catch (error) {
        console.error(
          `[useLicenseActions] Error inesperado durante updateLicense para ID ${licenseId}:`,
          error
        );
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
    async (
      licenseId: string,
      renewalData: RenewLicenseFormData
    ): Promise<License | null> => {
      setIsProcessing(true);
      setProcessingError(null);

      try {
        const renewDto = renewalFormDataToApiDto(renewalData);
        console.log(
          `[useLicenseActions] Llamando a licenseService.renew para ID: ${licenseId} con DTO:`,
          renewDto
        );
        // --- Paso 1: Renovar la licencia ---
        const renewalResult = await licenseService.renew(licenseId, renewDto);

        if (renewalResult) {
          console.log(
            `[useLicenseActions] Licencia ${licenseId} renovada (respuesta inicial). Respuesta API:`,
            renewalResult
          );

          // --- Paso 2: Obtener los datos completos actualizados (incluida la nueva fecha/estado) ---
          console.log(
            `[useLicenseActions] Obteniendo datos completos renovados para ${licenseId} con getById...`
          );
          const fullLicenseData = await licenseService.getById(licenseId);

          if (fullLicenseData) {
            console.log(
              `[useLicenseActions] Datos completos renovados obtenidos para ${licenseId} vía getById. Datos:`,
              fullLicenseData
            );
            const renewedLicense = apiToUiLicense(fullLicenseData); // Convertir usando los datos completos
            console.log(
              `[useLicenseActions] Licencia renovada convertida a formato UI:`,
              renewedLicense
            );
            toast.success("Licencia renovada correctamente");
            if (onLicenseUpdated) {
              console.log(
                "[useLicenseActions] Llamando onLicenseUpdated (renew) con datos completos:",
                renewedLicense
              );
              onLicenseUpdated(renewedLicense); // Actualizar UI con datos completos
            }
            return renewedLicense;
          } else {
            console.error(
              `[useLicenseActions] Error: No se pudieron obtener los datos completos para la licencia ${licenseId} después de renovarla.`
            );
            toast.error(
              "Licencia renovada, pero hubo un problema al recargar sus detalles."
            );
            setProcessingError(
              "Error al recargar detalles de la licencia renovada."
            );
            return null;
          }
        } else {
          // El servicio 'renew' ya mostró el error o devolvió null
          console.error(
            `[useLicenseActions] La renovación de la licencia ${licenseId} falló en el servicio (renew). Respuesta:`,
            renewalResult
          );
          return null;
        }
      } catch (error) {
        console.error(
          `[useLicenseActions] Error inesperado durante renewLicense para ID ${licenseId}:`,
          error
        );
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
    async (licenseId: string): Promise<boolean> => {
      setIsProcessing(true);
      setProcessingError(null);
      console.log(
        `[useLicenseActions] Iniciando eliminación para ID: ${licenseId}`
      );
      try {
        const success = await licenseService.delete(licenseId);

        if (success) {
          console.log(
            `[useLicenseActions] Eliminación exitosa para ${licenseId} en el servicio.`
          );
          toast.success("Licencia eliminada correctamente");
          if (onLicenseDeleted) onLicenseDeleted(licenseId);
          return true;
        } else {
          console.error(
            `[useLicenseActions] La eliminación de la licencia ${licenseId} falló en el servicio.`
          );
          // El servicio ya mostró el error
          return false;
        }
      } catch (error) {
        console.error(
          `[useLicenseActions] Error inesperado durante deleteLicense para ID ${licenseId}:`,
          error
        );
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
      console.log(
        `[useLicenseActions] Llamando getLicenseById para ID: ${licenseId}`
      );
      // No gestionamos isProcessing/Error aquí, lo hace el llamador si es necesario (p.ej. handleEdit)
      try {
        const apiLicense = await licenseService.getById(licenseId);

        if (apiLicense) {
          console.log(
            `[useLicenseActions] getLicenseById encontró datos para ${licenseId}.`,
            apiLicense
          );
          return apiToUiLicense(apiLicense);
        } else {
          console.warn(
            `[useLicenseActions] getLicenseById no encontró datos para ${licenseId} o el servicio falló.`
          );
          // El servicio ya manejó el error o no la encontró
          return null;
        }
      } catch (error) {
        console.error(
          `[useLicenseActions] Error inesperado durante getLicenseById para ID ${licenseId}:`,
          error
        );
        const errorMessage =
          "Ocurrió un error inesperado al obtener la licencia.";
        toast.error(errorMessage);
        // Podríamos guardar el error aquí si fuera necesario
        // setProcessingError(errorMessage);
        return null;
      }
    },
    [] // Sin dependencias
  );

  // Función combinada para guardar (crear o actualizar)
  const saveLicense = useCallback(
    async (
      formData: LicenseFormData,
      licenseId?: string
    ): Promise<License | null> => {
      console.log(
        `[useLicenseActions] saveLicense llamado. ID: ${
          licenseId ? licenseId : "Nuevo"
        }, Data:`,
        formData
      );
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
