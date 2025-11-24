import { tokenManager } from './tokenManager';
import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

interface ApiRequestConfig extends RequestInit {
  requiresAuth?: boolean;
  skipTokenRefresh?: boolean;
}

export async function apiRequest<T>(endpoint: string, config: ApiRequestConfig = {}): Promise<T> {
  const { requiresAuth = false, skipTokenRefresh = false, headers = {}, ...rest } = config;
  
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (requiresAuth) {
    const token = tokenManager.getAccessToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, { ...rest, headers: requestHeaders });

  // Handle 401 (Unauthorized) - Refresh Token Logic
  if (response.status === 401 && requiresAuth && !skipTokenRefresh) {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token');

      // Call your refresh endpoint
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!refreshResponse.ok) throw new Error('Refresh failed');

      const data = await refreshResponse.json();
      tokenManager.setTokens(data.access_token, data.refresh_token);

      // Retry original request
      return apiRequest<T>(endpoint, { ...config, skipTokenRefresh: true });
    } catch (error) {
      tokenManager.clearTokens();
      window.location.href = '/login'; // Redirect to login
      throw error;
    }
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API Error');
  }

  return data.data || data; // Adjust based on your API response structure
}

export const api = {
  get: <T>(url: string, config?: ApiRequestConfig) => apiRequest<T>(url, { ...config, method: 'GET' }),
  post: <T>(url: string, body: any, config?: ApiRequestConfig) => apiRequest<T>(url, { ...config, method: 'POST', body: JSON.stringify(body) }),
  put: <T>(url: string, body: any, config?: ApiRequestConfig) => apiRequest<T>(url, { ...config, method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(url: string, config?: ApiRequestConfig) => apiRequest<T>(url, { ...config, method: 'DELETE' }),
};
