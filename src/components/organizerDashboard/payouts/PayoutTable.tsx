import { useMemo, useState } from "react";
import { format } from "date-fns";
import { EyeIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { PayoutRequest } from "@/types/payout";
import { useTranslation } from "@/hooks/useTranslation";
import { ReusableTable } from "@/components/organizerDashboard/ReusableTable";
import { formatCurrency } from "@/lib/utils";
import { useLanguageStore } from "@/store/languageStore";
import { useCurrencyStore } from "@/store/currencyStore";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePayoutRequest } from "@/hooks/usePayouts";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/router";

function getStatusColor(status: string): string {
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
}

interface PayoutTableProps {
  payouts: PayoutRequest[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  total?: number;
  limit?: number;
  onLimitChange?: (limit: number) => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (
    sortBy: string | undefined,
    sortOrder: "asc" | "desc" | undefined,
  ) => void;
}

export function PayoutTable({
  payouts,
  isLoading,
  currentPage,
  totalPages,
  total,
  limit,
  onLimitChange,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  sortBy,
  sortOrder,
  onSortChange,
}: PayoutTableProps) {
  const { t } = useTranslation();
  const { locale } = useLanguageStore();
  const { currency } = useCurrencyStore();
  const router = useRouter();
  const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);

  const { data: selectedPayout, isLoading: isLoadingSelected } =
    usePayoutRequest(selectedPayoutId);

  const columns = useMemo<ColumnDef<PayoutRequest>[]>(
    () => [
      {
        accessorKey: "request_number",
        header: t("payouts.table.requestNumber", "Request #"),
        cell: ({ row }) => (
          <span className="font-medium text-gray-900">
            {row.original.request_number}
          </span>
        ),
      },
      {
        id: "event",
        header: t("payouts.table.event", "Event"),
        meta: { sortKey: "event_title" },
        cell: ({ row }) => (
          <span className="text-gray-700 truncate max-w-[180px] inline-block">
            {row.original.event?.title || "-"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: t("payouts.table.status", "Status"),
        meta: { sortKey: "status" },
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={`${getStatusColor(row.original.status)} border-0 px-2.5 py-0.5 capitalize`}
          >
            {t(`payouts.status.${row.original.status}`, row.original.status)}
          </Badge>
        ),
      },
      {
        accessorKey: "created_at",
        header: t("payouts.table.date", "Date"),
        meta: { sortKey: "created_at" },
        cell: ({ row }) => (
          <span className="text-gray-500">
            {format(new Date(row.original.created_at), "MMM d, yyyy")}
          </span>
        ),
      },
      {
        accessorKey: "amount",
        header: t("payouts.table.amount", "Amount"),
        meta: { sortKey: "amount", headerClassName: "!text-right" },
        cell: ({ row }) => (
          <div className="font-semibold text-right">
            {formatCurrency(row.original.amount)}
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push({ pathname: "/organizerDashboard/payouts/detail", query: { id: row.original.id } });
                  }}
                  className="text-gray-400 hover:text-indigo-600 transition-colors"
                  title={t("common.viewDetail", "View Detail")}
                >
                  <EyeIcon weight="duotone" className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {t("payouts.viewPayoutDetail", "View payout detail")}
              </TooltipContent>
            </Tooltip>
          </div>
        ),
      },
    ],
    [t, locale, router],
  );

  return (
    <>
      {/* Payout Detail Dialog */}
      <Dialog
        open={selectedPayoutId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedPayoutId(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {t("payouts.payoutDetails", "Payout Details")}
            </DialogTitle>
          </DialogHeader>
          {isLoadingSelected ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-2/3" />
            </div>
          ) : selectedPayout ? (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm text-gray-500">
                  {t("payouts.table.requestNumber", "Request #")}
                </p>
                <p className="font-medium text-gray-900">
                  {selectedPayout.request_number}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  {t("payouts.table.event", "Event")}
                </p>
                <p className="font-medium text-gray-900">
                  {selectedPayout.event?.title || "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  {t("payouts.table.amount", "Amount")}
                </p>
                <p className="font-semibold text-gray-900">
                  {formatCurrency(selectedPayout.amount)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  {t("payouts.table.status", "Status")}
                </p>
                <Badge
                  variant="outline"
                  className={`${getStatusColor(selectedPayout.status)} border-0 px-2.5 py-0.5 capitalize`}
                >
                  {t(`payouts.status.${selectedPayout.status}`, selectedPayout.status)}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-gray-500 wrap-break-word">
                  {t("payouts.table.description", "Description")}
                </p>
                <p className="text-gray-700 pt-1">
                  {selectedPayout.description ||
                    t("common.noDescription", "No description provided")}
                </p>
              </div>

              {selectedPayout.admin_notes && (
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <WarningCircleIcon
                      weight="fill"
                      className="w-4 h-4 text-orange-500 wrap-break-word"
                    />
                    {t("common.adminNotes", "Admin Notes")}
                  </p>
                  <p className="text-gray-700 pt-1 ">
                    {selectedPayout.admin_notes}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-500">
                    {t("payouts.created", "Created")}
                  </p>
                  <p className="font-medium text-gray-900">
                    {format(
                      new Date(selectedPayout.created_at),
                      "MMM d, yyyy 'at' h:mm a",
                    )}
                  </p>
                </div>
                {selectedPayout.processed_at && (
                  <div>
                    <p className="text-sm text-gray-500">
                      {t("payouts.processed", "Processed")}
                    </p>
                    <p className="font-medium text-gray-900">
                      {format(
                        new Date(selectedPayout.processed_at),
                        "MMM d, yyyy 'at' h:mm a",
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 py-4">
              {t("common.errorLoading", "Error loading data")}
            </p>
          )}
        </DialogContent>
      </Dialog>

      <ReusableTable
        columns={columns}
        data={payouts}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
        limit={limit}
        onLimitChange={onLimitChange}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        onPageChange={onPageChange}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={onSortChange}
        emptyState={
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
              </svg>
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
        }
        onRowClick={(row) => setSelectedPayoutId(row.id)}
      />
    </>
  );
}
