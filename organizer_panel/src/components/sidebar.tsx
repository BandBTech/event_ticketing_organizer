"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  ChartLine,
  Settings,
  ChevronRight,
  Ticket,
  ChevronLeft,
} from "lucide-react";
import Image from "next/image";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/pages/events", label: "Events", icon: Calendar },
  { href: "/dashboard/reports", label: "Reports", icon: ChartLine },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({
  showSidebar,
  setShowSidebar,
}: {
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={`transition-all duration-300 ${
        showSidebar ? "w-56" : "w-auto"
      } overflow-hidden min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col`}
    >
      <div className="flex justify-between items-center px-4 py-6">
        {showSidebar && (
          <div className="flex gap-2 items-center text-blue-600 font-bold text-xl">
            <Ticket className="w-6 h-6" />
            {showSidebar && <span> E-Ticket</span>}
          </div>
        )}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="m-2 text-gray-700 hover:text-gray-700 dark:text-gray-300"
        >
          {showSidebar ? (
            <ChevronLeft className="w-5 h-5 border rounded-lg  shadow-sm" />
          ) : (
            <ChevronRight className="flex w-5 h-5 border rounded-lg  shadow-sm" />
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
                    ? "border-l-2 border-blue-500 bg-blue-50 dark:bg-blue-950"
                    : "border-l-2 border-transparent hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="text-blue-600" />
                {showSidebar && (
                  <span className="text-gray-700 dark:text-gray-300">
                    {label}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      
        <div className="w-full border-t border-gray-300 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 cursor-pointer dark:hover:bg-gray-700 p-2">
            <div className="relative w-8 h-8">
              <Image
                src="/john.jpg"
                alt="John Doe"
                fill
                className="rounded-full object-cover"
              />
            </div>
            {showSidebar && (
              <>
            <span className="text-sm font-medium">John Doe</span>
            <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-300" />
             </>)}
          </div>
        </div>
     
    </aside>
  );
}
