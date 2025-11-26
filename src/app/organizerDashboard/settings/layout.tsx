"use client";

import { UserIcon, BuildingsIcon, LockKeyIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";

const menuItems = [
  {
    href: "/organizerDashboard/settings/profile",
    label: "Profile",
    icon: UserIcon,
  },
  {
    href: "/organizerDashboard/settings/organizer",
    label: "Organizer Profile",
    icon: BuildingsIcon,
  },
  {
    href: "/organizerDashboard/settings/security",
    label: "Security",
    icon: LockKeyIcon,
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="rounded-xl sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 px-2">
              {t('settings.title', 'Settings')}
            </h2>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                      'hover:bg-gray-100',
                      isActive && 'bg-primary/10 text-primary font-medium'
                    )}
                  >
                    <Icon size={20} weight={isActive ? 'fill' : 'duotone'} />
                    <span className="text-base">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
