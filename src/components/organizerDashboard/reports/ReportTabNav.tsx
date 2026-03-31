"use client";

import {
  ChartLineIcon,
  ShoppingCartIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CalendarCheckIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ReportType } from "@/types/report";

interface Tab {
  value: ReportType;
  label: string;
  icon: React.ElementType;
}

const tabs: Tab[] = [
  { value: "overview", label: "Overview", icon: ChartLineIcon },
  { value: "sales", label: "Sales", icon: ShoppingCartIcon },
  { value: "customer-analytics", label: "Customer Analytics", icon: UsersIcon },
  { value: "financial", label: "Financial", icon: CurrencyDollarIcon },
  { value: "event-performance", label: "Event Performance", icon: CalendarCheckIcon },
];

interface ReportTabNavProps {
  activeTab: ReportType;
  onTabChange: (tab: ReportType) => void;
}

export function ReportTabNav({ activeTab, onTabChange }: ReportTabNavProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.value;
        return (
          <Button
            key={tab.value}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onTabChange(tab.value)}
            className="flex items-center gap-2"
          >
            <Icon className="w-4 h-4" weight="duotone" />
            {tab.label}
          </Button>
        );
      })}
    </div>
  );
}
