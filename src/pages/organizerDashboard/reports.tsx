"use client";

import { useState } from "react";
import Head from "next/head";
import { useAuthStore } from "@/store/authStore";
import { RejectionNotice } from "@/components/organizer/RejectionNotice";
import { PendingNotice } from "@/components/organizer/PendingNotice";
import { InactiveNotice } from "@/components/organizer/InactiveNotice";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/providers/ProtectedRoute";
import { ReportTabNav } from "@/components/organizerDashboard/reports/ReportTabNav";
import { ReportFilters } from "@/components/organizerDashboard/reports/ReportFilters";
import { OverviewTab } from "@/components/organizerDashboard/reports/OverviewTab";
import { SalesTab } from "@/components/organizerDashboard/reports/SalesTab";
import { CustomerAnalyticsTab } from "@/components/organizerDashboard/reports/CustomerAnalyticsTab";
import { FinancialTab } from "@/components/organizerDashboard/reports/FinancialTab";
import { EventPerformanceTab } from "@/components/organizerDashboard/reports/EventPerformanceTab";
import { ReportType } from "@/types/report";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";

type DateRangePreset =
  | "today"
  | "yesterday"
  | "last-7-days"
  | "last-month"
  | "last-3-months"
  | "last-6-months"
  | "last-year";

function getDateRangeFromPreset(preset: DateRangePreset): {
  startDate: string;
  endDate: string;
} {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  switch (preset) {
    case "today":
      return {
        startDate: today.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      };
    case "yesterday":
      return {
        startDate: yesterday.toISOString().split("T")[0],
        endDate: yesterday.toISOString().split("T")[0],
      };
    case "last-7-days": {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return {
        startDate: sevenDaysAgo.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      };
    }
    case "last-month": {
      const oneMonthAgo = new Date(today);
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return {
        startDate: oneMonthAgo.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      };
    }
    case "last-3-months": {
      const threeMonthsAgo = new Date(today);
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return {
        startDate: threeMonthsAgo.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      };
    }
    case "last-6-months": {
      const sixMonthsAgo = new Date(today);
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return {
        startDate: sixMonthsAgo.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      };
    }
    case "last-year": {
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      return {
        startDate: oneYearAgo.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      };
    }
    default:
      return {
        startDate: "",
        endDate: "",
      };
  }
}

export default function ReportsPage() {
  const { isOrganizerRejected, isOrganizerPending, isOrganizerInactive } =
    useAuthStore();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const [activeTab, setActiveTab] = useState<ReportType>("overview");
  const [dateRangePreset, setDateRangePreset] =
    useState<DateRangePreset>("last-7-days");
  const [selectedEventId, setSelectedEventId] = useState("");

  const { startDate, endDate } = getDateRangeFromPreset(dateRangePreset);

  if (isOrganizerRejected()) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <RejectionNotice />
        </div>
      </DashboardLayout>
    );
  }

  if (isOrganizerPending()) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <PendingNotice />
        </div>
      </DashboardLayout>
    );
  }

  if (isOrganizerInactive()) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <InactiveNotice />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>{`${t("reports.title", "Reports")} | ${t("organizer.title", "Organizer")}`}</title>
      </Head>
      <DashboardLayout>
        <ProtectedRoute>
          <div className="flex-1 space-y-6 mx-auto p-4 lg:p-6 lg:pt-2 @container">
            <div className="flex @max-3xl:flex-col flex-wrap gap-4 @3xl:items-end justify-between">
              <ReportTabNav activeTab={activeTab} onTabChange={setActiveTab} />
              <ReportFilters
                dateRangePreset={dateRangePreset}
                onDateRangePresetChange={setDateRangePreset}
                activeTab={activeTab}
                onEventChange={setSelectedEventId}
                selectedEventId={selectedEventId}
              />
            </div>

            {activeTab === "overview" && (
              <OverviewTab
                startDate={startDate || undefined}
                endDate={endDate || undefined}
              />
            )}
            {activeTab === "sales" && (
              <SalesTab
                startDate={startDate || undefined}
                endDate={endDate || undefined}
              />
            )}
            {activeTab === "customer-analytics" && (
              <CustomerAnalyticsTab
                startDate={startDate || undefined}
                endDate={endDate || undefined}
              />
            )}
            {activeTab === "financial" && (
              <FinancialTab
                startDate={startDate || undefined}
                endDate={endDate || undefined}
              />
            )}
            {activeTab === "event-performance" && (
              <EventPerformanceTab
                startDate={startDate || undefined}
                endDate={endDate || undefined}
                eventId={selectedEventId || undefined}
              />
            )}
          </div>
        </ProtectedRoute>
      </DashboardLayout>
    </>
  );
}
