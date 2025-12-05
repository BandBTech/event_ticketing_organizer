"use client";

import { BellIcon } from "@phosphor-icons/react";
import { Plus } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useMemo } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/app/organizerDashboard/components/LanguageSelector";
import { useAuthStore } from "@/store/authStore";

/**
 * Get time-based greeting message
 */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

const pageHeaders: { prefix: string; title: string; editTitle?: string; isDynamic?: boolean }[] = [
  { prefix: "/organizerDashboard/pages/events", title: "Events" },
  { prefix: "/organizerDashboard/settings", title: "" },
  { prefix: "/organizerDashboard/reports", title: "Reports" },
  { prefix: "/organizerDashboard", title: "", isDynamic: true }, // Dynamic greeting
  { prefix: "/organizerDashboard/pages/createevents", title: "Create new event", editTitle: "Edit Event" },
  { prefix: "/organizerDashboard/pages/eventdetails", title: "Event details" },
  { prefix: "/organizerDashboard/pages/users", title: "Users" },
];

export default function DashboardHeader() {
  const router = useRouter();
  const rawPath = usePathname() ?? "/";
  const pathname = rawPath.replace(/\/+$/, "") || "/";
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";
  const { openCreateUserModal } = useUser();
  const { user } = useAuthStore();

  // Get user's first name or fallback
  const userName = user?.firstName || "there";

  // Dynamic greeting for dashboard
  const dynamicGreeting = useMemo(() => {
    return `${getGreeting()}, ${userName}!`;
  }, [userName]);

  // Pick the best match (longest prefix first)
  const matched = pageHeaders
    .slice()
    .sort((a, b) => b.prefix.length - a.prefix.length)
    .find(
      (p) =>
        pathname === p.prefix ||
        pathname.startsWith(p.prefix + "/") ||
        pathname.startsWith(p.prefix)
    );

  // Use edit title if in edit mode and available, or dynamic greeting for dashboard
  const headerText = isEditMode && matched?.editTitle
    ? matched.editTitle
    : matched?.isDynamic
      ? dynamicGreeting
      : (matched?.title ?? "Dashboard");

  const isUsersPage = matched?.title === "Users";
  const isEventsPage = matched?.title === "Events";
  const isDashboard = pathname === "/organizerDashboard";
  const isCreateEventsPage = pathname.startsWith("/organizerDashboard/pages/createevents");

  // Don't show create button when editing an event
  const showCreateButton = (isUsersPage || isEventsPage || isDashboard) && !isEditMode;
  const createButtonLabel = isUsersPage ? "Create New User" : "Create New Event";

  const handleCreateButton = () => {
    if (isUsersPage) {
      openCreateUserModal();
    } else {
      router.push("/organizerDashboard/pages/createevents");
    }
  };

  return (
    <div className="flex flex-1 items-center justify-between">
      <h2 className="text-lg text-gray-900 font-semibold">{headerText}</h2>

      <div className="flex items-center gap-3">
        {showCreateButton && (
          <Button
            onClick={handleCreateButton}
            className="flex items-center gap-2 h-9 px-4"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{createButtonLabel}</span>
          </Button>
        )}

        <LanguageSelector />

        <button className="flex items-center justify-center w-9 h-9 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
          <BellIcon className="h-4 w-4 text-gray-700" />
        </button>
      </div>
    </div>
  );
}
