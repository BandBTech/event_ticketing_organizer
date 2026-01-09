'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Permission } from '@/lib/permissions';
import { usePermission } from '@/hooks/usePermission';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission?: Permission | Permission[];
  role?: string | string[];
  requireAll?: boolean;
}

export function ProtectedRoute({
  children,
  permission,
  role,
  requireAll = true
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth, user, _hasHydrated } = useAuthStore();
  const { can, canAll, canAny, is, isAny } = usePermission();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(true);

  // No need for checkAuth here, it's handled by AuthProvider at the root level.
  // Calling it here causes infinite loops when nested ProtectedRoutes toggle isLoading status.

  useEffect(() => {
    // Only proceed after:
    // 1. Hydration is complete (_hasHydrated = true)
    // 2. Auth check is not in progress (isLoading = false)
    if (_hasHydrated && !isLoading) {
      // Check if we have user data (from persisted storage) or are authenticated
      const hasUserData = !!user;

      if (!isAuthenticated && !hasUserData) {
        // No auth and no persisted user - redirect to login
        router.replace('/login');
      } else {
        // Check authorization if permission or role is required
        let allowed = true;

        if (permission) {
          if (Array.isArray(permission)) {
            allowed = requireAll ? canAll(permission) : canAny(permission);
          } else {
            allowed = can(permission);
          }
        }

        if (allowed && role) {
          if (Array.isArray(role)) {
            allowed = requireAll ? role.every(r => is(r)) : isAny(role);
          } else {
            allowed = is(role);
          }
        }

        setIsAuthorized(allowed);
        setAuthChecked(true);
      }
    }
  }, [_hasHydrated, isAuthenticated, isLoading, router, user, permission, role, requireAll, can, canAll, canAny, is, isAny]);

  // Show loading state while:
  // 1. Waiting for hydration
  // 2. Checking authentication
  // 3. Auth check not complete
  if (!_hasHydrated || isLoading || !authChecked) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated and no user data
  if (!isAuthenticated && !user) {
    return null;
  }

  // Show access denied if authenticated but not authorized
  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center gap-4 text-center p-6 max-w-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-sm text-muted-foreground">
            You do not have the necessary permissions to access this page. Please contact your administrator if you believe this is an error.
          </p>
          <button
            onClick={() => router.back()}
            className="mt-2 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
