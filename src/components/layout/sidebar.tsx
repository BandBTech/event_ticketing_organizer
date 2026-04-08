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
  IdentificationBadgeIcon,
  SignOutIcon,
  SpeedometerIcon,
  TicketIcon,
  UserIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "/organizerDashboard", label: "Dashboard", icon: SpeedometerIcon },
  {
    href: "/organizerDashboard/event",
    label: "Events",
    icon: CalendarStarIcon,
  },
  {
    href: "/organizerDashboard/reports",
    label: "Reports",
    icon: ChartLineIcon,
  },
  { href: "/organizerDashboard/users", label: "Users", icon: UsersIcon },
  { href: "/organizerDashboard/settings", label: "Settings", icon: GearIcon },
  { href: "/staffDashboard", label: "Staff", icon: IdentificationBadgeIcon },
];



import { useAuthStore } from "@/store/authStore";
import { navigationGuard } from "@/store/navigationGuardStore";

// ... existing imports ...

export default function Sidebar({
  showSidebar,
  setShowSidebar,
}: {
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [openMenu, setOpenMenu] = useState(false);

  const handleLogout = () => {
    navigationGuard.navigate(async () => {
      try {
        await logout();
      } catch {
        // ignore
      }
      router.push("/login");
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu')) {
        setOpenMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Get user display name
  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : "User";
  const displayEmail = user?.email || "";
  const displayLogo = user?.organization?.logo_url || "/john.jpg";

  return (
    <aside
      className={`relative transition-all duration-300 ${showSidebar ? "w-56" : "w-20"
        }  min-h-screen bg-white  border-r border-gray-200 flex flex-col`}
    >
      <div className="flex justify-between items-center px-4 py-6">
        {showSidebar ? (
          <div className="flex gap-2 items-center text-blue-600 font-bold text-xl">
            <TicketIcon size={25} />
            <span> Timro-Ticket</span>
          </div>
        ) : (
          <div className="flex justify-center w-full">
            <TicketIcon size={25} className="text-blue-600" />
          </div>
        )}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="absolute -right-3 top-6 z-50 bg-white  border border-gray-300  rounded-lg shadow-sm p-1.5 text-gray-700 hover:text-gray-900  hover:shadow-md transition-all"
        >
          {showSidebar ? (
            <CaretDoubleLeftIcon className="size-4" />
          ) : (
            <CaretDoubleRightIcon className=" size-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className="no-underline hover:no-underline"
            >
              <div
                className={`group flex items-center gap-3 px-4 py-2 cursor-pointer transition-all
                ${isActive
                    ? "border-l-2 border-blue-500 bg-blue-50 "
                    : "border-l-2 border-transparent hover:border-blue-600 hover:bg-blue-50 "
                  }`}
              >
                <Icon className="text-blue-600" size={25} />
                {showSidebar && <span className="text-gray-700 ">{label}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="w-full border-t border-gray-300 p-4 relative user-menu">
        <div
          onClick={() => setOpenMenu(!openMenu)}
          className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div className="relative w-8 h-8 flex-shrink-0">
            <Image
              src={displayLogo}
              alt="User avatar"
              fill
              className="rounded-full object-cover"
            />
          </div>

          {showSidebar && (
            <div className="flex flex-1 items-center justify-between overflow-hidden">
              <div className="flex flex-col min-w-0">
                <span className="text-sm text-gray-700 font-medium truncate">
                  {displayName}
                </span>
                <span className="text-xs text-gray-500 truncate">
                  {displayEmail}
                </span>
              </div>
              <CaretRightIcon className="h-4 w-4 text-gray-700 flex-shrink-0 ml-1" />
            </div>
          )}
        </div>

        {/* DROPDOWN MENU */}
        {openMenu && (
          <div className="absolute bottom-20 left-4 w-64 bg-white shadow-xl rounded-xl border z-50 p-3 animate-slide-up">
            {/* Header */}
            <div className="flex items-center gap-3 pb-3 border-b mb-2">
              <div className="relative w-10 h-10 flex-shrink-0">
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
            <Link
              href="/organizerDashboard/settings"
              onClick={() => setOpenMenu(false)}
              className="flex items-center gap-2 p-2 text-sm hover:bg-gray-100 cursor-pointer rounded transition-colors"
            >
              <UserIcon className="h-4 w-4 text-gray-600" />
              <span className="text-gray-700">Profile</span>
            </Link>

            {/* Logout */}
            <div
              onClick={handleLogout}
              className="flex items-center gap-2 p-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer rounded transition-colors mt-1"
            >
              <SignOutIcon className="h-4 w-4" />
              <span>Logout</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
