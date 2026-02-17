import { create } from 'zustand';
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
  _authChecked: boolean;

  // Actions
  login: (credentials: LoginRequest, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<{ message?: string }>;
  fetchProfile: () => Promise<void>;
  fetchOrganizerProfile: () => Promise<void>;
  clearError: () => void;
  resetState: () => void;
  checkAuth: () => void;
  checkOrganizerCompletion: () => Promise<void>;
  updateOrganizerProfile: (data: {
    business_name: string;
    business_description?: string;
    business_logo?: File;
  }) => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  isOrganizerRejected: () => boolean;
  isOrganizerPending: () => boolean;
  isOrganizerInactive: () => boolean;
  getOrganizationId: () => string | undefined;
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  // Initial state
  user: null,
  organizerProfile: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isOrganizerComplete: true, // Default to true to avoid flashing dialog
  _authChecked: false,

  // Login action
  login: async (credentials: LoginRequest, rememberMe: boolean = false) => {
    set({ isLoading: true, error: null });

    try {
      // tokenManager.setTokens is called inside authService.login
      await authService.login(credentials, rememberMe);

      // Fetch profile data sequentially to ensure state updates are applied in order
      // fetchOrganizerProfile depends on user state being set by fetchProfile
      await get().fetchProfile();
      await get().fetchOrganizerProfile();
      await get().checkOrganizerCompletion();
    } catch (error) {
      const errorMessage =
        error instanceof AuthError
          ? error.message
          : "Login failed. Please try again.";

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
      // authService.logout calls tokenManager.clearTokens in finally block
      set({
        user: null,
        organizerProfile: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isOrganizerComplete: true,
        _authChecked: true,
      });
      return result;
    } catch {
      // Clear state even on error
      set({
        user: null,
        organizerProfile: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isOrganizerComplete: true,
        _authChecked: true,
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
          : profile?.country_code && profile?.phone
            ? profile.country_code + profile.phone
            : profile?.phone,
        countryCode: profile.country_code,
        isEmailVerified: profile.is_email_verified,
        organizationId: profile.organization?.id || profile.organization_id,
        organization: profile.organization,
        organizerStatus: profile.organizer_status,
        organizationInfo: profile.organizer_info,
        roles: profile.roles || [],
        permissions: profile.permissions || [],
      };

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof AuthError ? error.message : "Failed to fetch profile";

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
      const currentUser = get().user;
      if (currentUser && orgProfile.organizer_id) {
        set({
          user: {
            ...currentUser,
            organizationId: orgProfile.organizer_id,
          },
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
  updateOrganizerProfile: async (data: {
    business_name: string;
    business_description?: string;
    business_logo?: File;
  }) => {
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
    return user.roles.includes(role);
  },

  // Check if user has a specific permission
  hasPermission: (permission: string) => {
    const { user } = get();
    if (!user || !user.permissions) return false;
    // admin:full overrides everything
    return (
      user.permissions.includes("admin:full") ||
      user.permissions.includes(permission)
    );
  },

  // Check if organizer is rejected
  isOrganizerRejected: () => {
    const { user } = get();
    if (user?.organizationInfo?.status === "rejected") {
      return true;
    }
    return false;
  },

  // Check if organizer is pending
  isOrganizerPending: () => {
    const { user } = get();
    if (user?.organizationInfo?.status === "pending") {
      return true;
    }
    return false;
  },

  // Check if organizer is inactive
  isOrganizerInactive: () => {
    const { user } = get();
    if (user?.organizationInfo?.status === "inactive") {
      return true;
    }
    return false;
  },

  // Get organization ID (primarily from organizer profile's organizer_id)
  getOrganizationId: () => {
    const { user, organizerProfile } = get();
    return (
      organizerProfile?.organizer_id ||
      user?.organization?.id ||
      user?.organizationId
    );
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Reset state (called when tokens are cleared)
  resetState: () => {
    set({
      user: null,
      organizerProfile: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isOrganizerComplete: true,
      _authChecked: true,
    });
  },

  // Check authentication status on app load
  // This is the ONLY place that validates auth state
  checkAuth: () => {
    // SYNCHRONOUS CHECK: Verify tokens exist FIRST
    const hasTokens = tokenManager.hasTokens();

    if (!hasTokens) {
      // NO TOKENS: Immediately clear state and mark as checked
      set({
        user: null,
        organizerProfile: null,
        isAuthenticated: false,
        isLoading: false,
        _authChecked: true,
      });
      return;
    }

    // Tokens exist - check if they're valid (not expired)
    const isAuth = authService.isAuthenticated();

    if (!isAuth) {
      // Tokens exist but are expired/invalid - clear them
      tokenManager.clearTokens();
      set({
        user: null,
        organizerProfile: null,
        isAuthenticated: false,
        isLoading: false,
        _authChecked: true,
      });
      return;
    }

    // Tokens are valid - fetch fresh profile data
    set({ isLoading: true });

    get()
      .fetchProfile()
      .then(() => get().fetchOrganizerProfile())
      .then(() => get().checkOrganizerCompletion())
      .catch(() => {
        // Profile fetch failed - clear everything
        tokenManager.clearTokens();
        set({
          user: null,
          organizerProfile: null,
          isAuthenticated: false,
          isLoading: false,
        });
      })
      .finally(() => {
        // Mark auth check as complete
        set({ _authChecked: true });
      });
  },
}));

// Register callback to reset store when tokens are cleared
tokenManager.setLogoutCallback(() => {
  useAuthStore.getState().resetState();
});
