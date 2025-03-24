import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User, LoginCredentials, AuthResponse } from '../types/auth';
import { authService } from '../services/authService';
import { tokenStorage, StorageType } from '../utils/tokenStorage';

// Definir la interfaz para el contexto de autenticación
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

// Crear el contexto con un valor predeterminado
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  login: async () => ({ success: false }),
  logout: async () => {}
});

// Props para el proveedor de autenticación
interface AuthProviderProps {
  children: ReactNode;
}

// Componente proveedor que envuelve la aplicación
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  // Verificar la autenticación al cargar el componente
  useEffect(() => {
    
    const loadAuthState = () => {
      
      try {
        // Verificar si hay un token válido
        const isUserAuthenticated = tokenStorage.isAuthenticated();
        console.log('[AuthContext] isUserAuthenticated:', isUserAuthenticated);
        
        if (isUserAuthenticated) {
          // Cargar datos del usuario desde el almacenamiento
          const storedUser = tokenStorage.getUser();
          console.log('[AuthContext] Usuario recuperado del almacenamiento:', storedUser ? 'Sí' : 'No');
          
          if (storedUser) {
            setUser(storedUser);
            setIsAuthenticated(true);
          } else {
            console.log('[AuthContext] Token encontrado pero sin datos de usuario');
          }
        } else {
          console.log('[AuthContext] No se encontró token, usuario no autenticado');
        }
      } catch (error) {
        console.error('Error:', error);
        // Limpiar el estado si hay errores
        tokenStorage.clearSession();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        // Marcar que la carga inicial ha terminado
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  // Efecto para registrar cambios en el estado de autenticación


  // Función para realizar el login
  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    console.log('[AuthContext] Iniciando login con credenciales:', credentials.email);
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);
      console.log('[AuthContext] Respuesta del login:', response.success ? 'Exitosa' : 'Fallida');

      if (response.success && response.user && response.token) {
        // Determinar el tipo de almacenamiento según la opción rememberMe
        const storageType = credentials.rememberMe
          ? StorageType.LOCAL
          : StorageType.SESSION;
        
        console.log(`[AuthContext] Guardando sesión como ${credentials.rememberMe ? 'persistente' : 'temporal'}`);
        
        // Guardar token y datos del usuario
        tokenStorage.setToken(response.token, storageType);
        tokenStorage.setUser(response.user, storageType);
        
        setUser(response.user);
        setIsAuthenticated(true);
        
        return { success: true, user: response.user };
      } else {
        // Formatear el mensaje de error
        let errorMsg = response.error || 'Error de autenticación';
        
        // Simplificar mensajes específicos
        if (errorMsg.includes("Contraseña incorrecta") || 
            errorMsg.includes("no está registrado")) {
          errorMsg = "Credenciales inválidas";
        }
        
        console.log('[AuthContext] Error de autenticación:', errorMsg);
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.error('[AuthContext] Error durante el login:', error);  
      const errorMessage = 'Ocurrió un error al iniciar sesión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Función para realizar el logout
  const logout = async (): Promise<void> => {
    console.log('[AuthContext] Iniciando logout');
    setIsLoading(true);
    
    try {
      await authService.logout();
      console.log('[AuthContext] Logout en servidor completado');
    } catch (error) {
      console.error('[AuthContext] Error durante el logout:', error);
    } finally {
      // Limpiar el estado y el almacenamiento independientemente del resultado
      console.log('[AuthContext] Limpiando estado local');
      tokenStorage.clearSession();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        error,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = () => useContext(AuthContext);