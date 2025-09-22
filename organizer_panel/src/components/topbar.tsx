import { Globe, Plus, ChevronDown } from "lucide-react";

export default function Topbar() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 shadow-sm">
      <h2 className="text-lg font-semibold">Good Evening John Doe!</h2>

      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md">
          <Plus className="h-4 w-4" />
          Create New Event
        </button>

        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-full shadow-md cursor-pointer">
          <Globe className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          <span className="text-sm font-medium">English</span>
          <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-300" />
        </div>
      </div>
    </header>
  );
}
