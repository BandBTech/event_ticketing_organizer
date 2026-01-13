"use client";

import { BellIcon } from "@phosphor-icons/react";
import { Plus } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useMemo } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/app/organizerDashboard/components/LanguageSelector";
import { useAuthStore } from "@/store/authStore";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";

export default function DashboardHeader() {

  const router = useRouter();
  const rawPath = usePathname() ?? "/";
  const pathname = rawPath.replace(/\/+$/, "") || "/";
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";
  const { locale } = useLanguageStore();
  const { t } = useTranslation();
  // const { openCreateUserModal } = useUser();
  const { user, isOrganizerRejected, isOrganizerPending } = useAuthStore();

  /**
 * Get time-based greeting message
 */
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return t("greeting.morning", "Good Morning");
    if (hour < 17) return t("greeting.afternoon", "Good Afternoon");
    return t("greeting.evening", "Good Evening");
  };

  // Get user's first name or fallback
  const userName = user?.firstName || "there";
  const orgId = user?.organization?.id || user?.organizationId;

  const pageHeaders: { prefix: string; title: string; editTitle?: string; isDynamic?: boolean }[] = useMemo(() => [
    { prefix: "/organizerDashboard/event/create", title: t("event.createNewEvent", "Create New Event") },
    { prefix: "/organizerDashboard/event/details", title: t("event.eventDetails", "Event details") },
    { prefix: "/organizerDashboard/event/edit", title: t("event.editEvent", "Edit Event") },
    { prefix: "/organizerDashboard/event", title: t("navigation.events", "Events") },
    { prefix: "/organizerDashboard/settings", title: "" },
    { prefix: "/organizerDashboard/reports", title: t("navigation.reports", "Reports") },
    { prefix: "/organizerDashboard/users", title: t("navigation.users", "Users") },
    { prefix: "/organizerDashboard", title: "", isDynamic: true }, // Dynamic greeting
  ], [t]);

  // Dynamic greeting for dashboard
  const dynamicGreeting = useMemo(() => {
    return `${getGreeting()}, ${userName}!`;
  }, [userName, t]);

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

  // Determine edit mode for title
  const isActuallyEditing = pathname.endsWith("/edit") || pathname.endsWith("/edit/");

  // Use edit title if in edit mode and available, or dynamic greeting for dashboard
  const headerText = (isActuallyEditing || isEditMode)
    ? (t("event.editEvent", "Edit Event"))
    : matched?.isDynamic && matched.prefix === "/organizerDashboard"
      ? dynamicGreeting
      : (matched?.title ?? "Dashboard");

  // const isUsersPage = matched?.title === "Users";
  const isEventsPage = matched?.prefix === "/organizerDashboard/event";
  const isDashboard = pathname === "/organizerDashboard";

  // Don't show create button when editing an event, or if no organization
  const showCreateButton = (!isOrganizerRejected() || !isOrganizerPending()) && (isEventsPage || isDashboard) && !isEditMode && !!orgId;
  const createButtonLabel = t('event.createNewEvent', 'Create New Event');

  const handleCreateButton = () => {
    router.push("/organizerDashboard/event/create");
  };

  return (
    <div className="flex flex-1 items-center justify-between">
      <h2 className="text-lg text-gray-900 font-semibold">{headerText}</h2>

      <div className="flex items-center gap-3">
        <PermissionGuard permission={PERMISSIONS.EVENT_CREATE}>
          {showCreateButton && (
            <Button
              onClick={handleCreateButton}
              className="flex items-center gap-2 h-9 px-4"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{createButtonLabel}</span>
            </Button>
          )}
        </PermissionGuard>

        <LanguageSelector />

        <button className="flex items-center justify-center w-9 h-9 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
          <BellIcon className="h-4 w-4 text-gray-700" />
        </button>
      </div>
    </div>
  );
}
