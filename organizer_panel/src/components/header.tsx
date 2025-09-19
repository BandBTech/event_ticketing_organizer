"use client";

import { Globe } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 shadow-md">
      {/* Logo / Brand Name */}
      <div className="text-xl font-bold text-blue-600 select-none">
        E-Ticket
      </div>

      {/* Language Selector */}
      <div className="flex items-center space-x-2 cursor-pointer">
        <Globe className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        <span className="text-gray-700 dark:text-gray-200 text-sm font-medium">
          EN
        </span>
      </div>
    </header>
  );
}
