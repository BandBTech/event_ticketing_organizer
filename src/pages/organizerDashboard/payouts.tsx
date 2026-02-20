"use client";

import { useState } from "react";
import Head from "next/head";
import { PlusIcon } from "@phosphor-icons/react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/providers/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "@/hooks/useTranslation";
import { usePayoutRequests, usePayoutSummary } from "@/hooks/usePayouts";
import { RejectionNotice } from "@/components/organizer/RejectionNotice";
import { PendingNotice } from "@/components/organizer/PendingNotice";
import { InactiveNotice } from "@/components/organizer/InactiveNotice";
import { Button } from "@/components/ui/button";
import { PayoutRequestDialog } from "@/components/organizerDashboard/PayoutRequestDialog";
import { PayoutSummaryCards } from "@/components/organizerDashboard/payouts/PayoutSummaryCards";
import { PayoutFilterTabs } from "@/components/organizerDashboard/payouts/PayoutFilterTabs";
import { PayoutTable } from "@/components/organizerDashboard/payouts/PayoutTable";

export default function PayoutsPage() {
  const { t } = useTranslation();
  const { isOrganizerRejected, isOrganizerPending, isOrganizerInactive } =
    useAuthStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    payouts,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    isLoading: isPayoutsLoading,
  } = usePayoutRequests({
    page: currentPage,
    limit: 10,
    status: activeTab === "all" ? undefined : activeTab,
  });

  const { summary, isLoading: isSummaryLoading } = usePayoutSummary();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // Status guards
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
        <title>
          {t("payouts.title", "Payout Requests")} | Organizer Dashboard
        </title>
      </Head>
      <DashboardLayout>
        <ProtectedRoute>
          <div className="flex-1 space-y-6 max-w-7xl mx-auto p-4 md:p-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {t("payouts.title", "Payout Requests")}
                </h1>
                <p className="text-gray-500 mt-1">
                  {t(
                    "payouts.subtitle",
                    "Manage your withdrawals and view financial summary",
                  )}
                </p>
              </div>

              <Button
                onClick={() => setIsDialogOpen(true)}
                className="gap-2 w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon size={18} weight="bold" />
                {t("payouts.requestPayout", "Request Payout")}
              </Button>

              <PayoutRequestDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
              />
            </div>

            {/* Summary Cards */}
            <PayoutSummaryCards
              summary={summary}
              isLoading={isSummaryLoading}
            />

            {/* Payout Requests Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <PayoutFilterTabs
                activeTab={activeTab}
                onTabChange={handleTabChange}
              />
              <PayoutTable
                payouts={payouts}
                isLoading={isPayoutsLoading}
                currentPage={currentPage}
                totalPages={totalPages}
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </ProtectedRoute>
      </DashboardLayout>
    </>
  );
}
