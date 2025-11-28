/**
 * Centralized API Client with Auto Token Refresh & Toast Integration
 * Optimized for Static Export / VPS Deployment
 */

import { tokenManager } from './tokenManager';
import { AuthError } from './errors';
import { toast } from './toast';
import { useLanguageStore } from '@/store/languageStore';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://sandbox.timroticket.com/api/v1';

// Request queue for handling concurrent requests during token refresh
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
}

export interface ApiRequestConfig extends RequestInit {
  requiresAuth?: boolean;
  skipTokenRefresh?: boolean;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
  translateResponse?: boolean; // If true, tries to translate API response message
  returnFullResponse?: boolean; // If true, returns full response including message
}

/**
 * Main API request handler with automatic token refresh
 */
export async function apiRequest<T>(
  endpoint: string,
  config: ApiRequestConfig = {}
): Promise<T> {
  const {
    requiresAuth = false,
    skipTokenRefresh = false,
    showSuccessToast = false,
    showErrorToast = true, // Show errors by default
    successMessage,
    errorMessage,
    translateResponse = false,
    returnFullResponse = false,
    headers = {},
    ...restConfig
  } = config;

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  // Prepare headers
  const requestHeaders: Record<string, string> = {
    ...headers as Record<string, string>,
  };

  // Only set Content-Type if not already set and body is not FormData
  // FormData should not have Content-Type set manually (browser sets it with boundary)
  if (!requestHeaders['Content-Type'] && !(restConfig.body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  // Add auth token if required
  if (requiresAuth) {
    const accessToken = tokenManager.getAccessToken();

    if (!accessToken) {
      throw new AuthError('No access token available', 'UNAUTHORIZED', 401);
    }

    // Check if token is about to expire
    if (!skipTokenRefresh && tokenManager.isTokenExpired(accessToken)) {
      // Token is expired or about to expire, try to refresh
      try {
        const newToken = await refreshAccessToken();
        requestHeaders['Authorization'] = `Bearer ${newToken}`;
      } catch {
        // Token refresh failed, throw unauthorized error
        tokenManager.clearTokens();
        throw new AuthError('Session expired. Please login again.', 'SESSION_EXPIRED', 401);
      }
    } else {
      requestHeaders['Authorization'] = `Bearer ${accessToken}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...restConfig,
      headers: requestHeaders,
    });

    const data = await response.json();

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && requiresAuth && !skipTokenRefresh) {
      try {
        const newToken = await refreshAccessToken();

        // Retry the original request with new token
        return await apiRequest<T>(endpoint, {
          ...config,
          skipTokenRefresh: true, // Prevent infinite loops
          headers: {
            ...headers,
            'Authorization': `Bearer ${newToken}`,
          },
        });
      } catch {
        tokenManager.clearTokens();
        throw new AuthError('Session expired. Please login again.', 'SESSION_EXPIRED', 401);
      }
    }

    // Handle other error responses
    if (!response.ok) {
      const errorMsg = data?.message || data?.error?.message || 'An error occurred';
      const errorCode = data?.error?.code || 'UNKNOWN_ERROR';
      const errorDetails = data?.error?.details;

      // Show error toast if enabled
      if (showErrorToast) {
        const displayMessage = errorMessage || errorMsg;
        toast.error('api.error', displayMessage, errorDetails);
      }

      throw new AuthError(
        errorMsg,
        errorCode,
        response.status,
        errorDetails
      );
    }

    // Success - show toast if enabled
    if (showSuccessToast) {
      const responseMessage = data?.message;
      const displayMessage = successMessage || responseMessage || 'Success';
      toast.success('api.success', displayMessage);

      if (returnFullResponse) {
        return data as T;
      }

    }

    // Return successful response data
    return data.data || data;
  } catch (error) {
    // Handle network errors
    if (error instanceof AuthError) {
      // Show error toast if not already shown and enabled
      if (showErrorToast && error.code === 'NETWORK_ERROR') {
        const displayMessage = errorMessage || error.message;
        toast.error('api.networkError', displayMessage);
      }
      throw error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError = new AuthError(
        'Network error. Please check your connection.',
        'NETWORK_ERROR'
      );

      if (showErrorToast) {
        toast.error('api.networkError', errorMessage || networkError.message);
      }

      throw networkError;
    }

    const unexpectedError = new AuthError(
      'An unexpected error occurred',
      'UNEXPECTED_ERROR'
    );

    if (showErrorToast) {
      toast.error('api.unexpectedError', errorMessage || unexpectedError.message);
    }

    throw unexpectedError;
  }
}

/**
 * Refresh access token using refresh token
 * Handles concurrent requests with a queue system
 */
async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenManager.getRefreshToken();

  if (!refreshToken) {
    throw new AuthError('No refresh token available', 'UNAUTHORIZED', 401);
  }

  // If already refreshing, wait for it to complete
  if (isRefreshing) {
    return new Promise((resolve) => {
      subscribeTokenRefresh((token: string) => {
        resolve(token);
      });
    });
  }

  isRefreshing = true;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    const tokens = data.data || data;

    // Update tokens
    const rememberMe = tokenManager.isRememberMeEnabled();
    tokenManager.setTokens(tokens.access_token, tokens.refresh_token, rememberMe);

    // Notify all waiting requests
    onTokenRefreshed(tokens.access_token);

    return tokens.access_token;
  } catch (error) {
    // Clear tokens on refresh failure
    tokenManager.clearTokens();
    throw error;
  } finally {
    isRefreshing = false;
  }
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: <T>(endpoint: string, config?: ApiRequestConfig) =>
    apiRequest<T>(endpoint, { ...config, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, config?: ApiRequestConfig) =>
    apiRequest<T>(endpoint, {
      ...config,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, config?: ApiRequestConfig) =>
    apiRequest<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, config?: ApiRequestConfig) =>
    apiRequest<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, config?: ApiRequestConfig) =>
    apiRequest<T>(endpoint, { ...config, method: 'DELETE' }),

  /**
   * PUT request with FormData support (multipart/form-data)
   * The apiRequest function automatically handles Content-Type for FormData
   */
  putFormData: <T>(endpoint: string, formData: FormData, config?: ApiRequestConfig) =>
    apiRequest<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: formData,
    }),

  /**
   * POST request with FormData support (multipart/form-data)
   */
  postFormData: <T>(endpoint: string, formData: FormData, config?: ApiRequestConfig) =>
    apiRequest<T>(endpoint, {
      ...config,
      method: 'POST',
      body: formData,
    }),
};
