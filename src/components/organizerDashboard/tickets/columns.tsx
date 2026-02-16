"use client";

import { ColumnDef } from "@tanstack/react-table";
import { TicketResponse } from "@/types/event";
import { formatDateTime } from "@/lib/utils";
import { TicketStatusBadge } from "./TicketStatusBadge";

interface ColumnProps {
  t: (key: string, fallback: string) => string;
  pageIndex: number;
  pageSize: number;
}

export function getColumns({ t, pageIndex, pageSize }: ColumnProps): ColumnDef<TicketResponse>[] {
  return [
    {
      id: "sn",
      header: t('common.columns.sn', "S.N."),
      cell: (info) => info.row.index + 1 + pageIndex * pageSize,
      size: 50,
    },
    {
      accessorKey: "ticket_number",
      header: t('tickets.columns.ticketNumber', "Ticket Number"),
      cell: (info) => <span className="font-mono text-sm font-medium">{info.getValue<string>()}</span>,
    },
    {
      id: "purchaser",
      header: t('tickets.columns.purchaser', "Purchaser"),
      cell: (info) => {
        const attendee = info.row.original.attendee;
        const user = info.row.original.user;
        const guest = info.row.original.guest_user;

        const name = attendee?.name || (user ? `${user.first_name} ${user.last_name}` : guest ? guest.name : "-");
        const isGuest = info.row.original.is_guest_purchase;

        return (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{name}</span>
            {isGuest && <span className="text-xs text-gray-500 italic">({t('common.guest', "Guest")})</span>}
          </div>
        );
      },
    },
    {
      id: "email",
      header: t('common.columns.email', "Email"),
      cell: (info) => {
        const attendee = info.row.original.attendee;
        const user = info.row.original.user;
        const guest = info.row.original.guest_user;
        return <span className="text-gray-600 font-medium">{attendee?.email || user?.email || guest?.email || "-"}</span>;
      },
    },
    {
      accessorKey: "tier_name",
      header: t('tickets.columns.tier', "Tier"),
      cell: (info) => <span className="font-medium text-gray-900">{info.getValue<string>() || "-"}</span>,
    },
    {
      accessorKey: "quantity",
      header: t('tickets.columns.quantity', "Quantity"),
      cell: (info) => <span className="font-medium">{info.getValue<number>()}</span>,
    },
    {
      id: "amount",
      header: t('tickets.columns.amount', "Amount"),
      cell: (info) => {
        const amount = info.row.original.total_amount;
        const currency = info.row.original.currency || "NPR";
        return <span className="font-medium text-emerald-600">{currency} {amount.toLocaleString()}</span>;
      },
    },
    {
      accessorKey: "status",
      header: t('common.status', "Status"),
      cell: (info) => <TicketStatusBadge status={info.getValue<string>()} />,
    },
    {
      accessorKey: "purchase_date",
      header: t('tickets.columns.purchaseDate', "Purchase Date"),
      cell: (info) => <span className="text-gray-500 whitespace-nowrap">{formatDateTime(info.getValue<string>())}</span>,
    },
  ];
}
