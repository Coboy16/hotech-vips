import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LoginScreen } from './features/auth/components/LoginScreen';
import { AuthProvider } from './features/auth/contexts/AuthContext';
import { DashboardPage } from './pages/temp/DashboardPage';

// Importar el hook useAuth directamente desde el contexto
import { useAuth } from './features/auth/contexts/AuthContext';

// Página 404
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="bg-white p-8 rounded-lg shadow-md text-center">
      <h1 className="text-4xl font-bold text-red-500 mb-4">404</h1>
      <p className="text-xl mb-4">Página no encontrada</p>
      <a href="/" className="text-blue-500 hover:underline">Volver al inicio</a>
    </div>
  </div>
);

// Ruta protegida simple
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Redirigir la ruta raíz a dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          
          {/* Ruta de login */}
          <Route path="/login" element={<LoginScreen />} />
          
          {/* Ruta del dashboard protegida */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } />
          
          {/* Ruta 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;