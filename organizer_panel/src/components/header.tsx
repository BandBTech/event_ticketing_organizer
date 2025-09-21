"use client";
import { Globe, ChevronDown } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full flex items-center justify-between px-6 py-3">
      {/* Logo / Brand Name */}
      <div className="text-xl font-bold text-blue-600 select-none">
        E-Ticket
      </div>

      {/* Language Selector */}
      <button className="flex items-center space-x-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full shadow-md dark:shadow-gray-900/40 transition">
        <Globe className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        <span className="text-gray-700 dark:text-gray-200 text-sm font-medium">
          English
        </span>
        <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-300" />
      </button>
    </header>
  );
}