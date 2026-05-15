"use client";

import { ColumnDef } from "@tanstack/react-table";
import { TicketResponse } from "@/types/event";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import { TicketStatusBadge } from "./TicketStatusBadge";

interface ColumnProps {
  t: (key: string, fallback: string) => string;
  pageIndex: number;
  pageSize: number;
  locale: string;
  symbol?: string;
}

export function getColumns({
  t,
  pageIndex,
  pageSize,
  locale,
  symbol,
}: ColumnProps): ColumnDef<TicketResponse>[] {
  return [
    {
      id: "sn",
      header: t("common.columns.sn", "S.N."),
      cell: (info) => info.row.index + 1 + pageIndex * pageSize,
      size: 50,
    },
    {
      accessorKey: "ticket_number",
      header: t("tickets.columns.ticketNumber", "Ticket Number"),
      meta: { sortKey: "ticket_number" },
      cell: (info) => (
        <span className="font-mono text-sm font-medium">
          {info.getValue<string>()}
        </span>
      ),
    },
    {
      id: "purchaser",
      header: t("tickets.columns.purchaser", "Purchased By"),
      meta: { sortKey: "purchased_by" },
      cell: (info) => {
        const isGuest = info.row.original.is_guest_purchase;
        const attendee = info.row.original.attendee;
        const name = isGuest
          ? t("common.guest", "Guest")
          : attendee?.name || "-";
        const email = attendee?.email || "-";

        return (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{name}</span>
            <span className="text-xs text-gray-500">{email}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: t("tickets.columns.purchaseDate", "Purchase Date"),
      meta: { sortKey: "created_at" },
      cell: (info) => (
        <span className="text-gray-500 whitespace-nowrap">
          {formatDateTime(info.getValue<string>())}
        </span>
      ),
    },
    {
      id: "tier",
      header: t("tickets.columns.tier", "Tier"),
      meta: { sortKey: "tier" },
      cell: (info) => (
        <span className="font-medium text-gray-900">
          {info.row.original.tier?.name || "-"}
        </span>
      ),
    },
    {
      id: "amount",
      header: t("tickets.columns.amount", "Amount"),
      meta: { sortKey: "total_amount" },
      cell: (info) => {
        const amount = info.row.original.total_amount;
        return (
          <span className="font-medium text-emerald-600">
            {formatCurrency(amount, symbol)}
          </span>
        );
      },
    },
    {
      id: "status",
      header: t("common.status", "Status"),
      meta: { sortKey: "status" },
      cell: (info) => {
        const checkInTime = info.row.original.check_in_time;
        const status = checkInTime ? "checked_in" : info.row.original.status;
        return <TicketStatusBadge status={status} />;
      },
    },
    {
      id: "check_in_time",
      header: t("tickets.columns.checkInTime", "Check-In Time"),
      meta: { sortKey: "check_in_time" },
      cell: (info) => {
        const checkInTime = info.row.original.check_in_time;
        return (
          <span className="text-gray-500 whitespace-nowrap">
            {checkInTime ? formatDateTime(checkInTime) : "-"}
          </span>
        );
      },
    },
    {
      id: "checked_in_by",
      header: t("tickets.columns.checkedInBy", "Checked In By"),
      meta: { sortKey: "checked_in_by" },
      cell: (info) => {
        const checkedInBy = info.row.original.checked_in_by_name;
        return (
          <span className="text-gray-600 font-medium">
            {checkedInBy || "-"}
          </span>
        );
      },
    },
  ];
}
