import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarBlank as CalendarBlankIcon,
  FileTextIcon,
  WarningCircleIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowSquareOutIcon,
} from "@phosphor-icons/react";
import { format } from "date-fns";
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/providers/ProtectedRoute";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { payoutService } from "@/services/payoutService";
import { queryKeys } from "@/lib/queryKeys";
import { PayoutRequest, PayoutPaymentHistory } from "@/types/payout";
import { formatCurrency, formatDateTimeLong } from "@/lib/utils";
import { ReusableTable } from "@/components/organizerDashboard/ReusableTable";
import Head from "next/head";

type StatusKey =
  | "approved"
  | "paid"
  | "rejected"
  | "pending"
  | "processing"
  | string;

const statusStyles: Record<StatusKey, string> = {
  approved: "bg-green-100 text-green-800",
  paid: "bg-blue-100 text-blue-800",
  rejected: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-indigo-100 text-indigo-800",
  cancelled: "bg-gray-100 text-gray-800",
};

const InfoRow = ({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) => {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  return (
    <div className="flex items-start justify-between py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500 font-medium min-w-[160px]">
        {label}
      </span>
      <span
        className={`text-sm text-slate-800 text-right ${mono ? "font-mono" : "font-medium"}`}
      >
        {value ?? t("common.notSpecified", "N/A")}
      </span>
    </div>
  );
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-3">
    {children}
  </p>
);

export default function PayoutDetailPage() {
  const router = useRouter();
  const payoutId = router.query.id as string;

  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const [selectedPayment, setSelectedPayment] =
    useState<PayoutPaymentHistory | null>(null);

  const paymentHistoryColumns: ColumnDef<PayoutPaymentHistory>[] = [
    {
      accessorKey: "method",
      header: t("payouts.history.method", "Method"),
      cell: ({ row }) => (
        <span className="capitalize font-medium text-gray-900">
          {row.original.method}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: t("payouts.history.amount", "Amount"),
      cell: ({ row }) => (
        <span className="font-semibold text-emerald-600">
          +{formatCurrency(row.original.amount, currency, symbol)}
        </span>
      ),
    },
    {
      accessorKey: "paid_at",
      header: t("payouts.history.paidAt", "Paid At"),
      cell: ({ row }) => (
        <span className="text-gray-500">
          {formatDateTimeLong(row.original.paid_at, locale)}
        </span>
      ),
    },
    {
      accessorKey: "processed_by",
      header: t("payouts.history.processedBy", "Processed By"),
      cell: ({ row }) => (
        <span className="text-gray-700">
          {row.original.processed_by || "-"}
        </span>
      ),
    },
    {
      id: "receipt",
      header: "",
      cell: ({ row }) =>
        row.original.screenshot_url ? (
          <a
            href={row.original.screenshot_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
          >
            <ArrowSquareOutIcon className="w-3.5 h-3.5" />
            {t("payouts.history.receipt", "Receipt")}
          </a>
        ) : null,
    },
  ];

  const { data: payoutData, isLoading } = useQuery<PayoutRequest>({
    queryKey: queryKeys.payouts.byId(payoutId ?? ""),
    queryFn: () => payoutService.getPayoutRequestById(payoutId),
    enabled: router.isReady && !!payoutId,
  });

  const billSummary = payoutData?.bill_summary;
  const paymentHistory = payoutData?.payment_history ?? [];
  const currency = payoutData?.currency ?? payoutData?.event?.currency ?? "JPY";
  const symbol = payoutData?.symbol ?? payoutData?.event?.symbol;

  const statCards = [
    {
      icon: (
        <CurrencyDollarIcon className="w-6 h-6 text-primary" weight="duotone" />
      ),
      label: t("payouts.totalBilled", "Total Billed"),
      value: isLoading
        ? null
        : formatCurrency(billSummary?.total_billed ?? payoutData?.amount ?? 0, currency, symbol),
    },
    {
      icon: (
        <CheckCircleIcon className="w-6 h-6 text-primary" weight="duotone" />
      ),
      label: t("payouts.paid", "Total Paid"),
      value: isLoading ? null : formatCurrency(billSummary?.total_paid ?? 0, currency, symbol),
    },
    {
      icon: <ClockIcon className="w-6 h-6 text-primary" weight="duotone" />,
      label: t("payouts.remaining", "Remaining"),
      value: isLoading
        ? null
        : formatCurrency(billSummary?.remaining_amount ?? 0, currency, symbol),
    },
    {
      icon: <ClockIcon className="w-6 h-6 text-primary" weight="duotone" />,
      label: t("payouts.pending", "Pending"),
      value: isLoading
        ? null
        : formatCurrency(billSummary?.pending_amount ?? 0, currency, symbol),
    },
  ];

  return (
    <>
      <Head>
        <title>{t("payouts.payoutDetails", "Payout Details")}</title>
      </Head>
      <DashboardLayout>
        <ProtectedRoute>
          <div className="flex-1 max-w-7xl mx-auto p-4 md:p-6 space-y-5">
            {/* Back nav */}
            <button
              onClick={() => router.push("/organizerDashboard/payouts")}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 group hover:bg-gray-100 p-2 px-4 rounded-lg transition-colors"
            >
              <ArrowLeft
                weight="duotone"
                className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
              />
              <span className="font-medium">
                {t("payouts.title", "Payout Requests")}
              </span>
            </button>

            {/* Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card-lowest rounded-2xl p-6"
            >
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <FileTextIcon
                      className="w-[26px] h-[26px] text-indigo-500"
                      weight="duotone"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-0.5">
                      {t("payouts.table.requestNumber", "Request #")}
                    </p>
                    {isLoading ? (
                      <Skeleton className="h-7 w-48" />
                    ) : (
                      <h1 className="text-xl font-bold text-slate-800 font-mono">
                        {payoutData?.request_number}
                      </h1>
                    )}
                  </div>
                </div>
                {isLoading ? (
                  <Skeleton className="h-6 w-20" />
                ) : (
                  <Badge
                    className={
                      statusStyles[payoutData?.status as StatusKey] ??
                      "bg-slate-100 text-slate-600"
                    }
                  >
                    {t(
                      `payouts.status.${payoutData?.status}`,
                      payoutData?.status,
                    )}
                  </Badge>
                )}
              </div>

              {/* Event info */}
              <div className="mt-5">
                <div className="bg-indigo-50 rounded-xl px-4 py-3 flex items-center gap-3">
                  <CalendarBlankIcon className="text-indigo-500 w-4 h-4 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                      {t("payouts.table.event", "Event")}
                    </p>
                    {isLoading ? (
                      <Skeleton className="h-5 w-40 mt-1" />
                    ) : (
                      <p className="text-sm font-semibold text-slate-700 truncate">
                        {payoutData?.event?.title || "-"}
                      </p>
                    )}
                  </div>
                  {payoutData?.event?.status && (
                    <Badge className="bg-slate-100 text-slate-600 capitalize flex-shrink-0">
                      {t(
                        `event.badge.${payoutData.event.status.toLowerCase()}`,
                        payoutData.event.status,
                      )}
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Stat Cards — matching PayoutSummaryCards pattern */}
            <div className="@container">
              <div className="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-4 gap-4">
                {statCards.map((card, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ scale: 1.03 }}
                    className="@container/card p-2.5 rounded-2xl glass-card-lowest transition-all"
                  >
                    <div className="flex gap-3 items-center @max-[180px]/card:flex-col @max-[180px]/card:items-start">
                      <div className="p-4 rounded-lg bg-primary/10">
                        {card.icon}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{card.label}</p>
                        {card.value === null ? (
                          <Skeleton className="h-7 w-24 mb-1" />
                        ) : (
                          <h2 className="text-xl text-gray-700 font-bold mt-0.5">
                            {card.value}
                          </h2>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass-card-lowest rounded-2xl p-6 space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <SectionTitle>
                    {t("payouts.requestDetails", "Request Details")}
                  </SectionTitle>
                  <InfoRow
                    label={t("payouts.table.requestNumber", "Request #")}
                    value={
                      isLoading ? <Skeleton className="h-4 w-36" /> : (
                        <span className="font-mono">
                          {payoutData?.request_number}
                        </span>
                      )
                    }
                  />
                  <InfoRow
                    label={t("payouts.table.status", "Status")}
                    value={
                      isLoading ? <Skeleton className="h-5 w-20" /> : (
                        payoutData?.status ? (
                          <Badge
                            className={
                              statusStyles[payoutData.status] ??
                              "bg-slate-100 text-slate-600"
                            }
                          >
                            {t(
                              `payouts.status.${payoutData.status}`,
                              payoutData.status,
                            )}
                          </Badge>
                        ) : null
                      )
                    }
                  />
                  <InfoRow
                    label={t("payouts.created", "Created")}
                    value={isLoading ? <Skeleton className="h-4 w-32" /> : formatDateTimeLong(payoutData?.created_at, locale)}
                  />
                  <InfoRow
                    label={t("payouts.updated", "Last Updated")}
                    value={isLoading ? <Skeleton className="h-4 w-32" /> : formatDateTimeLong(payoutData?.updated_at, locale)}
                  />
                </div>
                <div>
                  <SectionTitle>
                    {t("payouts.billSummary", "Bill Summary")}
                  </SectionTitle>
                  <InfoRow
                    label={t("payouts.totalBilled", "Total Billed")}
                    value={isLoading ? <Skeleton className="h-4 w-24" /> : formatCurrency(billSummary?.total_billed ?? 0, currency, symbol)}
                  />
                  <InfoRow
                    label={t("payouts.totalPaid", "Total Paid")}
                    value={
                      isLoading ? <Skeleton className="h-4 w-24" /> : (
                        <span className="text-emerald-600">
                          {formatCurrency(billSummary?.total_paid ?? 0, currency, symbol)}
                        </span>
                      )
                    }
                  />
                  <InfoRow
                    label={t("payouts.remaining", "Remaining")}
                    value={
                      isLoading ? <Skeleton className="h-4 w-24" /> : (
                        <span className="text-rose-500">
                          {formatCurrency(billSummary?.remaining_amount ?? 0, currency, symbol)}
                        </span>
                      )
                    }
                  />
                  <InfoRow
                    label={t("payouts.paymentCount", "Payments")}
                    value={isLoading ? <Skeleton className="h-4 w-16" /> : (billSummary?.payment_count ?? 0)}
                  />
                  {billSummary?.last_payment_date && (
                    <InfoRow
                      label={t("payouts.lastPayment", "Last Payment")}
                      value={formatDateTimeLong(
                        billSummary.last_payment_date,
                        locale,
                      )}
                    />
                  )}
                </div>
              </div>

              {payoutData?.description && (
                <>
                  <div className="border-t border-slate-100" />
                  <div>
                    <SectionTitle>
                      {t("payouts.table.description", "Description")}
                    </SectionTitle>
                    <p className="text-sm text-slate-700 leading-relaxed wrap-anywhere">
                      {payoutData.description}
                    </p>
                  </div>
                </>
              )}

              {payoutData?.admin_notes && (
                <>
                  <div className="border-t border-slate-100" />
                  <div>
                    <SectionTitle>
                      {t("common.adminNotes", "Admin Notes")}
                    </SectionTitle>
                    <div className="flex items-start gap-2 bg-orange-50 rounded-xl p-4">
                      <WarningCircleIcon
                        weight="fill"
                        className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5"
                      />
                      <p className="text-sm text-slate-700 wrap-anywhere">
                        {payoutData.admin_notes}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </motion.div>

            {/* Payment History */}
            {(isLoading || paymentHistory.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 }}
                className="glass-card-lowest rounded-2xl overflow-hidden"
              >
                <div className="px-6 pt-5 pb-2">
                  <SectionTitle>
                    {t("payouts.paymentHistory", "Payment History")}
                  </SectionTitle>
                </div>
                <ReusableTable
                  columns={paymentHistoryColumns}
                  data={paymentHistory}
                  isLoading={isLoading}
                  currentPage={1}
                  totalPages={1}
                  total={paymentHistory.length}
                  hasNextPage={false}
                  hasPreviousPage={false}
                  onPageChange={() => {}}
                  onRowClick={(row) => setSelectedPayment(row)}
                />
              </motion.div>
            )}

            {/* Payment Detail Modal */}
            <Dialog
              open={selectedPayment !== null}
              onOpenChange={(open) => {
                if (!open) setSelectedPayment(null);
              }}
            >
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-xl">
                    {t("payouts.history.paymentDetails", "Payment Details")}
                  </DialogTitle>
                </DialogHeader>
                {selectedPayment && (
                  <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          {t("payouts.history.amount", "Amount")}
                        </p>
                        <p className="font-semibold text-emerald-600 text-lg">
                          +{formatCurrency(selectedPayment.amount, currency, symbol)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          {t("payouts.history.method", "Method")}
                        </p>
                        <p className="font-medium text-gray-900 capitalize">
                          {selectedPayment.method || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          {t("payouts.history.date", "Payment Date")}
                        </p>
                        <p className="font-medium text-gray-900">
                          {format(
                            new Date(selectedPayment.paid_at),
                            "MMM d, yyyy",
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          {t("payouts.history.processedBy", "Processed By")}
                        </p>
                        <p className="font-medium text-gray-900">
                          {selectedPayment.processed_by || "—"}
                        </p>
                      </div>
                    </div>

                    {selectedPayment.reference && (
                      <div>
                        <p className="text-sm text-gray-500">
                          {t("payouts.history.reference", "Reference")}
                        </p>
                        <p className="font-mono text-blue-600 font-medium">
                          {selectedPayment.reference}
                        </p>
                      </div>
                    )}

                    {selectedPayment.notes && (
                      <div>
                        <p className="text-sm text-gray-500">
                          {t("payouts.history.notes", "Notes")}
                        </p>
                        <p className="text-gray-700 pt-1 wrap-anywhere max-w-[464px]">
                          {selectedPayment.notes}
                        </p>
                      </div>
                    )}

                    {selectedPayment.screenshot_url && (
                      <div>
                        <p className="text-sm text-gray-500">
                          {t("payouts.history.receipt", "Receipt")}
                        </p>
                        <a
                          href={selectedPayment.screenshot_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-indigo-500 hover:text-indigo-700 transition-colors mt-1"
                        >
                          <ArrowSquareOutIcon className="w-4 h-4" />
                          {t("payouts.history.viewReceipt", "View Receipt")}
                        </a>
                      </div>
                    )}

                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-400">
                        {t("payouts.created", "Created")}:{" "}
                        {format(
                          new Date(selectedPayment.created_at),
                          "MMM d, yyyy 'at' h:mm a",
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </ProtectedRoute>
      </DashboardLayout>
    </>
  );
}
