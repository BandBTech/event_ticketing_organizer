'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const channel = new BroadcastChannel('auth_channel');

    channel.onmessage = (event) => {
      if (event.data?.type === 'logout') {
        useAuthStore.setState({
          user: null,
          organizerProfile: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          isOrganizerComplete: true,
          _authChecked: true,
        });
        router.push('/login');
      }
    };

    return () => channel.close();
  }, [router]);

  return <>{children}</>;
}
