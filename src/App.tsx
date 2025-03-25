// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, LoginScreen } from './features/auth';
import { PrivateRoute, PublicRoute } from './routes';

// Componente Dashboard (placeholder)
const Dashboard = () => (
  <div className="min-h-screen bg-gray-100 p-8">
    <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
    <p>Bienvenido al sistema</p>
  </div>
);

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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta raíz redirige según autenticación */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Rutas públicas */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginScreen onLogin={() => {}} />} />
          </Route>
          
          {/* Rutas privadas */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Añade más rutas privadas aquí */}
          </Route>
          
          {/* Ruta para 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;