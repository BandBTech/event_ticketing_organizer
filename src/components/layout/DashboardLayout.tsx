"use client";

import { Suspense, useRef, useEffect } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import DashboardHeader from "@/components/layout/dashboardHeader";
import { UserProvider } from "@/components/organizerDashboard/users/UserContext";
import { CompleteProfileDialog } from "@/components/organizer/CompleteProfileDialog";
import { ProtectedRoute } from "@/components/providers/ProtectedRoute";
import { useSidebarResponsive } from "@/hooks/useSidebarResponsive";

export default function DashboardLayout({
  children,
  role = ["organizer", "manager", "staff"],
}: {
  children: React.ReactNode;
  role?: ("admin" | "subadmin" | "organizer" | "manager" | "staff")[];
}) {
  useSidebarResponsive();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty(
          "--header-height",
          `${height}px`,
        );
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    const observer = new ResizeObserver(updateHeight);
    if (headerRef.current) observer.observe(headerRef.current);
    return () => {
      window.removeEventListener("resize", updateHeight);
      observer.disconnect();
    };
  }, []);

  return (
    <ProtectedRoute role={role} requireAll={false}>
      <UserProvider>
        <div className="flex h-screen overflow-hidden bg-gray-50/50">
          {/* Sidebar */}
          <AppSidebar />

          {/* Main Content Area */}
          <div className="flex flex-1 flex-col min-w-0">
            <header
              ref={headerRef}
              className="flex h-16 shrink-0 items-center gap-4 border-b px-4 lg:px-6"
            >
              <Suspense fallback={<div className="flex-1" />}>
                <DashboardHeader />
              </Suspense>
            </header>
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>

          <CompleteProfileDialog />
        </div>
      </UserProvider>
    </ProtectedRoute>
  );
}
