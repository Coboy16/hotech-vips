import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  // useCallback no es necesario para la nueva función simple
} from "react";
import { User, LoginCredentials, AuthResponse } from "../types/auth";
import { authService } from "../services/authService";
import { tokenStorage, StorageType } from "../utils/tokenStorage";

// Definir la interfaz para el contexto de autenticación
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsPasswordChange: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  markPasswordAsChanged: () => void; // <<<--- Cambiado: Nueva función simple
}

// Crear el contexto con un valor predeterminado
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false, // <<<--- Inicializar en true para mostrar LoadingScreen inicialmente
  isAuthenticated: false,
  needsPasswordChange: false,
  error: null,
  login: async () => ({ success: false }),
  logout: async () => {},
  markPasswordAsChanged: () => {}, // <<<--- Implementación vacía inicial
});

// Props para el proveedor de autenticación
interface AuthProviderProps {
  children: ReactNode;
}

// Componente proveedor que envuelve la aplicación
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Inicia en true
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [needsPasswordChange, setNeedsPasswordChange] =
    useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar la autenticación al cargar el componente
  useEffect(() => {
    const loadAuthState = () => {
      // No poner setIsLoading(true) aquí de nuevo, ya está en true inicialmente
      try {
        const isUserAuthenticated = tokenStorage.isAuthenticated();
        console.log("[AuthContext] isUserAuthenticated:", isUserAuthenticated);

        if (isUserAuthenticated) {
          const storedUser = tokenStorage.getUser();
          console.log(
            "[AuthContext] Usuario recuperado del almacenamiento:",
            storedUser ? storedUser.usua_corr : "No"
          );

          if (storedUser) {
            setUser(storedUser);
            setIsAuthenticated(true);
            // Establecer si necesita cambio de contraseña al cargar
            // IMPORTANTE: Asumimos que el token no expira MIENTRAS el modal está abierto.
            // Si expira, al recargar, has_logged_in debería venir actualizado si ya se cambió.
            setNeedsPasswordChange(storedUser.has_logged_in === false);
            console.log(
              "[AuthContext] needsPasswordChange al cargar:",
              storedUser.has_logged_in === false
            );
          } else {
            console.log(
              "[AuthContext] Token encontrado pero sin datos de usuario, limpiando."
            );
            tokenStorage.clearSession();
            setIsAuthenticated(false);
            setNeedsPasswordChange(false);
          }
        } else {
          console.log(
            "[AuthContext] No se encontró token, usuario no autenticado"
          );
          setIsAuthenticated(false);
          setNeedsPasswordChange(false);
        }
      } catch (error) {
        console.error(
          "[AuthContext] Error al cargar estado de autenticación:",
          error
        );
        tokenStorage.clearSession();
        setUser(null);
        setIsAuthenticated(false);
        setNeedsPasswordChange(false);
      } finally {
        setIsLoading(false); // Marcar que la carga inicial ha terminado
      }
    };

    // Si quieres un pequeño delay antes de quitar el LoadingScreen inicial la primera vez:
    // const timer = setTimeout(() => loadAuthState(), 500); // Ejemplo 0.5s delay
    // return () => clearTimeout(timer);
    // O sin delay:
    loadAuthState();
  }, []);

  // Función para realizar el login (sin cambios funcionales)
  const login = async (
    credentials: LoginCredentials
  ): Promise<AuthResponse> => {
    console.log(
      "[AuthContext] Iniciando login con credenciales:",
      credentials.email
    );
    setIsLoading(true); // Mostrar carga durante el login
    setError(null);
    setNeedsPasswordChange(false);

    try {
      const response = await authService.login(credentials);
      console.log(
        "[AuthContext] Respuesta del login:",
        response.success ? "Exitosa" : "Fallida",
        response.error || ""
      );

      if (response.success && response.user && response.token) {
        const storageType = credentials.rememberMe
          ? StorageType.LOCAL
          : StorageType.SESSION;
        console.log(
          `[AuthContext] Guardando sesión como ${
            credentials.rememberMe ? "persistente" : "temporal"
          }`
        );

        const userData = response.user;

        tokenStorage.setToken(response.token, storageType);
        tokenStorage.setUser(userData, storageType);

        setUser(userData);
        setIsAuthenticated(true);
        setNeedsPasswordChange(userData.has_logged_in === false);
        console.log(
          "[AuthContext] Login exitoso, needsPasswordChange:",
          userData.has_logged_in === false
        );

        return { success: true, user: userData };
      } else {
        let errorMsg = response.error || "Error de autenticación";
        if (
          errorMsg.includes("Contraseña incorrecta") ||
          errorMsg.includes("no está registrado")
        ) {
          errorMsg = "Credenciales inválidas";
        }
        console.log("[AuthContext] Error de autenticación:", errorMsg);
        setError(errorMsg);
        setUser(null);
        setIsAuthenticated(false);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.error("[AuthContext] Error durante el login:", error);
      const errorMessage = "Ocurrió un error al iniciar sesión";
      setError(errorMessage);
      setUser(null);
      setIsAuthenticated(false);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false); // Ocultar carga después del login
    }
  };

  // Función para realizar el logout (sin cambios)
  const logout = async (): Promise<void> => {
    console.log("[AuthContext] Iniciando logout");
    try {
      await authService.logout();
    } catch (error) {
      console.error("[AuthContext] Error durante el logout API call:", error);
    } finally {
      console.log("[AuthContext] Limpiando estado local");
      tokenStorage.clearSession();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      setNeedsPasswordChange(false);
    }
  };

  // <<<--- Nueva función simple para marcar el cambio como hecho --- >>>
  const markPasswordAsChanged = () => {
    console.log("[AuthContext] Marcando contraseña como cambiada localmente.");
    setNeedsPasswordChange(false);
    // Opcional: Actualizar el objeto 'user' en el estado local también,
    // aunque no lo obtengamos de la API. Esto evita inconsistencias si
    // alguna parte de la UI depende directamente de user.has_logged_in.
    setUser((currentUser) => {
      if (currentUser) {
        // Crea una copia y actualiza has_logged_in
        const updatedUser = { ...currentUser, has_logged_in: true };
        // Actualiza también el storage para consistencia si recarga
        const storageType = tokenStorage.getStorageType();
        tokenStorage.setUser(updatedUser, storageType);
        return updatedUser;
      }
      return null; // No debería pasar si estamos autenticados
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        needsPasswordChange,
        error,
        login,
        logout,
        markPasswordAsChanged, // <<<--- Exponer la nueva función
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = () => useContext(AuthContext);
