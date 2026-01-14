'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Permission } from '@/lib/permissions';
import { usePermission } from '@/hooks/usePermission';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguageStore } from '@/store/languageStore';
import { tokenManager } from '@/lib/tokenManager';

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
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const router = useRouter();
  const { isAuthenticated, isLoading, _authChecked } = useAuthStore();
  const { can, canAll, canAny, is, isAny } = usePermission();
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [routeChecked, setRouteChecked] = useState(false);

  useEffect(() => {
    // Only proceed after auth check is complete and not loading
    if (_authChecked && !isLoading) {
      // Check if tokens exist
      const hasTokens = tokenManager.hasTokens();

      if (!hasTokens || !isAuthenticated) {
      // No tokens or not authenticated - redirect to login
        router.replace('/login');
        return;
      }

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
      setRouteChecked(true);
    }
  }, [_authChecked, isAuthenticated, isLoading, router, permission, role, requireAll, can, canAll, canAny, is, isAny]);

  // Show loading state while auth check in progress
  if (!_authChecked || isLoading || !routeChecked) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">{t("common.loading", "Loading...")}</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
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
          <h1 className="text-2xl font-bold text-gray-900">{t("common.accessDenied", "Access Denied")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("common.accessDeniedMessage", "You do not have the necessary permissions to access this page. Please contact your administrator if you believe this is an error.")}
          </p>
          <button
            onClick={() => router.back()}
            className="mt-2 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {t("common.goBack", "Go Back")}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
