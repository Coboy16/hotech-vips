import React, { useState } from 'react';
import { Lock, User, } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { LoginScreenProps } from '../types/auth';
import { useAuth } from '../hooks/useAuth';
import { RecoveryModal } from './RecoveryModal';
import { useNavigate } from 'react-router-dom';

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const navigate = useNavigate(); 
  // Estados para el formulario
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    showPassword: false
  });
  
  // Estado para el modal de recuperación
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  
  // Usar el hook de autenticación
  const { login, isLoading, error } = useAuth();
  
  // Manejador del envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await login({
      username: formData.username,
      password: formData.password
    });
    
    if (result.success) {
      toast.success('Inicio de sesión exitoso');
      // Usando onLogin si está disponible, o navigate si no
      if (onLogin) {
        onLogin();
      } else {
        navigate('/dashboard');
      }
    }
  };

  // Actualizar datos del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Alternar visibilidad de la contraseña
  const togglePasswordVisibility = () => {
    setFormData(prev => ({ ...prev, showPassword: !prev.showPassword }));
  };

  return (
    <div className="relative w-screen h-screen flex items-center bg-gradient-to-b from-blue-500 to-blue-700">
      {/* Background con patrón de ondas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1440 800">
          <defs>
            <style>
              {`
                .wave {
                  position: absolute;
                  left: 0;
                  width: 200%;
                  height: 100%;
                  transform-origin: 0% 50%;
                }
                .wave-1 { fill: #3B82F6; opacity: 0.3; animation: wave 25s linear infinite; }
                .wave-2 { fill: #2563EB; opacity: 0.4; animation: wave 20s linear infinite; }
                .wave-3 { fill: #1D4ED8; opacity: 0.3; animation: wave 15s linear infinite; }
                .wave-4 { fill: #1E40AF; opacity: 0.2; animation: wave 30s linear infinite; }
                .wave-5 { fill: #1E3A8A; opacity: 0.1; animation: wave 35s linear infinite; }
                @keyframes wave {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
              `}
            </style>
          </defs>
          <path
            className="wave wave-1"
            d="M0 300 Q 360 200, 720 300 Q 1080 400, 1440 300 Q 1800 200, 2160 300 Q 2520 400, 2880 300 L 2880 800 L 0 800 Z"
          />
          <path
            className="wave wave-2"
            d="M0 400 Q 360 300, 720 400 Q 1080 500, 1440 400 Q 1800 300, 2160 400 Q 2520 500, 2880 400 L 2880 800 L 0 800 Z"
          />
          <path
            className="wave wave-3"
            d="M0 500 Q 360 400, 720 500 Q 1080 600, 1440 500 Q 1800 400, 2160 500 Q 2520 600, 2880 500 L 2880 800 L 0 800 Z"
          />
          <path
            className="wave wave-4"
            d="M0 600 Q 360 500, 720 600 Q 1080 700, 1440 600 Q 1800 500, 2160 600 Q 2520 700, 2880 600 L 2880 800 L 0 800 Z"
          />
          <path
            className="wave wave-5"
            d="M0 700 Q 360 600, 720 700 Q 1080 800, 1440 700 Q 1800 600, 2160 700 Q 2520 800, 2880 700 L 2880 800 L 0 800 Z"
          />
        </svg>
      </div>

      {/* Contenedor del formulario */}
      <div className="relative z-10 bg-white shadow-lg rounded-lg p-8 w-96 m-8">
        <div className="flex flex-col items-center">
          {/* Logo y nombre del sistema */}
          <div className="mb-8 text-center logo-container">
            <img
              src="https://ho-tech.com/wp-content/uploads/2020/06/HoTech-Logo_Mesa-de-trabajo-1-copy.png"
              alt="Hotel Management System"
              className="w-32 mx-auto mb-4 filter drop-shadow-lg"
            />
            <h1 className="text-2xl font-semibold text-gray-900">
              VIPS Presencia
            </h1>
          </div>

          {/* Formulario de login */}
          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  placeholder="Ingrese su usuario"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={formData.showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  placeholder="Ingrese su contraseña"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {formData.showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowRecoveryModal(true)}
                className="text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:underline"
              >
                ¿Olvidó su contraseña?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#1a56db] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Ingresar'
              )}
            </button>
            
            {/* Mensaje de prueba */}
            <div className="text-center text-xs text-gray-500">
              <p>Usar usuario: <strong>admin</strong> y contraseña: <strong>admin</strong> para pruebas</p>
            </div>
          </form>
        </div>

        {/* Nombre de la empresa */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Ho-Tech del Caribe
          </p>
        </div>
      </div>

      {/* Modal de recuperación de contraseña */}
      {showRecoveryModal && (
        <RecoveryModal onClose={() => setShowRecoveryModal(false)} />
      )}
    </div>
  );
}