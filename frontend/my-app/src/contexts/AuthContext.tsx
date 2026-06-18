'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, setAuthToken, getAuthToken, removeAuthToken } from '@/api/auth-api';
import { decodeJWT, isTokenExpired, isTokenExpiringSoon } from '@/lib/cookies';

interface User {
  id: string | number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'learner' | 'teacher') => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const initializeAuth = async () => {
      const token = getAuthToken();
      if (token && !isTokenExpired(token)) {
        try {
          // First try to decode the token locally
          const decodedToken = decodeJWT(token);
          if (decodedToken && decodedToken.user) {
            setUser({
              id: decodedToken.user.id || 0,
              name: decodedToken.user.name || 'User',
              email: decodedToken.user.email || '',
              role: decodedToken.user.role || 'learner',
              createdAt: decodedToken.user.createdAt || new Date().toISOString(),
            });
          } else if (decodedToken && decodedToken.id) {
            // Handle case where user data is directly in token payload
            setUser({
              id: decodedToken.id || 0,
              name: decodedToken.username || decodedToken.name || 'User',
              email: decodedToken.email || '',
              role: decodedToken.role || 'learner',
              createdAt: decodedToken.iat ? new Date(decodedToken.iat * 1000).toISOString() : new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error('Error decoding token:', error);
          removeAuthToken();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();

    // Set up periodic token validation (every 5 minutes)
    const tokenValidationInterval = setInterval(() => {
      const token = getAuthToken();
      if (token) {
        if (isTokenExpired(token)) {
          removeAuthToken();
          setUser(null);
        } else if (isTokenExpiringSoon(token, 10)) {
          // Token expires in less than 10 minutes, could trigger refresh here
          console.log('Token expiring soon, consider refreshing');
        }
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(tokenValidationInterval);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login({ email, password });
      
      if (response.token) {
        setAuthToken(response.token);
        
        // Decode the JWT token to get user info
        const decodedToken = decodeJWT(response.token);
        if (decodedToken && decodedToken.user) {
          setUser({
            id: decodedToken.user.id || 0,
            name: decodedToken.user.name || email.split('@')[0],
            email: decodedToken.user.email || email,
            role: decodedToken.user.role || 'learner',
            createdAt: decodedToken.user.createdAt || new Date().toISOString(),
          });
        } else if (decodedToken && decodedToken.id) {
          // Handle case where user data is directly in token payload
          setUser({
            id: decodedToken.id || 0,
            name: decodedToken.username || decodedToken.name || email.split('@')[0],
            email: decodedToken.email || email,
            role: decodedToken.role || 'learner',
            createdAt: decodedToken.iat ? new Date(decodedToken.iat * 1000).toISOString() : new Date().toISOString(),
          });
        } else if (response.user) {
          // Fallback to response user data if token doesn't have user info
          setUser({
            id: response.user.id || 0,
            name: response.user.name || email.split('@')[0],
            email: response.user.email || email,
            role: response.user.role || 'learner',
            createdAt: response.user.createdAt || new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: 'learner' | 'teacher') => {
    try {
      setIsLoading(true);
      const response = await authAPI.register({ name, email, password, role });
      
      if (response.token) {
        setAuthToken(response.token);
        
        // Decode the JWT token to get user info
        const decodedToken = decodeJWT(response.token);
        if (decodedToken && decodedToken.user) {
          setUser({
            id: decodedToken.user.id || 0,
            name: decodedToken.user.name || name,
            email: decodedToken.user.email || email,
            role: decodedToken.user.role || role,
            createdAt: decodedToken.user.createdAt || new Date().toISOString(),
          });
        } else if (decodedToken && decodedToken.id) {
          // Handle case where user data is directly in token payload
          setUser({
            id: decodedToken.id || 0,
            name: decodedToken.username || decodedToken.name || name,
            email: decodedToken.email || email,
            role: decodedToken.role || role,
            createdAt: decodedToken.iat ? new Date(decodedToken.iat * 1000).toISOString() : new Date().toISOString(),
          });
        } else if (response.user) {
          // Fallback to response user data if token doesn't have user info
          setUser({
            id: response.user.id || 0,
            name: response.user.name || name,
            email: response.user.email || email,
            role: response.user.role || role,
            createdAt: response.user.createdAt || new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  const refreshUser = async () => {
    const token = getAuthToken();
    if (token && !isTokenExpired(token)) {
      try {
        const decodedToken = decodeJWT(token);
        if (decodedToken && decodedToken.id) {
          setUser({
            id: decodedToken.id || 0,
            name: decodedToken.username || decodedToken.name || 'User',
            email: decodedToken.email || '',
            role: decodedToken.role || 'learner',
            createdAt: decodedToken.iat ? new Date(decodedToken.iat * 1000).toISOString() : new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Error refreshing user:', error);
        removeAuthToken();
        setUser(null);
      }
    } else {
      removeAuthToken();
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
