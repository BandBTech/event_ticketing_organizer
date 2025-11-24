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

  // Actions
  login: (credentials: LoginRequest, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<{ message?: string }>;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login action
      login: async (credentials: LoginRequest, rememberMe: boolean = false) => {
        set({ isLoading: true, error: null });

        try {
          // Call login API with remember me preference
          await authService.login(credentials, rememberMe);

          // Fetch user profile
          const profile = await authService.getProfile();

          // Transform to AuthUser
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
            roles: [], // Profile endpoint doesn't return roles in the API doc
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
          });
          return result;
        } catch (error) {
          console.error('Logout error:', error);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          return { message: undefined };
        }
      },

      // Fetch user profile
      fetchProfile: async () => {
        set({ isLoading: true, error: null });

        try {
          const profile = await authService.getProfile();

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
            roles: [],
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

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Check authentication status on app load
      checkAuth: () => {
        const hasTokens = tokenManager.hasTokens();
        const isAuth = authService.isAuthenticated();

        if (hasTokens && isAuth) {
          // Set loading while fetching profile
          set({ isLoading: true });

          // Try to fetch profile
          get().fetchProfile().catch(() => {
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
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
