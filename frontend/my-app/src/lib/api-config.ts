/**
 * Base API configuration and utilities
 * This file contains shared API configuration and helper functions
 */

import { getCookie } from './cookies';

// API Base URLs
export const API_BASE_URLS = {
  auth: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  course: process.env.NEXT_PUBLIC_COURSE_SERVICE_URL || 'http://localhost:6100',
  catalog: process.env.NEXT_PUBLIC_CATALOG_SERVICE_URL || 'http://localhost:7000',
  chat: process.env.NEXT_PUBLIC_CHAT_SERVICE_URL || 'http://localhost:5000',
  search: process.env.NEXT_PUBLIC_SEARCH_SERVICE_URL || 'http://localhost:7000',
} as const;

/**
 * Get authentication token from cookies
 */
export const getAuthToken = (): string | null => {
  return getCookie('authToken');
};

/**
 * Generic authenticated fetch helper
 * @param url - Full URL or path
 * @param options - Fetch options
 * @param baseUrl - Optional base URL (will be prepended if url doesn't start with http)
 */
export const apiFetch = async <T = any>(
  url: string,
  options: RequestInit = {},
  baseUrl?: string
): Promise<T> => {
  const token = getAuthToken();
  
  // Determine full URL
  const fullUrl = url.startsWith('http') 
    ? url 
    : `${baseUrl || ''}${url}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response: Response;
  try {
    response = await fetch(fullUrl, {
      ...options,
      headers,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network request failed';
    throw new Error(`Unable to reach backend at ${fullUrl}. ${message}`);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `Request failed: ${response.status}`);
  }

  return response.json();
};

/**
 * Create a scoped API client for a specific service
 */
export const createApiClient = (baseUrl: string) => {
  return {
    get: <T = any>(endpoint: string, options?: RequestInit) => 
      apiFetch<T>(endpoint, { ...options, method: 'GET' }, baseUrl),
    
    post: <T = any>(endpoint: string, data?: any, options?: RequestInit) => 
      apiFetch<T>(endpoint, { 
        ...options, 
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined 
      }, baseUrl),
    
    put: <T = any>(endpoint: string, data?: any, options?: RequestInit) => 
      apiFetch<T>(endpoint, { 
        ...options, 
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined 
      }, baseUrl),
    
    delete: <T = any>(endpoint: string, options?: RequestInit) => 
      apiFetch<T>(endpoint, { ...options, method: 'DELETE' }, baseUrl),
  };
};
