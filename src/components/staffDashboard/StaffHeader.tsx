"use client";

import { BellIcon, List } from "@phosphor-icons/react";
import { ChevronDown, Globe } from "lucide-react";
import { useRouter } from "next/router";
import React, { useMemo } from "react";
import { useUIStore } from "@/store/uiStore";

export default function StaffHeader() {
  const router = useRouter();
  const rawPath = router.pathname ?? "/";
  const pathname = rawPath.replace(/\/+$/, "") || "/";
  const { toggleSidebar } = useUIStore();

  const pageHeaders: { prefix: string; title: string }[] = useMemo(() => [
    { prefix: "/staffDashboard", title: "Good Evening Staff!" },
  ], []);

  const matched = pageHeaders
    .slice()
    .sort((a, b) => b.prefix.length - a.prefix.length)
    .find(
      (p) =>
        pathname === p.prefix ||
        pathname.startsWith(p.prefix + "/") ||
        pathname.startsWith(p.prefix)
    );

  const headerText = matched?.title ?? "Staff Dashboard";

  return (
    <>
      <header className="flex items-center justify-between ">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 ml-4 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <List className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-lg text-gray-700 font-semibold">{headerText}</h2>
        </div>

        <div className="flex  items-center gap-4 p-4">
          <LanguageSelector />
          <div className="flex items-center gap-1 bg-gray-100 px-3 py-2 rounded-full shadow-md cursor-pointer">
            <BellIcon className="h-4 w-4 text-gray-600 " />
          </div>
        </div>
      </header>
      <div className="w-full border-t border-gray-300 " />
    </>
  );
}

function LanguageSelector() {
  return (
    <div className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-full shadow-md cursor-pointer">
      <Globe className="h-4 w-4 text-gray-600 " />
      <span className="text-sm font-medium">English</span>
      <ChevronDown className="h-4 w-4 text-gray-500" />
    </div>
  );
}
