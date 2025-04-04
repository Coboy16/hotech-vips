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
        <Router>
          <Suspense fallback={<LoadingScreen />}>
            <RouterConfig />
          </Suspense>
          <Toaster position="top-right" />
        </Router>
      </ModulePermissionsProvider>
    </AuthProvider>
  );
}

export default App;
