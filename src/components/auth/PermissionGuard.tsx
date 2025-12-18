'use client';

import { ReactNode } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { Permission } from '@/lib/permissions';

interface PermissionGuardProps {
    children: ReactNode;
    /**
     * Permission(s) required to view the children.
     * If an array is provided, either all or any can be required based on `requireAll`.
     */
    permission?: Permission | Permission[];
    /**
     * Role(s) required to view the children.
     */
    role?: string | string[];
    /**
     * If true, all provided permissions/roles are required.
     * If false, any of the provided permissions/roles are sufficient.
     * Default: true
     */
    requireAll?: boolean;
    /**
     * Optional fallback UI to show if permission is denied.
     */
    fallback?: ReactNode;
}

/**
 * A declarative component for wrapping UI elements that require specific permissions or roles.
 */
export function PermissionGuard({
    children,
    permission,
    role,
    requireAll = true,
    fallback = null,
}: PermissionGuardProps) {
    const { can, canAll, canAny, is, isAny } = usePermission();

    let hasPermission = true;
    let hasRole = true;

    // Check permissions
    if (permission) {
        if (Array.isArray(permission)) {
            hasPermission = requireAll ? canAll(permission) : canAny(permission);
        } else {
            hasPermission = can(permission);
        }
    }

    // Check roles
    if (role) {
        if (Array.isArray(role)) {
            hasRole = requireAll ? role.every(r => is(r)) : isAny(role);
        } else {
            hasRole = is(role);
        }
    }

    // Combine results based on requireAll
    const isAllowed = requireAll
        ? hasPermission && hasRole
        : hasPermission || hasRole;

    if (!isAllowed) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
