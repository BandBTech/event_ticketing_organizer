import {
  LoginRequest,
  TokenResponse,
  UserProfileResponse,
  RefreshTokenRequest,
  AuthApiResponse,
  OrganizerProfile
} from '@/types/auth';
import { tokenManager } from '@/lib/tokenManager';
import { api, apiRequest as apiClientRequest } from '@/lib/apiClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://sandbox.timroticket.com/api/v1';

import { AuthError } from '@/lib/errors';

/**
 * Auth Service
 * Handles all authentication operations with automatic token refresh
 */
class AuthService {
  /**
   * Login user with email and password
   * @param credentials - Login credentials (email, password)
   * @param rememberMe - If true, stores tokens in localStorage; if false, stores in sessionStorage
   */
  async login(credentials: LoginRequest, rememberMe: boolean = false): Promise<TokenResponse> {
    const tokens = await api.post<TokenResponse>('/auth/organizer/login', credentials, {
      showErrorToast: false,
    });

    // Store tokens with remember me preference
    tokenManager.setTokens(tokens.access_token, tokens.refresh_token, rememberMe);

    return tokens;
  }

  /**
   * Get authenticated user profile
   * Uses automatic token refresh from apiClient
   */
  async getProfile(): Promise<UserProfileResponse> {
    return await api.get<UserProfileResponse>('/auth/profile', {
      requiresAuth: true,
    });
  }

  /**
   * Get organizer profile information
   */
  async getOrganizerProfile(): Promise<OrganizerProfile> {
    return await api.get<OrganizerProfile>('/organizer/profile', {
      requiresAuth: true,
    });
  }

  /**
   * Get organizer onboarding status
   */
  async getOrganizerStatus(): Promise<{ is_complete: boolean }> {
    return await api.get<{ is_complete: boolean }>('/organizer/status', {
      requiresAuth: true,
    });
  }

  /**
   * Update organizer profile (onboarding)
   * Accepts multipart/form-data
   */
  async updateOrganizerProfile(data: {
    business_name: string;
    business_description?: string;
    business_logo?: File | null;
    role?: string;
  }): Promise<Record<string, unknown>> {
    const formData = new FormData();
    formData.append('business_name', data.business_name);
    if (data.business_description) {
      formData.append('business_description', data.business_description);
    }

    if (data.business_logo === null) {
      formData.append('remove_logo', 'true');
    } else if (data.business_logo) {
      formData.append('business_logo', data.business_logo);
    }

    if (data.role) {
      formData.append('role', data.role);
    }

    return await api.putFormData<Record<string, unknown>>('/organizer/profile', formData, {
      requiresAuth: true,
      showSuccessToast: false, // Let component handle success toast
      showErrorToast: false, // Let component handle error toast
    });
  }

  /**
   * Refresh access token using refresh token
   * Preserves the original "remember me" preference
   */
  async refreshToken(): Promise<TokenResponse> {
    const refreshToken = tokenManager.getRefreshToken();

    if (!refreshToken) {
      throw new AuthError('No refresh token found', 'UNAUTHORIZED', 401);
    }

    const request: RefreshTokenRequest = {
      refresh_token: refreshToken,
    };

    const tokens = await api.post<TokenResponse>('/auth/refresh', request);

    // Preserve the original remember me preference when refreshing tokens
    const rememberMe = tokenManager.isRememberMeEnabled();
    tokenManager.setTokens(tokens.access_token, tokens.refresh_token, rememberMe);

    return tokens;
  }

  /**
   * Logout user
   * Returns message from API response for toast display
   */
  async logout(): Promise<{ message?: string }> {
    try {
      const response = await api.post<{ message?: string }>(
        `/auth/logout`,
        undefined,
        {
          requiresAuth: true,
          showErrorToast: false, // Don't show error toast - logout should always succeed locally
        }
      );
      return { message: response?.message };
    } catch {
      // Continue with local logout even if API call fails
      return { message: undefined };
    } finally {
      // Always clear tokens locally
      tokenManager.clearTokens();
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const accessToken = tokenManager.getAccessToken();
    if (!accessToken) return false;

    // Check if token is expired
    return !tokenManager.isTokenExpired(accessToken);
  }

  /**
   * Register a new user
   * Returns user profile and API message
   * Note: New API only requires email, first_name, last_name (password set via OTP flow)
   */
  async register(userData: {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    country_code?: string;
  }): Promise<{ user: UserProfileResponse }> {
    const response = await api.post<UserProfileResponse & { message?: string }>('/auth/organizer/register', {
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: userData.country_code && userData.phone ? userData.country_code + userData.phone : userData.phone,
      country_code: userData.country_code
    }, { showErrorToast: false });

    return {
      user: response,
    };
  }

  /**
   * Request password reset OTP
   * Uses apiClientRequest with returnFullResponse to get message
   */
  async requestPasswordReset(email: string): Promise<{ message?: string }> {
    const response = await apiClientRequest<AuthApiResponse<unknown>>(
      '/auth/organizer/reset-password-request',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
        returnFullResponse: true, // Get full response including message
        showErrorToast: false, // Let component handle error toast to avoid duplicates
      }
    );

    return {
      message: response.message,
    }
  }

  /**
   * Reset password with OTP
   * Updated to use OTP instead of reset_token and include role
   */
  async resetPassword(data: {
    otp: string;              // Changed from reset_token
    email_token: string;
    new_password: string;
    confirm_password: string;
    role?: 'user' | 'organizer' | 'admin';
  }): Promise<void> {
    await api.post<void>('/auth/organizer/reset-password', {
      otp: data.otp,
      email_token: data.email_token,
      new_password: data.new_password,
      confirm_password: data.confirm_password,
      role: data.role || 'user'
    }, { showErrorToast: false });
  }

  /**
   * Change password (for authenticated users)
   * Uses automatic token refresh from apiClient
   */
  async changePassword(data: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }): Promise<void> {
    await api.post<void>('/auth/change-password', data, {
      requiresAuth: true,
      showErrorToast: false, // Let the component handle error toasts to avoid duplicates
    });
  }

  /**
   * Update user profile
   * Uses automatic token refresh from apiClient
   * Updated to include country_code
   */
  async updateProfile(data: {
    first_name: string;
    last_name: string;
    phone?: string;
    country_code?: string;
  }): Promise<UserProfileResponse> {
    if (data.country_code && data.phone) {
      data.phone = data.country_code + data.phone;
    }
    return await api.put<UserProfileResponse>('/auth/profile', data, {
      requiresAuth: true,
    });
  }

  /**
   * Send OTP
   * Updated to include role parameter for new API
   */
  async sendOTP(data: {
    identifier: string;
    otp_type: string;
  }): Promise<{ message: string; success: boolean; expires_in: number }> {
    return await api.post<{ message: string; success: boolean; expires_in: number }>('/auth/organizer/send-otp', {
      identifier: data.identifier,
      otp_type: data.otp_type,
    }, { showErrorToast: false });
  }

  /**
   * Verify OTP
   * Updated to include role parameter for new API
   */
  async verifyOTP(data: {
    identifier: string;
    otp_code: string;
    otp_type: string;
    role?: 'user' | 'organizer' | 'admin';
  }): Promise<void> {
    await api.post<void>('/auth/organizer/verify-otp', {
      identifier: data.identifier,
      otp_code: data.otp_code,
      otp_type: data.otp_type,
      role: data.role || 'user'
    }, { showErrorToast: false });
  }

  /**
   * Set password after OTP verification
   * New endpoint for completing registration
   */
  async setPassword(data: {
    email: string;
    password: string;
  }): Promise<{ user: UserProfileResponse; message?: string }> {
    const response = await api.post<AuthApiResponse<UserProfileResponse>>('/auth/organizer/set-password', data, {
      returnFullResponse: true,
      showErrorToast: false,
    });

    return {
      user: response.data,
      message: response.message
    };
  }
}

export const authService = new AuthService();
