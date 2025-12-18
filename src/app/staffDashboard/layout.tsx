"use client";
import { useState } from "react";
import Sidebar from "@/app/staffDashboard/components/staffSidebar";
import Header from "@/app/staffDashboard/components/staffHeader";
import { ProtectedRoute } from "@/components/providers/ProtectedRoute";


export default function StaffDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showSidebar, setShowSidebar] = useState(true);
  return (
    <ProtectedRoute role={["admin", "subadmin", "organizer", "manager", "staff"]} requireAll={false}>
      <div className="flex min-h-screen bg-gray-50 ">
        <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
        <div className="flex flex-col flex-1 transition-all duration-300 ">
          <Header />
          <main className="flex-1 overflow-auto p-4">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

