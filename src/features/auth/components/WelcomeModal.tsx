import React from "react";
import ModalWelcome from "../../../components/common/modal/ModalWelcome";

interface WelcomeModalProps {
  isOpen: boolean;
  onContinue: () => void;
}

const HOTECH_LOGO_URL = "https://i.postimg.cc/jdTNsfWq/Logo-Ho-Tech-Blanco.png";

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onContinue,
}) => {
  return (
    <ModalWelcome
      isOpen={isOpen}
      onClose={() => {}} // No-op: El modal no se cierra desde aquí
      preventClose={true} // Evita cierre por overlay o Esc
      maxWidth="max-w-md" // Tamaño adecuado para bienvenida
    >
      <div className="text-center p-6">
        {/* Logo */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-6 shadow-lg">
          <img
            src={HOTECH_LOGO_URL}
            alt="Ho-Tech Logo"
            className="w-16 h-auto object-contain" // Ajusta tamaño según sea necesario
          />
        </div>

        {/* Mensaje */}
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          ¡Bienvenido a VIPS Presencia!
        </h2>
        <p className="text-gray-600 mb-8">
          Nos alegra tenerte a bordo. Para garantizar la seguridad de tu cuenta,
          necesitamos que establezcas una nueva contraseña.
        </p>

        {/* Botón Continuar */}
        <button
          onClick={onContinue}
          className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
        >
          Continuar
        </button>
      </div>
    </ModalWelcome>
  );
};
