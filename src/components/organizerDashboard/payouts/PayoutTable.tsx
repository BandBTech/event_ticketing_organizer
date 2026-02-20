import { format } from "date-fns";
import { MagnifyingGlassIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TablePagination from "@/components/organizerDashboard/TablePagination";
import { PayoutRequest } from "@/types/payout";
import { useTranslation } from "@/hooks/useTranslation";

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
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
}

export function PayoutTable({
  payouts,
  isLoading,
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
}: PayoutTableProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (payouts.length === 0) {
    return (
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
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              {t("payouts.table.requestNumber", "Request #")}
            </TableHead>
            <TableHead>{t("payouts.table.event", "Event")}</TableHead>
            <TableHead>{t("payouts.table.status", "Status")}</TableHead>
            <TableHead>{t("payouts.table.date", "Date")}</TableHead>
            <TableHead>
              {t("payouts.table.description", "Description")}
            </TableHead>
            <TableHead className="text-right">
              {t("payouts.table.amount", "Amount")}
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
              </TableCell>
              <TableCell className="text-gray-700 truncate max-w-[180px]">
                {request.event?.title || "-"}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={`${getStatusColor(request.status)} border-0 px-2.5 py-0.5 capitalize`}
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
              <TableCell className="font-semibold text-right">
                Rs. {request.amount.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="border-t border-gray-100 bg-gray-50/30">
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasNext={hasNextPage}
            hasPrev={hasPreviousPage}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </>
  );
}
