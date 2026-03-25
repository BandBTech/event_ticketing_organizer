import { useMemo, useState } from "react";
import { format } from "date-fns";
import { WarningCircleIcon } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { PayoutRequest } from "@/types/payout";
import { useTranslation } from "@/hooks/useTranslation";
import { ReusableTable } from "@/components/organizerDashboard/ReusableTable";
import { formatCurrency } from "@/lib/utils";
import { useLanguageStore } from "@/store/languageStore";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
}: PayoutTableProps) {
  const { t } = useTranslation();
  const { locale } = useLanguageStore();
  const [adminNotesContent, setAdminNotesContent] = useState<string | null>(null);

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
        cell: ({ row }) => (
          <span className="text-gray-700 truncate max-w-[180px] inline-block">
            {row.original.event?.title || "-"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: t("payouts.table.status", "Status"),
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={`${getStatusColor(row.original.status)} border-0 px-2.5 py-0.5 capitalize`}
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "created_at",
        header: t("payouts.table.date", "Date"),
        cell: ({ row }) => (
          <span className="text-gray-500">
            {format(new Date(row.original.created_at), "MMM d, yyyy")}
          </span>
        ),
      },
      {
        id: "description",
        header: t("payouts.table.description", "Description"),
        cell: ({ row }) => (
          <div className="max-w-[200px] text-gray-500 truncate">
            {row.original.description || "-"}
          </div>
        ),
      },
      {
        accessorKey: "amount",
        header: () => (
          <div className="text-right">
            {t("payouts.table.amount", "Amount")}
          </div>
        ),
        cell: ({ row }) => (
          <div className="font-semibold text-right">
            {formatCurrency(row.original.amount, undefined, locale)}
          </div>
        ),
      },
      {
        id: "admin_notes",
        header: "",
        cell: ({ row }) =>
          row.original.admin_notes ? (
            <div className="flex justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setAdminNotesContent(row.original.admin_notes!)}
                    className="text-orange-500 hover:text-orange-600 transition-colors"
                  >
                    <WarningCircleIcon weight="duotone" className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {t("common.adminNotes", "Admin Notes")}
                </TooltipContent>
              </Tooltip>
            </div>
          ) : null,
      },
    ],
    [t, locale, setAdminNotesContent],
  );

  return (
    <>
    <Dialog
      open={adminNotesContent !== null}
      onOpenChange={(open) => { if (!open) setAdminNotesContent(null); }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <WarningCircleIcon weight="fill" className="w-5 h-5" />
            {t("common.adminNotes", "Admin Notes")}
          </DialogTitle>
          <DialogDescription className="text-gray-700 pt-2">
            {adminNotesContent}
          </DialogDescription>
        </DialogHeader>
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
    />
    </>
  );
}
