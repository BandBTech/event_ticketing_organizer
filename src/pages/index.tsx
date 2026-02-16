"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/authStore";

export default function Home() {
  const router = useRouter();

  const { isAuthenticated, user, _authChecked } = useAuthStore();

  useEffect(() => {
    if (!_authChecked) return;

    if (isAuthenticated && user) {
      if (user.roles?.includes('staff') || user.roles?.includes('manager')) {
        router.replace("/staffDashboard");
      } else {
        router.replace("/organizerDashboard");
      }
    } else {
      router.replace("/login");
    }
  }, [_authChecked, isAuthenticated, user, router]);

  return null;
}
