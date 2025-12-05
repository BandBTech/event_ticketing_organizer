"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  CalendarStarIcon,
  CaretDoubleLeftIcon,
  CaretDoubleRightIcon,
  CaretRightIcon,
  ChartLineIcon,
  GearIcon,
  SignOutIcon,
  SpeedometerIcon,
  TicketIcon,
  UserIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

import { useAuthStore } from "@/store/authStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/organizerDashboard", label: "Dashboard", icon: SpeedometerIcon },
  {
    href: "/organizerDashboard/pages/events",
    label: "Events",
    icon: CalendarStarIcon,
  },
  {
    href: "/organizerDashboard/reports",
    label: "Reports",
    icon: ChartLineIcon,
  },
  { href: "/organizerDashboard/pages/users", label: "Users", icon: UsersIcon },
  { href: "/organizerDashboard/settings", label: "Settings", icon: GearIcon },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/pages/login");
    } catch (error) {
      console.error("Logout error", error);
      router.push("/auth/pages/login");
    }
  };

  // Get user display name
  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : "User";
  const displayEmail = user?.email || "";
  const displayLogo = user?.organization?.logo_url || "/john.jpg";

  return (
    <aside
      className={`relative flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 ${collapsed ? "w-20" : "w-56"
        }`}
    >
      {/* Header with Logo and Collapse Button */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
        {collapsed ? (
          <div className="flex justify-center w-full">
            <TicketIcon size={28} className="text-blue-600" weight="duotone" />
          </div>
        ) : (
          <>
            <span className="text-xl font-bold text-blue-600">E-Ticket</span>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <CaretDoubleLeftIcon className="size-4 text-gray-500" />
            </button>
          </>
        )}
        {collapsed && (
          <button
            onClick={onToggle}
            className="absolute -right-3 top-6 z-50 bg-white border border-gray-300 rounded-lg shadow-sm p-1.5 text-gray-700 hover:text-gray-900 hover:shadow-md transition-all"
          >
            <CaretDoubleRightIcon className="size-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navLinks.map(({ href, label, icon: Icon }) => {
          // Check if current path matches or starts with the nav item path
          const isActive = pathname === `${href}/` || (href !== "/organizerDashboard" && pathname.startsWith(href));

          return (
            <Link key={href} href={href} className="no-underline">
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
                  <span className={`text-sm ${isActive ? "text-primary font-medium" : "text-gray-700 font-normal"}`}>
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
            <div className="flex items-center gap-3 p-3 border-b">
              <div className="relative w-10 h-10 shrink-0">
                <Image
                  src={displayLogo}
                  alt="User avatar"
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
              </div>
            </div>

            {/* Profile */}
            <DropdownMenuItem
              onClick={() => router.push("/organizerDashboard/settings")}
              className="cursor-pointer"
            >
              <UserIcon className="mr-2 h-4 w-4 text-gray-600" />
              <span className="text-gray-700">Profile</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Logout */}
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <SignOutIcon className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
