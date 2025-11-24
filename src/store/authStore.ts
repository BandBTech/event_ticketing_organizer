import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, AuthError } from '@/lib/authService';
import { tokenManager } from '@/lib/tokenManager';
import { AuthUser, LoginRequest } from '@/types/auth';

interface AuthStore {
  // State
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isOrganizerComplete: boolean;

  // Actions
  login: (credentials: LoginRequest, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<{ message?: string }>;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => void;
  checkOrganizerCompletion: () => Promise<void>;
  updateOrganizerProfile: (data: { business_name: string; business_description?: string; business_logo?: File }) => Promise<void>;
  hasRole: (role: string) => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isOrganizerComplete: true, // Default to true to avoid flashing dialog

      // Login action
      login: async (credentials: LoginRequest, rememberMe: boolean = false) => {
        set({ isLoading: true, error: null });

        try {
          // Call login API with remember me preference
          await authService.login(credentials, rememberMe);

          // Fetch user profile
          await get().fetchProfile();

          // Check organizer completion status
          await get().checkOrganizerCompletion();

        } catch (error) {
          const errorMessage = error instanceof AuthError
            ? error.message
            : 'Login failed. Please try again.';

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });

          throw error;
        }
      },

      // Logout action
      logout: async () => {
        set({ isLoading: true, error: null });

        try {
          const result = await authService.logout();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            isOrganizerComplete: true,
          });
          return result;
        } catch (error) {
          console.error('Logout error:', error);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            isOrganizerComplete: true,
          });
          return { message: undefined };
        }
      },

      // Fetch user profile
      fetchProfile: async () => {
        set({ isLoading: true, error: null });

        try {
          const profile = await authService.getProfile();

          // Transform to AuthUser
          // Note: The API response for /auth/profile returns a UserProfileResponse
          // which might need mapping to AuthUser if they differ significantly.
          // Based on previous code, we map it manually.

          const user: AuthUser = {
            id: profile.id,
            email: profile.email,
            firstName: profile.first_name,
            lastName: profile.last_name,
            phone: profile?.phone?.startsWith("+")
              ? profile?.phone
              : (profile?.country_code && profile?.phone ? profile.country_code + profile.phone : profile?.phone),
            countryCode: profile.country_code,
            isEmailVerified: profile.is_email_verified,
            organization: profile.organization,
            roles: (profile as any).roles || [], // Cast to any if roles are missing from type definition but present in API
          };

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof AuthError
            ? error.message
            : 'Failed to fetch profile';

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });

          throw error;
        }
      },

      // Check organizer completion
      checkOrganizerCompletion: async () => {
        try {
          const status = await authService.getOrganizerStatus();
          set({ isOrganizerComplete: status.is_complete });
        } catch (error) {
          console.error("Failed to check organizer status", error);
          // If check fails, assume complete to avoid blocking user? 
          // Or assume incomplete? Let's assume true to be safe against API errors blocking usage.
          set({ isOrganizerComplete: true });
        }
      },

      // Update organizer profile
      updateOrganizerProfile: async (data: { business_name: string; business_description?: string; business_logo?: File }) => {
        try {
          await authService.updateOrganizerProfile(data);
          // Re-check completion status after update
          await get().checkOrganizerCompletion();
        } catch (error) {
          console.error("Failed to update organizer profile", error);
          throw error;
        }
      },

      // Check if user has a specific role
      hasRole: (role: string) => {
        const { user } = get();
        if (!user || !user.roles) return false;
        return user.roles.some((r: any) => r.name === role || r === role);
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Check authentication status on app load
      checkAuth: () => {
        const hasTokens = tokenManager.hasTokens();
        const accessToken = tokenManager.getAccessToken();
        const refreshToken = tokenManager.getRefreshToken();
        const isAuth = authService.isAuthenticated();

        if (hasTokens && accessToken && refreshToken && isAuth) {
          // Restore cookies if they are missing (e.g. cleared but localStorage persists)
          // This prevents middleware from blocking access while client thinks we are logged in
          const rememberMe = tokenManager.isRememberMeEnabled();
          tokenManager.setTokens(accessToken, refreshToken, rememberMe);

          // Set loading while fetching profile
          set({ isLoading: true });

          // Try to fetch profile and check completion
          get().fetchProfile()
            .then(() => get().checkOrganizerCompletion())
            .catch(() => {
              // If profile fetch fails, clear everything
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
              });
            });
        } else {
          // Clear invalid tokens
          tokenManager.clearTokens();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      // Only persist user data, not loading/error states
      partialize: (state) => ({
        user: state.user,
        // Do not persist isAuthenticated to ensure checkAuth runs and restores cookies before redirect
        // isAuthenticated: state.isAuthenticated,
        isOrganizerComplete: state.isOrganizerComplete,
      }),
    }
  )
);
