"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import DashboardHeader from "@/components/layout/dashboardHeader";
import { UserProvider } from "@/app/contexts/UserContext";
import { CompleteProfileDialog } from "@/components/organizer/CompleteProfileDialog";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <UserProvider>
      <div className="flex min-h-screen bg-gray-50/50">
        {/* Sidebar */}
        <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-white px-6">
            <DashboardHeader />
          </header>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>

        <CompleteProfileDialog />
      </div>
    </UserProvider>
  );
}
