import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services/authService';
import { AuthError } from '@/lib/errors';
import { tokenManager } from '@/lib/tokenManager';
import { AuthUser, LoginRequest, OrganizerProfile } from '@/types/auth';

interface AuthStore {
  // State
  user: AuthUser | null;
  organizerProfile: OrganizerProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isOrganizerComplete: boolean;
  _hasHydrated: boolean;

  // Actions
  login: (credentials: LoginRequest, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<{ message?: string }>;
  fetchProfile: () => Promise<void>;
  fetchOrganizerProfile: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => void;
  checkOrganizerCompletion: () => Promise<void>;
  updateOrganizerProfile: (data: { business_name: string; business_description?: string; business_logo?: File }) => Promise<void>;
  hasRole: (role: string) => boolean;
  getOrganizationId: () => string | undefined;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      organizerProfile: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isOrganizerComplete: true, // Default to true to avoid flashing dialog
      _hasHydrated: false,

      // Hydration setter
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),

      // Login action
      login: async (credentials: LoginRequest, rememberMe: boolean = false) => {
        set({ isLoading: true, error: null });

        try {
          // Call login API with remember me preference
          await authService.login(credentials, rememberMe);

          // Fetch user profile and organizer profile
          await get().fetchProfile();
          await get().fetchOrganizerProfile();

          // Check organizer completion status
          await get().checkOrganizerCompletion();

        } catch (error) {
          const errorMessage = error instanceof AuthError
            ? error.message
            : 'Login failed. Please try again.';

          set({
            user: null,
            organizerProfile: null,
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
            organizerProfile: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            isOrganizerComplete: true,
          });
          return result;
        } catch {
          set({ isLoading: false });
          set({
            user: null,
            organizerProfile: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            isOrganizerComplete: true,
          });
          return { message: undefined };
        }
      },

      // Fetch user profile from /auth/profile
      fetchProfile: async () => {
        set({ isLoading: true, error: null });

        try {
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
            // Organization ID will come from organizer profile (organizer_id)
            organizationId: profile.organization?.id || profile.organization_id,
            organization: profile.organization,
            roles: profile.roles || [],
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

      // Fetch organizer profile from /organizer/profile
      fetchOrganizerProfile: async () => {
        try {
          const orgProfile = await authService.getOrganizerProfile();

          set({ organizerProfile: orgProfile });

          // Update user's organizationId with organizer_id from organizer profile
          // According to API, organizer_id is the organization ID for team management
          const currentUser = get().user;
          if (currentUser && orgProfile.organizer_id) {
            set({
              user: {
                ...currentUser,
                organizationId: orgProfile.organizer_id,
              }
            });
          }
        } catch (error) {
          console.warn("Failed to fetch organizer profile:", error);
          // Don't throw - organizer profile is optional/supplementary
        }
      },

      // Check organizer completion
      checkOrganizerCompletion: async () => {
        try {
          const status = await authService.getOrganizerStatus();
          set({ isOrganizerComplete: status.is_complete });
        } catch {
          // If check fails, assume complete to avoid blocking user
          set({ isOrganizerComplete: true });
        }
      },

      // Update organizer profile
      updateOrganizerProfile: async (data: { business_name: string; business_description?: string; business_logo?: File }) => {
        try {
          await authService.updateOrganizerProfile(data);
          // Re-fetch organizer profile and check completion status after update
          await get().fetchOrganizerProfile();
          await get().checkOrganizerCompletion();
        } catch (error) {
          throw error;
        }
      },

      // Check if user has a specific role
      hasRole: (role: string) => {
        const { user } = get();
        if (!user || !user.roles) return false;
        return user.roles.some((r: string | { name: string }) =>
          typeof r === 'string' ? r === role : r.name === role
        );
      },

      // Get organization ID (primarily from organizer profile's organizer_id)
      getOrganizationId: () => {
        const { user, organizerProfile } = get();
        // Priority: organizer_id from organizer profile > organization.id > organization_id from user
        return organizerProfile?.organizer_id || user?.organization?.id || user?.organizationId;
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

          // Try to fetch profile, organizer profile, and check completion
          get().fetchProfile()
            .then(() => get().fetchOrganizerProfile())
            .then(() => get().checkOrganizerCompletion())
            .catch(() => {
              // If profile fetch fails, clear everything
              set({
                user: null,
                organizerProfile: null,
                isAuthenticated: false,
                isLoading: false,
              });
            });
        } else {
          // Clear invalid tokens
          tokenManager.clearTokens();
          set({
            user: null,
            organizerProfile: null,
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
        organizerProfile: state.organizerProfile,
        // Do not persist isAuthenticated to ensure checkAuth runs and restores cookies before redirect
        // isAuthenticated: state.isAuthenticated,
        isOrganizerComplete: state.isOrganizerComplete,
      }),
      // Called when hydration from localStorage completes
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
