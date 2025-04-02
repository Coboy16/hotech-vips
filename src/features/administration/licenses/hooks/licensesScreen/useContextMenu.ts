/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";

/**
 * Hook para gestionar un menú contextual
 *
 * @template T Tipo de datos asociado al menú contextual
 * @returns Objeto con métodos y estado para manejar el menú contextual
 */
export function useContextMenu<T>() {
  const [contextItem, setContextItem] = useState<T | null>(null);

  const openMenu = useCallback((item: T, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    setContextItem(item);
  }, []);

  const closeMenu = useCallback(() => {
    setContextItem(null);
  }, []);

  const toggleMenu = useCallback((item: T, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    setContextItem((prevItem) => {
      // Si es un objeto, comparamos las propiedades 'id' si existen
      if (
        prevItem !== null &&
        item !== null &&
        typeof prevItem === "object" &&
        typeof item === "object" &&
        "id" in prevItem &&
        "id" in item
      ) {
        return (prevItem as any).id === (item as any).id ? null : item;
      }

      // De lo contrario, comparamos directamente
      return prevItem === item ? null : item;
    });
  }, []);

  const isMenuOpenForItem = useCallback(
    (item: T): boolean => {
      if (contextItem === null) return false;

      // Si son objetos, comparamos por id si existe
      if (
        typeof contextItem === "object" &&
        typeof item === "object" &&
        contextItem !== null &&
        item !== null &&
        "id" in contextItem &&
        "id" in item
      ) {
        return (contextItem as any).id === (item as any).id;
      }

      // De lo contrario, comparamos directamente
      return contextItem === item;
    },
    [contextItem]
  );

  return {
    contextItem,
    openMenu,
    closeMenu,
    toggleMenu,
    isMenuOpenForItem,
  };
}
