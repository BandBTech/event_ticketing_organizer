"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import DashboardHeader from "@/components/dashboardHeader";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showSidebar, setShowSidebar] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) router.push("/auth/pages/login");
    else setIsAuthenticated(true);
  }, [router]);

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Checking authentication...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Sidebar */}
      <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />

      {/* Main Content Area */}
      <div
        className={`flex flex-col transition-all duration-300 ${
          showSidebar ? "flex-1" : "w-full"
        }`}
      >
        <DashboardHeader />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
