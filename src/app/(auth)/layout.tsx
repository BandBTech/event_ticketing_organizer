"use client";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authService } from "@/services/authService";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          // Double check with profile to ensure token is actually valid for session
          await authService.getProfile();
          router.push("/organizerDashboard");
        } else {
          setIsCheckingAuth(false);
        }
      } catch (error) {
        // Not authenticated or session expired
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isCheckingAuth) {
    return null; // Or a high-quality spinner
  }

  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      {/* Auth Header */}
      <Header />
      {/* Main Auth Content */}
      <main className="flex-grow grid">{children}</main>
      {/* Auth Footer */}
      <Footer />
    </div>
  );
}
