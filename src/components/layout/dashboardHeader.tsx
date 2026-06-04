"use client";

import { BellIcon, List } from "@phosphor-icons/react";
import { Plus } from "lucide-react";
import { useRouter } from "next/router";
const useSearchParams = () => {
  const router = useRouter();
  return { get: (key: string) => router.query[key] as string };
};
const usePathname = () => useRouter().pathname;

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/organizerDashboard/LanguageSelector";
import { useAuthStore } from "@/store/authStore";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { useUIStore } from "@/store/uiStore";

export default function DashboardHeader() {
  const router = useRouter();
  const rawPath = usePathname() ?? "/";
  const pathname = rawPath.replace(/\/+$/, "") || "/";
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";
  const { locale } = useLanguageStore();
  const { t } = useTranslation();
  const { toggleSidebar, setShowCompleteProfileDialog } = useUIStore();
  const {
    user,
    isOrganizerRejected,
    isOrganizerPending,
    isOrganizerInactive,
    isOrganizerComplete,
  } = useAuthStore();

  const orgId = user?.organization?.id || user?.organizationId;

  const pageHeaders: { prefix: string; title: string; editTitle?: string }[] =
    useMemo(
      () => [
        {
          prefix: "/organizerDashboard/event/create",
          title: t("event.createNewEvent", "Create New Event"),
        },
        {
          prefix: "/organizerDashboard/event/details",
          title: t("event.eventDetails", "Event details"),
        },
        {
          prefix: "/organizerDashboard/event/edit",
          title: t("event.editEvent", "Edit Event"),
        },
        {
          prefix: "/organizerDashboard/event",
          title: t("navigation.events", "Events"),
        },
        {
          prefix: "/organizerDashboard/payouts",
          title: t("navigation.payouts", "Payouts"),
        },
        {
          prefix: "/organizerDashboard/settings",
          title: t("settings.title", "Settings"),
        },
        {
          prefix: "/organizerDashboard/reports",
          title: t("navigation.reports", "Reports"),
        },
        {
          prefix: "/organizerDashboard/users",
          title: t("navigation.users", "Users"),
        },
        {
          prefix: "/organizerDashboard",
          title: t("navigation.dashboard", "Dashboard"),
        },
        { prefix: "/staffDashboard/events", title: t("staffDashboard.events", "Events") },
        { prefix: "/staffDashboard", title: t("staffDashboard.dashboard", "Dashboard") },
      ],
      [t],
    );

  // Pick the best match (longest prefix first)
  const matched = pageHeaders
    .slice()
    .sort((a, b) => b.prefix.length - a.prefix.length)
    .find(
      (p) =>
        pathname === p.prefix ||
        pathname.startsWith(p.prefix + "/") ||
        pathname.startsWith(p.prefix),
    );

  // Determine edit mode for title
  const isActuallyEditing =
    pathname.endsWith("/edit") || pathname.endsWith("/edit/");

  const headerText =
    isActuallyEditing || isEditMode
      ? t("event.editEvent", "Edit Event")
      : (matched?.title ?? "Dashboard");

  const isEventsPage = matched?.prefix === "/organizerDashboard/event";

  // Don't show create button when editing an event, or if no organization, or if organizer is restricted
  const isOrganizerRestricted =
    isOrganizerRejected() || isOrganizerPending() || isOrganizerInactive();
  const isStaffDashboard = pathname.startsWith("/staffDashboard");
  const showCreateButton =
    !isOrganizerRestricted &&
    isEventsPage &&
    !isEditMode &&
    !!orgId &&
    !isStaffDashboard;
  const createButtonLabel = t("event.createNewEvent", "Create New Event");

  const handleCreateButton = () => {
    if (isOrganizerComplete === false) {
      setShowCompleteProfileDialog(true);
    } else {
      router.push("/organizerDashboard/event/create");
    }
  };

  return (
    <div className="flex flex-1 items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <List className="h-5 w-5 text-gray-600" />
        </button>
        <h2 className="text-2xl text-gray-900 font-medium">{headerText}</h2>
      </div>

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

        {/*<button className="flex items-center justify-center w-9 h-9 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
          <BellIcon className="h-4 w-4 text-gray-700" />
        </button>*/}
      </div>
    </div>
  );
}
