import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { tokenStorage } from '../utils/tokenStorage';
import { User, LoginCredentials } from '../types/auth';

/**
 * Hook personalizado para manejar la autenticación en la aplicación
 */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar usuario desde el almacenamiento local al iniciar
  useEffect(() => {
    const loadUser = () => {
      try {
        const currentUser = tokenStorage.getUser();
        const isUserAuthenticated = tokenStorage.isAuthenticated();
        
        setUser(currentUser);
        setIsAuthenticated(isUserAuthenticated);
      } catch (err) {
        console.error('Error al cargar usuario:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * Función para realizar el login
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(credentials);
      
      if (response.success && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        setError(response.error || 'Error de autenticación');
        return { success: false, error: response.error };
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
      setUser(null);
      setIsAuthenticated(false);
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