"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { CalendarStarIcon, CaretDoubleLeftIcon, CaretDoubleRightIcon, CaretRightIcon, ChartLineIcon, GearIcon, SpeedometerIcon, TicketIcon, UsersIcon } from "@phosphor-icons/react";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: SpeedometerIcon },
  { href: "/dashboard/pages/events", label: "Events", icon: CalendarStarIcon },
  { href: "/dashboard/reports", label: "Reports", icon: ChartLineIcon },
  { href: "/dashboard/pages/users", label: "Users", icon: UsersIcon},
  { href: "/dashboard/settings", label: "Settings", icon: GearIcon },
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
      className={`relative transition-all duration-300 ${
        showSidebar ? "w-56" : "w-20"
      }  min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col`}
    >
      <div className="flex justify-between items-center px-4 py-6">
        {showSidebar ? (
          <div className="flex gap-2 items-center text-blue-600 font-bold text-xl">
            <TicketIcon size={25}/>
             <span> Timro-Ticket</span>
          </div>
        ) : (
             <div className="flex justify-center w-full">
            <TicketIcon size={25} className="text-blue-600" />
          </div>
        )}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="absolute -right-3 top-6 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-1.5 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 hover:shadow-md transition-all">
          {showSidebar ? (
            <CaretDoubleLeftIcon className="size-4"/>
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
                    ? "border-l-2 border-blue-500 bg-blue-50 dark:bg-blue-950"
                    : "border-l-2 border-transparent hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="text-blue-600" size={25} />
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
            <CaretRightIcon className="h-4 w-4 text-gray-500 dark:text-gray-300" />
             </>)}
          </div>
        </div>
     
    </aside>
  );
}
