"use client";

import { Suspense, useState } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import DashboardHeader from "@/components/layout/dashboardHeader";
import { UserProvider } from "@/app/contexts/UserContext";
import { CompleteProfileDialog } from "@/components/organizer/CompleteProfileDialog";
import { ProtectedRoute } from "@/components/providers/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <ProtectedRoute>
      <UserProvider>
        <div className="flex h-screen overflow-hidden bg-gray-50/50">
        {/* Sidebar */}
        <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center gap-4 border-b px-6">
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
