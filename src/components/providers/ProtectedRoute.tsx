'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth, user, _hasHydrated } = useAuthStore();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Only run checkAuth after hydration is complete
    if (_hasHydrated) {
      checkAuth();
    }
  }, [_hasHydrated, checkAuth]);

  useEffect(() => {
    // Only proceed after:
    // 1. Hydration is complete (_hasHydrated = true)
    // 2. Auth check is not in progress (isLoading = false)
    if (_hasHydrated && !isLoading) {
      // Check if we have user data (from persisted storage) or are authenticated
      const hasUserData = !!user;

      if (!isAuthenticated && !hasUserData) {
    // No auth and no persisted user - redirect to login
        router.replace('/auth/pages/login');
      } else {
        // Either authenticated or have persisted user data - allow access
        setAuthChecked(true);
      }
    }
  }, [_hasHydrated, isAuthenticated, isLoading, router, user]);

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

  return <>{children}</>;
}
