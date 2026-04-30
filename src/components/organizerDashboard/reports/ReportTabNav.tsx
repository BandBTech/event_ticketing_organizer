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
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";

interface Tab {
  value: ReportType;
  labelKey: string;
  icon: React.ElementType;
}

interface ReportTabNavProps {
  activeTab: ReportType;
  onTabChange: (tab: ReportType) => void;
}

export function ReportTabNav({ activeTab, onTabChange }: ReportTabNavProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const tabs: Tab[] = [
    {
      value: "overview",
      labelKey: "reports.tabs.overview",
      icon: ChartLineIcon,
    },
    { value: "sales", labelKey: "reports.tabs.sales", icon: ShoppingCartIcon },
    {
      value: "customer-analytics",
      labelKey: "reports.tabs.customerAnalytics",
      icon: UsersIcon,
    },
    {
      value: "financial",
      labelKey: "reports.tabs.financial",
      icon: CurrencyDollarIcon,
    },
    {
      value: "event-performance",
      labelKey: "reports.tabs.eventPerformance",
      icon: CalendarCheckIcon,
    },
  ];

  return (
    <div className="flex max-md:flex-wrap gap-2">
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
            {t(tab.labelKey, tab.value)}
          </Button>
        );
      })}
    </div>
  );
}
