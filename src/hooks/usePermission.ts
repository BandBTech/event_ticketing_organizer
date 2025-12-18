'use client';

import { useAuthStore } from '@/store/authStore';
import { Permission } from '@/lib/permissions';

/**
 * Hook for checking user permissions and roles.
 * Provides a simple API for common access control checks in components.
 */
export function usePermission() {
    const { hasPermission, hasRole, user, isAuthenticated } = useAuthStore();

    return {
        /**
         * Check if user has a specific permission.
         * Automatically handles 'admin:full' override.
         */
        can: (permission: Permission | string) => hasPermission(permission),

        /**
         * Check if user has all of the specified permissions.
         */
        canAll: (permissions: (Permission | string)[]) =>
            permissions.every(p => hasPermission(p)),

        /**
         * Check if user has any of the specified permissions.
         */
        canAny: (permissions: (Permission | string)[]) =>
            permissions.some(p => hasPermission(p)),

        /**
         * Check if user has a specific role.
         */
        is: (role: string) => hasRole(role),

        /**
         * Check if user has any of the specified roles.
         */
        isAny: (roles: string[]) => roles.some(r => hasRole(r)),

        /**
         * User profile and auth status.
         */
        user,
        isAuthenticated,
    };
}
