"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  CalendarStarIcon,
  CaretDoubleLeftIcon,
  CaretDoubleRightIcon,
  CaretRightIcon,
  ChartLineIcon,
  GearIcon,
  HouseIcon,
  SignOutIcon,
  SpeedometerIcon,
  TicketIcon,
  UserIcon,
  UsersIcon,
  WalletIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

import { useAuthStore } from "@/store/authStore";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/permissions";
import { useUIStore } from "@/store/uiStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useTranslation } from "@/hooks/useTranslation";
import { PermissionGuard } from "../auth/PermissionGuard";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { can, canAny, isAny } = usePermission();
  const { t } = useTranslation();

  const {
    isCollapsed: collapsed,
    toggleCollapse: onToggle,
    sidebarOpen,
    setSidebarOpen,
  } = useUIStore();

  const navLinks = [
    // Staff Links
    {
      href: "/staffDashboard",
      label: "Home",
      icon: HouseIcon,
      permission: PERMISSIONS.PROFILE_VIEW,
      role: ["staff"],
    },

    // Organizer Links
    {
      href: "/organizerDashboard",
      label: t("navigation.dashboard", "Dashboard"),
      icon: SpeedometerIcon,
      permission: PERMISSIONS.PROFILE_VIEW,
      role: ["organizer", "manager"],
    },
    {
      href: "/organizerDashboard/event",
      label: t("navigation.events", "Events"),
      icon: CalendarStarIcon,
      permission: PERMISSIONS.EVENT_READ,
      role: ["organizer", "manager"],
    },
    {
      href: "/organizerDashboard/reports",
      label: t("navigation.reports", "Reports"),
      icon: ChartLineIcon,
      permission: [PERMISSIONS.ANALYTICS_READ, PERMISSIONS.FINANCIAL_SUMMARY],
      role: ["organizer", "manager"],
    },
    {
      href: "/organizerDashboard/users",
      label: t("navigation.users", "Users"),
      icon: UsersIcon,
      permission: PERMISSIONS.USER_READ,
      role: ["organizer", "manager"],
    },
    {
      href: "/organizerDashboard/payouts",
      label: t("navigation.payouts", "Payouts"),
      icon: WalletIcon,
      permission: PERMISSIONS.PAYOUT_READ,
      role: ["organizer", "manager"],
    },
    {
      href: "/organizerDashboard/settings",
      label: t("navigation.settings", "Settings"),
      icon: GearIcon,
      permission: PERMISSIONS.PROFILE_VIEW,
    },
  ];

  const filteredNavLinks = navLinks.filter((link) => {
    // If user is rejected, pending, or inactive, only allow dashboard and settings
    if (
      user &&
      (useAuthStore.getState().isOrganizerRejected() ||
        useAuthStore.getState().isOrganizerPending() ||
        useAuthStore.getState().isOrganizerInactive())
    ) {
      return ["/organizerDashboard", "/organizerDashboard/settings"].includes(
        link.href,
      );
    }

    // Role check
    if (link.role && !isAny(link.role)) return false;

    if (!link.permission) return true;
    if (Array.isArray(link.permission)) {
      return canAny(link.permission);
    }
    return can(link.permission);
  });

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      router.push("/login");
    }
  };

  // Get user display name
  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "User";
  const displayEmail = user?.email || "";
  const displayLogo = user?.organization?.logo_url || "/john.jpg";

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 md:relative flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 ${collapsed ? "w-20" : "w-56"
          } ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Header with Logo and Collapse Button */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
          {collapsed ? (
            <div className="flex justify-center w-full">
              <TicketIcon
                size={28}
                className="text-blue-600"
                weight="duotone"
              />
            </div>
          ) : (
            <>
              <span className="text-xl font-bold text-blue-600">E-Ticket</span>
              <button
                onClick={onToggle}
                className="hidden md:block p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <CaretDoubleLeftIcon className="size-4 text-gray-500" />
              </button>
            </>
          )}
          {collapsed && (
            <button
              onClick={onToggle}
              className="absolute -right-3 top-6 z-50 bg-white border border-gray-300 rounded-lg shadow-sm p-1.5 text-gray-700 hover:text-gray-900 hover:shadow-md transition-all hidden md:block"
            >
              <CaretDoubleRightIcon className="size-4" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {filteredNavLinks.map(({ href, label, icon: Icon }) => {
            // Check if current path matches or starts with the nav item path
            // specific handling for multiple dashboard roots
            const isActive =
              pathname === href ||
              (pathname.startsWith(`${href}/`) &&
                href !== "/organizerDashboard" &&
                href !== "/staffDashboard");

            return (
              <Link
                key={href}
                href={href}
                className="no-underline"
                onClick={() => setSidebarOpen(false)}
              >
                <div
                  className={`group flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all relative ${isActive
                    ? "active-menu text-primary font-medium before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-primary before:shadow-md"
                    : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                    } ${collapsed ? "justify-center" : ""}`}
                >
                  <Icon
                    className={`${isActive ? "text-primary" : "text-gray-500 group-hover:text-gray-700"}`}
                    size={22}
                    weight={isActive ? "fill" : "duotone"}
                  />
                  {!collapsed && (
                    <span
                      className={`text-sm ${isActive ? "text-primary font-medium" : "text-gray-700 font-normal"}`}
                    >
                      {label}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t border-gray-200 p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                className={`flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors ${collapsed ? "justify-center" : ""
                  }`}
              >
                <div className="relative w-9 h-9 shrink-0">
                  <Image
                    src={displayLogo}
                    alt="User avatar"
                    fill
                    className="rounded-full object-cover"
                  />
                </div>

                {!collapsed && (
                  <div className="flex flex-1 items-center justify-between overflow-hidden">
                    <span className="text-sm text-gray-800 font-medium truncate">
                      {displayName}
                    </span>
                    <CaretRightIcon className="h-4 w-4 text-gray-400 shrink-0 ml-1" />
                  </div>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-64 rounded-xl"
              side={collapsed ? "right" : "top"}
              align="start"
              sideOffset={8}
            >
              {/* Header */}
              <div className="p-3 border-b">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {displayEmail}
                </p>
              </div>

              {/* Profile */}
              <DropdownMenuItem
                onClick={() => {
                  router.push("/organizerDashboard/settings");
                  setSidebarOpen(false);
                }}
                className="cursor-pointer"
              >
                <UserIcon className="mr-2 h-4 w-4 text-gray-600" />
                <span className="text-gray-700">
                  {t("navigation.profile", "Profile")}
                </span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Logout */}
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <SignOutIcon className="mr-2 h-4 w-4" />
                <span>{t("navigation.logout", "Logout")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  );
}
