import { BrowserRouter as Router } from "react-router-dom";
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./features/auth/contexts/AuthContext";
import { ModulePermissionsProvider } from "./features/auth/contexts/ModulePermissionsContext";
import { RouterConfig } from "./routes/RouterConfig";
import { LoadingScreen } from "./components/common/loading/LoadingScreen";

function App() {
  return (
    <AuthProvider>
      <ModulePermissionsProvider>
        {/* Usa BrowserRouter */}
        <Router>
          <Suspense fallback={<LoadingScreen />}>
            {/* Renderiza la configuración de rutas basada en JSX */}
            <RouterConfig />
          </Suspense>
          <Toaster position="top-right" />
        </Router>
      </ModulePermissionsProvider>
    </AuthProvider>
  );
}

export default App;
