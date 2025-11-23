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
  { href: "/staffDashboard", label: "Staff", icon: IdentificationBadgeIcon },
];

interface OrganizerProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  country_code?: string;
  business_logo_url?: string;
}

export default function Sidebar({
  showSidebar,
  setShowSidebar,
}: {
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<OrganizerProfile | null>(null);
  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {

    const loadProfile = async () => {
      try {
      const token = localStorage.getItem("auth_token");
    if (!token) return;

        const res = await fetch(
          "https://sandbox.timroticket.com/api/v1/auth/profile",
          {
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        const u = data.data || data.user || data;

        if (u) {
          setUser({
            id: u.id,
            first_name: u.first_name,
            last_name: u.last_name,
            email: u.email,
            phone: u.phone,
            country_code: u.country_code,
            business_logo_url: u.organizer?.organization?.logo_url || null,
          });
        }
      } catch (error) {
        console.error("Failed to get profile.", error);
      }
    };
    loadProfile();
  }, []);

  const handleLogout = async () => {
    try {
        const token = localStorage.getItem("auth_token");
    if (!token) return;
      await fetch("https://sandbox.timroticket.com/api/v1/auth/logout", {
        method: "POST",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Logout error", error);
    }

    localStorage.removeItem("auth_token");
    router.push("/auth/pages/login");
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

  return (
    <aside
      className={`relative transition-all duration-300 ${
        showSidebar ? "w-56" : "w-20"
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
                ${
                  isActive
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
          className="flex items-center gap-2 cursor-pointer p-2"
        >
          <div className="relative w-8 h-8">
            <Image
              src={user?.business_logo_url || "/john.jpg"}
              alt="User avatar"
              fill
              className="rounded-full object-cover"
            />
          </div>

          {showSidebar && (
            <>
              <span className="text-sm text-gray-700 font-medium">
                {user ? `${user.first_name} ${user.last_name}`.trim() : "Loading..."}
              </span>
              <CaretRightIcon className="h-4 w-4 text-gray-700" />
            </>
          )}
        </div>

        {/* DROPDOWN MENU */}
        {openMenu && (
          <div className="absolute bottom-16 left-4 w-56 bg-white shadow-xl rounded-xl border z-50 p-3 animate-slide-up">
            {/* Header */}
            <div className="flex items-center gap-3 pb-3 border-b">

              <div>
                <p className="text-sm font-semibold">
                  {user ? `${user.first_name} ${user.last_name}` : "Loading..."}
                </p>
                <p className="text-xs text-gray-500">{user?.email || "no email"}</p>
              </div>
            </div>

            {/* Profile */}
            <div
              onClick={() => router.push("/profile")}
              className=" flex items-center gap-2  p-2 text-sm hover:bg-gray-100 cursor-pointer rounded mt-2"
            >
              <UserIcon className="h-4 w-4" />
              Profile
            </div>

            {/* Logout */}
            <div
              onClick={handleLogout}
              className="flex items-center gap-2 p-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer rounded"
            >
              <SignOutIcon className="h-4 w-4" />
              Logout
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
