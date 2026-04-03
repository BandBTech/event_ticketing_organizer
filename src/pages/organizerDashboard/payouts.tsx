"use client";

import { useState, useCallback } from "react";
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
import { PayoutRequestDialog } from "@/components/organizerDashboard/payouts/PayoutRequestDialog";
import { PayoutSummaryCards } from "@/components/organizerDashboard/payouts/PayoutSummaryCards";
import { PayoutFilterTabs } from "@/components/organizerDashboard/payouts/PayoutFilterTabs";
import { PayoutTable } from "@/components/organizerDashboard/payouts/PayoutTable";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { usePaginationSync } from "@/hooks/usePaginationSync";

export default function PayoutsPage() {
  const { t } = useTranslation();
  const { isOrganizerRejected, isOrganizerPending, isOrganizerInactive } =
    useAuthStore();

  const { currentPage, limit, handlePageChange, handleLimitChange } =
    usePaginationSync();
  const [activeTab, setActiveTab] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Sorting state
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(
    undefined,
  );

  const {
    payouts,
    totalPages,
    total,
    hasNextPage,
    hasPreviousPage,
    isLoading: isPayoutsLoading,
  } = usePayoutRequests({
    page: currentPage,
    limit,
    status: activeTab === "all" ? undefined : activeTab,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const { data: summary, isLoading: isSummaryLoading } = usePayoutSummary();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    handlePageChange(1);
  };

  const handleSortChange = useCallback(
    (
      newSortBy: string | undefined,
      newSortOrder: "asc" | "desc" | undefined,
    ) => {
      setSortBy(newSortBy);
      setSortOrder(newSortOrder);
      handlePageChange(1);
    },
    [handlePageChange],
  );

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
          <div className="flex-1 space-y-6 max-w-7xl mx-auto p-4 md:p-6 h-full flex flex-col">
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

              <PermissionGuard permission={[PERMISSIONS.PAYOUT_CREATE]}>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="gap-2 w-full sm:w-auto "
                >
                  <PlusIcon size={18} weight="bold" />
                  {t("payouts.requestPayout", "Request Payout")}
                </Button>

                <PayoutRequestDialog
                  open={isDialogOpen}
                  onOpenChange={setIsDialogOpen}
                  events={summary?.events}
                />
              </PermissionGuard>
            </div>

            {/* Summary Cards */}
            <PayoutSummaryCards
              summary={summary}
              isLoading={isSummaryLoading}
            />

            {/* Payout Requests Table */}
            <div className="glass-card-lowest rounded-2xl flex-1 flex flex-col">
              <PayoutFilterTabs
                activeTab={activeTab}
                onTabChange={handleTabChange}
              />
              <PayoutTable
                payouts={payouts}
                isLoading={isPayoutsLoading}
                currentPage={currentPage}
                totalPages={totalPages}
                total={total}
                limit={limit}
                onLimitChange={handleLimitChange}
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
                onPageChange={handlePageChange}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
              />
            </div>
          </div>
        </ProtectedRoute>
      </DashboardLayout>
    </>
  );
}
