"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { 
  CalendarStarIcon, 
  CaretDoubleLeftIcon, 
  CaretDoubleRightIcon, 
  CaretRightIcon, 
  HouseIcon, 
  TicketIcon, 
  UserIcon, 
} from "@phosphor-icons/react";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/permissions";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";

const navLinksData = [
  { href: "/staffDashboard", label: "Home", icon: HouseIcon, permission: PERMISSIONS.PROFILE_VIEW },
  { href: "/staffDashboard/events", label: "Events", icon: CalendarStarIcon, permission: PERMISSIONS.TICKET_READ },
  { href: "/organizerDashboard", label: "Organizer", icon: UserIcon, permission: [PERMISSIONS.EVENT_CREATE, PERMISSIONS.STAFF_MANAGE] }
];

export default function StaffSidebar() {
  const router = useRouter();
  const pathname = router.pathname;
  const { user } = useAuthStore();
  const { can, canAny } = usePermission();
  const { isCollapsed: showSidebar, toggleCollapse: setShowSidebar, sidebarOpen, setSidebarOpen } = useUIStore();

  const filteredNavLinks = navLinksData.filter(link => {
    if (!link.permission) return true;
    if (Array.isArray(link.permission)) {
      return canAny(link.permission);
    }
    return can(link.permission);
  });

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : "Staff Member";

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
        className={`fixed inset-y-0 left-0 z-50 md:relative flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 ${showSidebar ? "w-20 LG:w-20" : "w-56 LG:w-56"
          } ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex justify-between items-center px-4 py-6">
          {!showSidebar ? (
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
            onClick={setShowSidebar}
            className="absolute -right-3 top-6 z-50 bg-white border border-gray-300 rounded-lg shadow-sm p-1.5 text-gray-700 hover:text-gray-900 hover:shadow-md transition-all hidden md:block"
          >
            {showSidebar ? (
              <CaretDoubleRightIcon className="size-4" />
            ) : (
              <CaretDoubleLeftIcon className=" size-4" />
            )}
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-2">
          {filteredNavLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className="no-underline hover:no-underline"
                onClick={() => setSidebarOpen(false)}
              >
                <div
                  className={`group flex items-center gap-3 px-4 py-2 cursor-pointer transition-all
                  ${isActive
                    ? "border-l-2 border-blue-500 bg-blue-50"
                    : "border-l-2 border-transparent hover:border-blue-600 hover:bg-blue-50 "
                    } ${showSidebar ? "justify-center" : ""}`}
                >
                  <Icon className="text-blue-600" size={25} weight={isActive ? "fill" : "duotone"} />
                  {!showSidebar && (
                    <span className="text-gray-700 ">
                      {label}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="w-full border-t border-gray-300 p-4">
          <div className="flex items-center gap-2 cursor-pointer p-2">
            <div className="relative w-8 h-8">
              <Image
                src="/john.jpg"
                alt={displayName}
                fill
                className="rounded-full object-cover"
              />
            </div>
            {!showSidebar && (
              <>
                <span className="text-sm text-gray-700 font-medium truncate">{displayName}</span>
                <CaretRightIcon className="h-4 w-4 text-gray-500 " />
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
