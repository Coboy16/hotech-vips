import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { tokenStorage, StorageType } from '../utils/tokenStorage';
import { User, LoginCredentials } from '../types/auth';

/**
 * Hook personalizado para manejar la autenticación en la aplicación
 */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar usuario desde el almacenamiento al iniciar
  // Esta función se ejecuta solo una vez al montar el componente
  useEffect(() => {
    const checkAuth = () => {
      try {
        const isUserAuthenticated = tokenStorage.isAuthenticated();
        
        if (isUserAuthenticated) {
          const currentUser = tokenStorage.getUser();
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Error al cargar usuario:', err);
        // En caso de error, aseguramos de limpiar el estado
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);  // Array de dependencias vacío para que se ejecute solo al montar

  /**
   * Función para realizar el login
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(credentials);
      
      if (response.success && response.user && response.token) {
        // Determinar el tipo de almacenamiento según la opción rememberMe
        const storageType = credentials.rememberMe 
          ? StorageType.LOCAL 
          : StorageType.SESSION;
        
        // Guardar token y usuario en el almacenamiento correspondiente
        tokenStorage.setToken(response.token, storageType);
        tokenStorage.setUser(response.user, storageType);
        
        // Actualizar estado
        setUser(response.user);
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        // Formateamos el mensaje de error para la UI
        let errorMsg = response.error || 'Error de autenticación';
        
        // Simplificamos mensajes específicos para mejorar la UX
        if (errorMsg.includes("Contraseña incorrecta") || 
            errorMsg.includes("no está registrado")) {
          errorMsg = "Credenciales inválidas";
        }
        
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      console.error('Login error:', err); 
      const errorMessage = 'Ocurrió un error al iniciar sesión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Función para realizar el logout
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    
    try {
      await authService.logout();
      
      // Limpiar estado después del logout
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      
      return { success: true };
    } catch (err) {
      console.error('Logout error:', err); 
      const errorMessage = 'Error al cerrar sesión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    logout
  };
};