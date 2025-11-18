import { Globe, Plus, ChevronDown } from "lucide-react";

export default function Topbar() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
      <h2 className="text-lg text-gray-700 font-semibold">Good Evening John Doe!</h2>

      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md">
          <Plus className="h-4 w-4 " />
          Create New Event
        </button>

        <div className="flex items-center gap-1 bg-gray-100  px-3 py-2 rounded-full shadow-md cursor-pointer">
          <Globe className="h-4 w-4 text-gray-600 " />
          <span className="text-sm text-gray-700 font-medium">English</span>
          <ChevronDown className="h-4 w-4 text-gray-700 text-gray-500 " />
        </div>
      </div>
    </header>
  );
}
