// Auth feature public API
// Components
export { AuthBackground } from './components/AuthBackground';
export { AuthForm } from './components/AuthForm';

// Composables
export { useAuth, AuthProvider } from './composables/useAuth';

// Types
export type {
    User,
    AuthContextType,
    LoginData,
    RegisterData,
    AuthResponse,
    AuthMode,
    UserRole,
} from './types';
