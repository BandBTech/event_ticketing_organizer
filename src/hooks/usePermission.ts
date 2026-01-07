import { useCallback, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Permission } from '@/lib/permissions';

/**
 * Hook for checking user permissions and roles.
 * Provides a simple API for common access control checks in components.
 */
export function usePermission() {
    const { hasPermission, hasRole, user, isAuthenticated } = useAuthStore();

  const can = useCallback((permission: Permission | string) => hasPermission(permission), [hasPermission]);
  const canAll = useCallback((permissions: (Permission | string)[]) =>
    permissions.every(p => hasPermission(p)), [hasPermission]);
  const canAny = useCallback((permissions: (Permission | string)[]) =>
    permissions.some(p => hasPermission(p)), [hasPermission]);
  const is = useCallback((role: string) => hasRole(role), [hasRole]);
  const isAny = useCallback((roles: string[]) => roles.some(r => hasRole(r)), [hasRole]);

  return useMemo(() => ({
        /**
         * Check if user has a specific permission.
         * Automatically handles 'admin:full' override.
         */
      can,

        /**
         * Check if user has all of the specified permissions.
         */
      canAll,

        /**
         * Check if user has any of the specified permissions.
         */
      canAny,

        /**
         * Check if user has a specific role.
         */
      is,

        /**
         * Check if user has any of the specified roles.
         */
      isAny,

        /**
         * User profile and auth status.
         */
        user,
        isAuthenticated,
    }), [can, canAll, canAny, is, isAny, user, isAuthenticated]);
}
