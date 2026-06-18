/**
 * Auth API wrapper
 * Bridges the gap between AuthContext.tsx (older) and the features/auth/useAuth.ts (current)
 */

import { setAuthToken as _set, getAuthToken as _get, removeAuthToken as _remove } from '@/lib/token';

const AUTH_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Re-export token utilities
export const setAuthToken = _set;
export const getAuthToken = _get;
export const removeAuthToken = _remove;

// Auth API methods
export const authAPI = {
  /**
   * Login a user — returns { token }
   */
  login: async ({ email, password }: { email: string; password: string }) => {
    const res = await fetch(`${AUTH_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data as { token: string; user?: { id: string | number; name: string; email: string; role: string; createdAt?: string }; message?: string };
  },

  /**
   * Register a user — returns { message, user }
   */
  register: async ({
    name,
    email,
    password,
    role = 'learner',
  }: {
    name: string;
    email: string;
    password: string;
    role?: 'learner' | 'teacher';
  }) => {
    const res = await fetch(`${AUTH_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data as { token: string; user?: { id: string | number; name: string; email: string; role: string; createdAt?: string }; message?: string };
  },

  changePassword: async ({
    currentPassword,
    newPassword,
  }: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const token = getAuthToken();
    const res = await fetch(`${AUTH_BASE}/auth/password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed to change password');
    return data as { message: string };
  },

  deleteAccount: async ({ password }: { password: string }) => {
    const token = getAuthToken();
    const res = await fetch(`${AUTH_BASE}/auth/account`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed to delete account');
    return data as { message: string };
  },
};
