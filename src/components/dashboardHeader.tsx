"use client";

import { BellIcon, SignOutIcon } from "@phosphor-icons/react";
import { ChevronDown, Globe, Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

const pageHeaders: { prefix: string; title: string }[] = [
  { prefix: "/dashboard/pages/events", title: "Events" },
  { prefix: "/dashboard/pages/createevents", title: "Create new event" },
  { prefix: "/dashboard/pages/eventdetails", title: "Event details" },
];

export default function DashboardHeader() {
  const router = useRouter();
  const rawPath = usePathname() ?? "/";
  // Normalize trailing slash: "/dashboard/" -> "/dashboard"
  const pathname = rawPath.replace(/\/+$/, "") || "/";

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

  const headerText = matched?.title ?? "Dashboard";
  const showCreateButton =
    headerText === "Events" || headerText === "Dashboard";
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    router.push("/auth/pages/login");
  };
  return (
    <>
      <header className="flex items-center justify-between ">
        <h2 className="text-lg px-6 font-semibold">{headerText}</h2>

        <div className="flex  items-center gap-4 p-4">
          {showCreateButton && (
            <button
              onClick={() => router.push("/dashboard/pages/createevents")}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md"
            >
              <Plus className="h-4 w-4" />
              Create New Event
            </button>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md"
          >
            <SignOutIcon className="h-4 w-4" />
            Logout
          </button>
          <LanguageSelector />
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-full shadow-md cursor-pointer">
            <BellIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </div>
        </div>
      </header>
      <div className="w-full border-t border-gray-300 dark:border-gray-700" />
    </>
  );
}

function LanguageSelector() {
  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-full shadow-md cursor-pointer">
      <Globe className="h-4 w-4 text-gray-600 dark:text-gray-300" />
      <span className="text-sm font-medium">English</span>
      <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-300" />
    </div>
  );
}
