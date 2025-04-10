// FILE: src/App.tsx
import { BrowserRouter as Router } from "react-router-dom";
import { Suspense, useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";

import { AuthProvider, useAuth } from "./features/auth/contexts/AuthContext";
import { ModulePermissionsProvider } from "./features/auth/contexts/ModulePermissionsContext";
import { RouterConfig } from "./routes/RouterConfig";
import { LoadingScreen } from "./components/common/loading/LoadingScreen";
import { WelcomeModal } from "./features/auth/components/WelcomeModal";
import { MandatoryPasswordChangeModal } from "./features/auth/components/MandatoryPasswordChangeModal";

// Componente interno para manejar la lógica de los modales
function AppContent() {
  const {
    isAuthenticated,
    needsPasswordChange,
    markPasswordAsChanged,
    isLoading,
  } = useAuth();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Efecto para controlar la aparición de los modales
  useEffect(() => {
    let welcomeTimer: NodeJS.Timeout | null = null;

    if (isAuthenticated && needsPasswordChange) {
      // Condición para INICIAR el flujo: Si está autenticado, necesita cambio,
      // Y NINGUNO de los modales obligatorios está ya visible.
      if (!showWelcomeModal && !showPasswordModal) {
        console.log(
          "[AppContent] Necesita cambio y ningún modal activo. Programando bienvenida..."
        );
        // Mostrar modal de bienvenida después de 3 segundos
        welcomeTimer = setTimeout(() => {
          // Volver a verificar dentro del timeout por si el estado cambió mientras esperaba
          if (isAuthenticated && needsPasswordChange) {
            console.log(
              "[AppContent] Timeout finalizado. Mostrando modal de bienvenida."
            );
            setShowWelcomeModal(true);
          }
        }, 500); // 3 segundos de delay
      } else {
        console.log(
          "[AppContent] Necesita cambio, pero un modal ya está activo. No hacer nada."
        );
        // Si ya se está mostrando welcome o password, no reiniciamos el timer.
      }
    } else {
      // Condición para DETENER/OCULTAR el flujo: Si ya no está autenticado
      // O si ya no necesita el cambio de contraseña.
      if (showWelcomeModal || showPasswordModal) {
        console.log(
          "[AppContent] No autenticado o contraseña ya cambiada. Asegurando que los modales estén ocultos."
        );
        setShowWelcomeModal(false);
        setShowPasswordModal(false);
      }
    }

    // Función de limpieza para el temporizador
    return () => {
      if (welcomeTimer) {
        console.log("[AppContent] Limpiando temporizador de bienvenida.");
        clearTimeout(welcomeTimer);
      }
    };
    // Dependencias clave: estado de autenticación y necesidad de cambio.
    // También incluimos los estados de los modales para reaccionar si se cierran
    // o para evitar reiniciar el timer si ya están abiertos.
  }, [
    isAuthenticated,
    needsPasswordChange,
    showWelcomeModal,
    showPasswordModal,
  ]);

  // Handler para el botón "Continuar" del WelcomeModal
  const handleContinueFromWelcome = () => {
    console.log(
      "[AppContent] Continuar desde bienvenida. Ocultando bienvenida, mostrando cambio de contraseña."
    );
    setShowWelcomeModal(false);
    setShowPasswordModal(true); // <<-- Esto dispara el useEffect, pero la lógica interna ahora lo maneja bien
  };

  // Handler para cuando la contraseña se cambia exitosamente
  const handlePasswordChangeSuccess = () => {
    console.log(
      "[AppContent] Contraseña cambiada exitosamente (callback recibido). Marcando cambio y ocultando modal."
    );
    markPasswordAsChanged(); // Actualiza el estado en AuthContext
    setShowPasswordModal(false); // Cierra el modal
  };

  // Mostrar LoadingScreen mientras AuthProvider está cargando inicialmente
  if (isLoading) {
    console.log(
      "[AppContent] AuthProvider está cargando, mostrando LoadingScreen."
    );
    return <LoadingScreen />;
  }

  console.log(
    "[AppContent] Renderizando. isAuthenticated:",
    isAuthenticated,
    "needsPasswordChange:",
    needsPasswordChange,
    "showWelcome:",
    showWelcomeModal,
    "showPassword:",
    showPasswordModal
  );

  return (
    <>
      <Suspense fallback={<LoadingScreen />}>
        {/* Renderiza las rutas principales SOLO si:
            1. El usuario NO está autenticado (mostrará LoginScreen via RouterConfig)
            2. O SI está autenticado Y NO necesita cambiar contraseña */}
        {!isAuthenticated || (isAuthenticated && !needsPasswordChange) ? (
          <RouterConfig />
        ) : (
          // Mientras esté autenticado Y necesite cambiar contraseña,
          // muestra un fondo simple en lugar de las rutas principales.
          // Los modales se superpondrán a esto.
          <div className="w-screen h-screen bg-gradient-to-b from-blue-500 to-blue-700"></div>
        )}
      </Suspense>

      {/* Renderizar Modales (se mostrarán sobre el fondo azul o sobre RouterConfig si aplica) */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onContinue={handleContinueFromWelcome}
      />
      <MandatoryPasswordChangeModal
        isOpen={showPasswordModal}
        onPasswordChangeSuccess={handlePasswordChangeSuccess}
      />
    </>
  );
}

// Componente principal App
function App() {
  return (
    <AuthProvider>
      <ModulePermissionsProvider>
        <Router>
          <AppContent />
          <Toaster position="top-right" />
        </Router>
      </ModulePermissionsProvider>
    </AuthProvider>
  );
}

export default App;
