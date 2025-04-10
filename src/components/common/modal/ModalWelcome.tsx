import React, { useEffect, Fragment } from "react";
import ReactDOM from "react-dom";
import { Transition } from "@headlessui/react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?:
    | "max-w-sm"
    | "max-w-md"
    | "max-w-lg"
    | "max-w-xl"
    | "max-w-2xl"
    | "max-w-3xl"
    | "max-w-4xl"
    | "max-w-5xl"
    | "max-w-6xl"
    | "max-w-7xl"
    | "max-w-full";
  hideCloseButton?: boolean;
  preventClose?: boolean; // <<<--- NUEVA PROP
  icon?: React.ReactNode;
}

const portalRoot = typeof document !== "undefined" ? document.body : null;

const ModalWelcome: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
  hideCloseButton = false,
  preventClose = false, // <<<--- Valor por defecto
  icon = null,
}) => {
  // Efecto para cerrar con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Solo cierra si preventClose es false
      if (!preventClose && event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
    // Incluir preventClose en las dependencias
  }, [isOpen, onClose, preventClose]);

  if (!portalRoot || !isOpen) {
    return null;
  }

  // Función para manejar clic en el overlay
  const handleOverlayClick = () => {
    // Solo cierra si preventClose es false
    if (!preventClose) {
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <Transition show={isOpen} as={Fragment}>
      <div
        className="relative z-50"
        aria-labelledby={title ? "modal-title" : undefined}
        role="dialog"
        aria-modal="true"
      >
        {/* Overlay con efecto de blur */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75 backdrop-blur-sm transition-opacity"
            onClick={handleOverlayClick} // <<<--- Usar handler
            aria-hidden="true"
          />
        </Transition.Child>

        {/* Contenido del Modal */}
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div
                className={`relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full ${maxWidth}`}
                // Evitar que el clic dentro del contenido cierre el modal
                onClick={(e) => e.stopPropagation()}
              >
                {/* Cabecera con título e icono */}
                {(title || (!hideCloseButton && !preventClose)) && ( // Ocultar botón X si preventClose es true
                  <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center">
                      {icon && <div className="mr-3 text-blue-500">{icon}</div>}
                      {title && (
                        <h3
                          className="text-lg font-semibold leading-6 text-gray-900"
                          id="modal-title"
                        >
                          {title}
                        </h3>
                      )}
                    </div>
                    {/* Solo mostrar botón X si no se previene el cierre Y no está oculto explícitamente */}
                    {!hideCloseButton && !preventClose && (
                      <button
                        type="button"
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        onClick={onClose}
                        aria-label="Cerrar modal"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                )}

                {/* Contenido principal del modal */}
                <div
                  // Ajustar padding si no hay cabecera visible
                  className={
                    !title && (hideCloseButton || preventClose)
                      ? "p-6"
                      : "px-6 py-5"
                  }
                >
                  {children}
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </div>
    </Transition>,
    portalRoot
  );
};

export default ModalWelcome;
