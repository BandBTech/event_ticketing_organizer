"use client";

import { useState } from "react";
import { User, LockKey, IdentificationBadgeIcon, LockKeyIcon, Buildings } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import ProfileSettings from "./components/ProfileSettings";
import SecuritySettings from "./components/SecuritySettings";
import OrganizerProfileSettings from "./components/OrganizerProfileSettings";

const sidebarItems = [
  {
    id: "profile",
    label: "Profile",
    icon: User,
  },
  {
    id: "organizer",
    label: "Organizer Profile",
    icon: Buildings,
  },
  {
    id: "security",
    label: "Security",
    icon: LockKey,
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <Card className="p-2">
            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <Icon size={20} weight={isActive ? "fill" : "regular"} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </Card>
        </aside>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === "profile" && <ProfileSettings />}
          {activeTab === "organizer" && <OrganizerProfileSettings />}
          {activeTab === "security" && <SecuritySettings />}
        </div>
      </div>
    </div>
  );
}
