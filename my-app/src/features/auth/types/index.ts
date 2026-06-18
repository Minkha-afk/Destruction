// Auth feature type definitions

export interface User {
  id: string | number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'learner' | 'teacher') => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  updateUser: (partialUser: Partial<User>) => void;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'learner' | 'teacher';
}

export interface AuthResponse {
  token: string;
  user?: User;
  message?: string;
}

export type AuthMode = 'login' | 'register';
export type UserRole = 'learner' | 'teacher';
