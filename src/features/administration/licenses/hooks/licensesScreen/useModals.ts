/* eslint-disable react-hooks/rules-of-hooks */
import { useState, useCallback } from "react";

/**
 * Hook genérico para manejar el estado de los modales
 *
 * @template T Tipo de dato asociado al modal (opcional)
 * @returns Objeto con estado y funciones para manejar el modal
 */
export function useModal<T = undefined>() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const open = useCallback((modalData?: T | null) => {
    if (modalData !== undefined) {
      setData(modalData);
    }
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Opcional: Limpiamos los datos después de un pequeño delay
    // para evitar que se vea el cambio antes de que se cierre el modal
    setTimeout(() => setData(null), 300);
  }, []);

  return {
    isOpen,
    data,
    open,
    close,
  };
}

// Tipo de retorno del useModal para usarlo en useModals
type ModalState<T> = {
  isOpen: boolean;
  data: T | null;
  open: (modalData?: T | null) => void;
  close: () => void;
};

/**
 * Hook para manejar múltiples modales
 * Esta implementación no usa reduce para evitar llamar hooks dentro de callbacks
 *
 * @param modalNames Array con los nombres de los modales a manejar
 * @returns Objeto con los estados y funciones para cada modal
 */
export function useModals<T = undefined>(modalNames: string[]) {
  // Creamos un objeto vacío para guardar los resultados
  const result: Record<string, ModalState<T>> = {};

  // Para cada nombre de modal, creamos un estado individual
  // Esta es la forma correcta de hacerlo, no usando reduce
  modalNames.forEach(() => {
    // Esto NO funciona: const { isOpen, data, open, close } = useModal<T>();
    // Los hooks no se pueden llamar dentro de loops, condiciones o callbacks
  });

  // En su lugar, definimos cada modal explícitamente
  if (modalNames.includes("form")) {
    const formModal = useModal<T>();
    result.form = formModal;
  }

  if (modalNames.includes("renewal")) {
    const renewalModal = useModal<T>();
    result.renewal = renewalModal;
  }

  if (modalNames.includes("delete")) {
    const deleteModal = useModal<T>();
    result.delete = deleteModal;
  }

  if (modalNames.includes("history")) {
    const historyModal = useModal<T>();
    result.history = historyModal;
  }

  if (modalNames.includes("user")) {
    const userModal = useModal<T>();
    result.user = userModal;
  }

  // Función para cerrar todos los modales
  const closeAll = useCallback(() => {
    Object.values(result).forEach((modal) => modal.close());
  }, [result]);

  return {
    ...result,
    closeAll,
  };
}

/**
 * Nota: Para casos con muchos modales, considera usar un enfoque más escalable:
 * - Crear un contexto para manejar los modales
 * - Usar una librería de modales como react-modal
 * - Implementar un sistema de modales basado en reducer
 */
