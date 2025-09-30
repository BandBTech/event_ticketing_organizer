"use client";

import { ChevronDown, Globe, Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";


const pageHeaders: { prefix: string; title: string }[] = [
  { prefix: "/dashboard/pages/events", title: "Events" },
  { prefix: "/dashboard/pages/createevents", title: "Create new event" },
  { prefix: "/dashboard", title: "Good Evening John Doe!" }, 
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
    .find((p) => pathname === p.prefix || pathname.startsWith(p.prefix + "/") || pathname.startsWith(p.prefix));

  const headerText = matched?.title ?? "Dashboard";
  const isDasboard = pathname === "/dashboard";
  const isEvents = pathname.startsWith("/dashboard/pages/events");
  const isCreateEvent = pathname ==="/dashboard/pages/createevents";

  if (isDasboard || isEvents) {
    return (
    <>
      <header className="flex items-center justify-between ">
        <h2 className="text-lg px-4 font-semibold">{headerText}</h2>

        <div className="flex  items-center gap-4 p-4">
          <button
          onClick={() => router.push("/dashboard/pages/createevents")}
           className="flex items-center gap-2 bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md">
            <Plus className="h-4 w-4" />
            Create New Event
          </button>

          <LanguageSelector/>
        </div>
      </header>
       <div className="w-full border-t border-gray-300 dark:border-gray-700" />
</>
    );
  }
  if (isCreateEvent) {
    return (
      <>
        <header className="flex items-center justify-between">
          <h2 className="text-lg px-4 font-semibold">{headerText}</h2>
          <div className="flex items-center gap-4 p-4">
            <LanguageSelector />
          </div>
        </header>
        <div className="w-full border-t border-gray-300 dark:border-gray-700" />
      </>
    );
  }
  return <h2 className="text-2xl font-semibold mb-4">{headerText}</h2>;
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