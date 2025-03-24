import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LoginScreen } from './features/auth/components/LoginScreen';
import { AuthProvider } from './features/auth/contexts/AuthContext';
import { DashboardPage } from './pages/temp/DashboardPage';
import { PrivateRoute } from './routes/PrivateRoute';

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

// Componente principal de la aplicación
function AppContent() {
  // Log al montar el componente
  return (
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
      <Toaster position="top-right" />
    </Router>
  );
}

function App() {
  console.log('[App] Renderizando App');
  
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;