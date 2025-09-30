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
} from "lucide-react";
import Image from "next/image";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/pages/events", label: "Events", icon: Calendar },
  { href: "/dashboard/reports", label: "Reports", icon: ChartLine },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="flex gap-1 items-center p-6 text-blue-600 font-bold text-xl"><Ticket/> E-Ticket</div>

      <nav className="flex-1 space-y-1 px-4 ">
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
                <Icon className="text-blue-600 w-5 h-5" />
                <span className="text-gray-700 dark:text-gray-300">
                  {label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="w-full border-t border-gray-300 dark:border-gray-700 p-4">
        <div className="flex  items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 ">
          <div className="relative w-8 h-8">
            <Image
              src="/john.jpg"
              alt="John Doe"
              fill
              className="rounded-full object-cover"
            />
          </div>
          <span className="text-sm font-medium">John Doe</span>

          <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-300" />
        </div>
      </div>
    </aside>
  );
}
