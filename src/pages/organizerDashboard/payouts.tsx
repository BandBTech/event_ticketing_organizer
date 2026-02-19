"use client";

import { useState } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import {
  CurrencyDollarIcon,
  BankIcon,
  ClockIcon,
  WalletIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { format } from "date-fns";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/providers/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "@/hooks/useTranslation";
import { usePayoutRequests, usePayoutSummary } from "@/hooks/usePayouts";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RejectionNotice } from "@/components/organizer/RejectionNotice";
import { PendingNotice } from "@/components/organizer/PendingNotice";
import { InactiveNotice } from "@/components/organizer/InactiveNotice";
import TablePagination from "@/components/organizerDashboard/TablePagination";
import { PayoutRequestDialog } from "@/components/organizerDashboard/PayoutRequestDialog";

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700 hover:bg-green-200 border-green-200";
      case "paid":
        return "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200";
      case "rejected":
        return "bg-red-100 text-red-700 hover:bg-red-200 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200";
    }
  };

  const tabs = [
    { value: "all", label: t("payouts.tabs.all", "All Requests") },
    { value: "pending", label: t("payouts.tabs.pending", "Pending") },
    { value: "approved", label: t("payouts.tabs.approved", "Approved") },
    { value: "rejected", label: t("payouts.tabs.rejected", "Rejected") },
    { value: "paid", label: t("payouts.tabs.paid", "Paid") },
  ];

  const summaryCards = [
    {
      icon: <CurrencyDollarIcon className="w-10 h-10 text-blue-500" />,
      label: t("payouts.summary.earnings", "Total Earnings"),
      value: isSummaryLoading
        ? null
        : `Rs. ${summary?.total_earnings.toLocaleString() ?? "0"}`,
      gradient: "from-blue-50 to-white",
    },
    {
      icon: <BankIcon className="w-10 h-10 text-green-500" />,
      label: t("payouts.summary.withdrawn", "Amount Withdrawn"),
      value: isSummaryLoading
        ? null
        : `Rs. ${summary?.total_withdrawn.toLocaleString() ?? "0"}`,
      gradient: "from-green-50 to-white",
    },
    {
      icon: <ClockIcon className="w-10 h-10 text-yellow-500" />,
      label: t("payouts.summary.pending", "Pending Requests"),
      value: isSummaryLoading
        ? null
        : `Rs. ${summary?.pending_amount.toLocaleString() ?? "0"}`,
      gradient: "from-yellow-50 to-white",
    },
    {
      icon: <WalletIcon className="w-10 h-10 text-purple-500" />,
      label: t("payouts.summary.balance", "Available Balance"),
      value: isSummaryLoading
        ? null
        : `Rs. ${summary?.available_balance.toLocaleString() ?? "0"}`,
      gradient: "from-purple-50 to-white",
    },
  ];

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

            {/* Summary Cards — dashboard style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {summaryCards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.03 }}
                  className={`flex items-center gap-4 p-6 rounded-2xl shadow bg-linear-to-tr ${card.gradient} transition-all`}
                >
                  {card.icon}
                  <div>
                    {card.value === null ? (
                      <Skeleton className="h-7 w-24 mb-1" />
                    ) : (
                      <h2 className="text-xl text-gray-700 font-bold">
                        {card.value}
                      </h2>
                    )}
                    <p className="text-sm text-gray-600">{card.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Payout Requests Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Filter Tabs */}
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => {
                      setActiveTab(tab.value);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.value
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Table Content */}
              {isPayoutsLoading ? (
                <div className="p-8 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : payouts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-gray-50 p-4 rounded-full mb-4">
                    <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {t("payouts.empty.title", "No payout requests found")}
                  </h3>
                  <p className="text-gray-500 mt-1 max-w-sm">
                    {t(
                      "payouts.empty.description",
                      "You haven't made any payout requests yet.",
                    )}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {t("payouts.table.requestNumber", "Request #")}
                      </TableHead>
                      <TableHead>
                        {t("payouts.table.amount", "Amount")}
                      </TableHead>
                      <TableHead>{t("payouts.table.type", "Type")}</TableHead>
                      <TableHead>
                        {t("payouts.table.status", "Status")}
                      </TableHead>
                      <TableHead>{t("payouts.table.date", "Date")}</TableHead>
                      <TableHead>
                        {t("payouts.table.description", "Description")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map((request) => (
                      <TableRow
                        key={request.id}
                        className="group hover:bg-gray-50/50 transition-colors"
                      >
                        <TableCell className="font-medium text-gray-900">
                          {request.request_number}
                          {request.event && (
                            <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[150px]">
                              {request.event.title}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold">
                          Rs. {request.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="capitalize text-gray-600">
                          {request.request_type.replace("_", " ")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${getStatusColor(
                              request.status,
                            )} border-0 px-2.5 py-0.5 capitalize`}
                          >
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-500">
                          {format(new Date(request.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-gray-500">
                          {request.description || "-"}
                          {request.admin_notes && (
                            <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
                              <WarningCircleIcon weight="fill" />
                              Admin: {request.admin_notes}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-t border-gray-100 bg-gray-50/30">
                  <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    hasNext={hasNextPage}
                    hasPrev={hasPreviousPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </div>
          </div>
        </ProtectedRoute>
      </DashboardLayout>
    </>
  );
}
