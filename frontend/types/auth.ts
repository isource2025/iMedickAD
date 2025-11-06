export interface LoginCredentials {
  usuario: string;
  password: string;
}

export interface User {
  idUsuario: number;
  usuario: string;
  nombre: string;
  email: string;
  hospitalAsignado: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}
