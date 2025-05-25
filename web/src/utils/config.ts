/**
 * Configuration utilities for accessing environment variables
 */

/**
 * Gets the backend API URL from environment variables
 * @returns The backend API URL
 */
export function getBackendApiUrl(): string {
  return process.env.REACT_APP_BACKEND_API_URL || '/tuna-api';
}
