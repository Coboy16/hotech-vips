import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { userService } from "../services/userService";
import {
  CreateUserDto,
  DeleteUserDto,
  UpdatePasswordDto,
  UpdateUserDto,
  User,
} from "../types/user";
import { transformUserToApiDto } from "../utils/transformers";

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los usuarios
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (err) {
      setError("Error al cargar los usuarios");
      console.error("Error al cargar todos los usuarios:", err);
      toast.error("No se pudieron cargar los usuarios");
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar un usuario por ID
  const loadUser = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getById(id);
      setSelectedUser(data);
      return data;
    } catch (err) {
      setError("Error al cargar el usuario");
      console.error("Error al cargar usuario:", err);
      toast.error("No se pudo cargar el usuario seleccionado");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear un nuevo usuario
  const createUser = useCallback(
    async (userData: Partial<User>): Promise<User | null> => {
      setLoading(true);
      setError(null);
      try {
        // Transformar datos del formulario al DTO de la API
        const apiUserData = transformUserToApiDto(userData) as CreateUserDto;
        // Incluir campos requeridos que no están en el formulario
        apiUserData.password = userData.password || "123456";
        apiUserData.usua_fevc = new Date().toISOString();

        const newUser = await userService.create(apiUserData);
        if (newUser) {
          setUsers((prev) => [...prev, newUser]);
          toast.success("Usuario creado exitosamente");
          return newUser;
        }
        throw new Error("No se pudo crear el usuario");
      } catch (err) {
        setError("Error al crear el usuario");
        console.error("Error al crear usuario:", err);
        toast.error("No se pudo crear el usuario");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Actualizar un usuario existente
  const updateUser = useCallback(
    async (id: string, userData: Partial<User>): Promise<User | null> => {
      setLoading(true);
      setError(null);
      try {
        // Transformar datos del formulario al DTO de la API
        const apiUserData = transformUserToApiDto(userData) as UpdateUserDto;

        const updatedUser = await userService.update(id, apiUserData);
        if (updatedUser) {
          setUsers((prev) =>
            prev.map((user) => (user.id === id ? updatedUser : user))
          );

          if (selectedUser?.id === id) {
            setSelectedUser(updatedUser);
          }

          toast.success("Usuario actualizado exitosamente");
          return updatedUser;
        }
        throw new Error("No se pudo actualizar el usuario");
      } catch (err) {
        setError("Error al actualizar el usuario");
        console.error("Error al actualizar usuario:", err);
        toast.error("No se pudo actualizar el usuario");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [selectedUser]
  );

  // Actualizar contraseña de usuario
  const updatePassword = useCallback(
    async (id: string, password: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const passwordData: UpdatePasswordDto = { password };

        const success = await userService.updatePassword(id, passwordData);
        if (success) {
          toast.success("Contraseña actualizada exitosamente");
          return true;
        }
        throw new Error("No se pudo actualizar la contraseña");
      } catch (err) {
        setError("Error al actualizar la contraseña");
        console.error("Error al actualizar contraseña:", err);
        toast.error("No se pudo actualizar la contraseña");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Eliminar un usuario
  const deleteUser = useCallback(
    async (id: string, comment?: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        // Si hay comentario, usar DeleteUserDto
        const deleteData = comment
          ? ({
              iduser: parseInt(id, 10), // Convertir a número si es necesario
              comment,
            } as DeleteUserDto)
          : undefined;

        const success = await userService.delete(id, deleteData);
        if (success) {
          setUsers((prev) => prev.filter((user) => user.id !== id));

          if (selectedUser?.id === id) {
            setSelectedUser(null);
          }

          toast.success("Usuario eliminado exitosamente");
          return true;
        }
        throw new Error("No se pudo eliminar el usuario");
      } catch (err) {
        setError("Error al eliminar el usuario");
        console.error("Error al eliminar usuario:", err);
        toast.error("No se pudo eliminar el usuario");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [selectedUser]
  );

  // Eliminar un usuario por email
  const deleteUserByEmail = useCallback(
    async (email: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const success = await userService.deleteByEmail(email);
        if (success) {
          setUsers((prev) => prev.filter((user) => user.email !== email));

          if (selectedUser?.email === email) {
            setSelectedUser(null);
          }

          toast.success("Usuario eliminado exitosamente");
          return true;
        }
        throw new Error("No se pudo eliminar el usuario");
      } catch (err) {
        setError("Error al eliminar el usuario");
        console.error("Error al eliminar usuario por email:", err);
        toast.error("No se pudo eliminar el usuario");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [selectedUser]
  );

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    users,
    selectedUser,
    loading,
    error,
    loadUsers,
    loadUser,
    createUser,
    updateUser,
    updatePassword,
    deleteUser,
    deleteUserByEmail,
    setSelectedUser,
  };
};
