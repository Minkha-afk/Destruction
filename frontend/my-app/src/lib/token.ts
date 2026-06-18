/**
 * Token management utilities
 * Handles auth token storage, retrieval, and validation
 */

import { setCookie, getCookie, removeCookie, isTokenExpired } from './cookies';

const TOKEN_NAME = 'authToken';
const TOKEN_EXPIRY_DAYS = 1;

/**
 * Store authentication token in cookies
 */
export const setAuthToken = (token: string) => {
  setCookie(TOKEN_NAME, token, TOKEN_EXPIRY_DAYS);
};

/**
 * Retrieve authentication token from cookies
 * Returns null if token is expired or doesn't exist
 */
export const getAuthToken = (): string | null => {
  const token = getCookie(TOKEN_NAME);
  if (token && isTokenExpired(token)) {
    removeAuthToken();
    return null;
  }
  return token;
};

/**
 * Remove authentication token from cookies
 */
export const removeAuthToken = () => {
  removeCookie(TOKEN_NAME);
};
