export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

export interface LoginScreenProps {
  onLogin?: () => void;
}

export interface LogoutModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}