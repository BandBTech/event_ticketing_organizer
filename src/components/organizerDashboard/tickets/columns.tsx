"use client";

import { ColumnDef } from "@tanstack/react-table";
import { EventDay, TicketCheckIn, TicketResponse } from "@/types/event";
import { formatDateTime, formatCurrency, formatEventDayName } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TicketStatusBadge } from "./TicketStatusBadge";

interface ColumnProps {
  t: (key: string, fallback: string) => string;
  pageIndex: number;
  pageSize: number;
  locale: string;
  currency?: string;
  symbol?: string;
  eventDaysCount?: number;
  eventDays?: EventDay[];
}

// Per-day check-in pills for multi-day events. Each pill marks whether the
// ticket was scanned for that day; hovering shows the time and who scanned it.
function DayCheckInPills({
  eventDays,
  checkIns,
  t,
}: {
  eventDays?: EventDay[];
  checkIns: TicketCheckIn[];
  t: (key: string, fallback: string) => string;
}) {
  const now = Date.now();

  // Build the master day list: prefer event.event_days (so MISSED days also
  // show), and union in any day referenced by a check-in that isn't already
  // present — this keeps pills working even if event_days is unavailable.
  const dayMap = new Map<string, TicketCheckIn["event_day"]>();
  (eventDays || []).forEach((d) =>
    dayMap.set(d.id, {
      id: d.id,
      name: d.name,
      start_time: d.start_time,
      end_time: d.end_time,
    }),
  );
  checkIns.forEach((c) => {
    if (c.event_day && !dayMap.has(c.event_day.id)) {
      dayMap.set(c.event_day.id, c.event_day);
    }
  });

  // Render days in chronological order regardless of API ordering.
  const orderedDays = Array.from(dayMap.values()).sort(
    (a, b) =>
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
  );

  if (orderedDays.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {orderedDays.map((day, idx) => {
          const checkIn = checkIns.find((c) => c.event_day?.id === day.id);
          const dayEnded = day.end_time
            ? new Date(day.end_time).getTime() < now
            : false;
          // checked-in -> scanned; missed -> day is over and never scanned;
          // upcoming -> day hasn't ended yet and not scanned.
          const state = checkIn ? "in" : dayEnded ? "missed" : "upcoming";

          const dayLabel = formatEventDayName(day.name, idx, t);
          const scannedBy = checkIn?.checked_in_by?.name;

          const cls =
            state === "in"
              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
              : state === "missed"
                ? "bg-rose-100 text-rose-700 border-rose-200"
                : "bg-gray-100 text-gray-500 border-gray-200";
          const icon = state === "in" ? "✓" : state === "missed" ? "✗" : "•";

          return (
            <Tooltip key={day.id} delayDuration={150}>
              <TooltipTrigger asChild>
                <span
                  className={`inline-flex items-center gap-0.5 text-[10px] font-semibold rounded px-1.5 py-0.5 border cursor-help ${cls}`}
                >
                  {dayLabel} {icon}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold">{dayLabel}</span>
                  {checkIn ? (
                    <>
                      <span>{formatDateTime(checkIn.checked_in_at)}</span>
                      {scannedBy && (
                        <span className="opacity-80">
                          {t("tickets.by", "by")} {scannedBy}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="opacity-80">
                      {dayEnded
                        ? t("tickets.missed", "Missed (not checked in)")
                        : t("tickets.notCheckedIn", "Not checked in yet")}
                    </span>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
    </div>
  );
}

export function getColumns({
  t,
  pageIndex,
  pageSize,
  locale,
  currency,
  symbol,
  eventDaysCount,
  eventDays,
}: ColumnProps): ColumnDef<TicketResponse>[] {
  const isMultiDay = !!eventDaysCount && eventDaysCount > 1;
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
            {formatCurrency(amount, currency ?? "JPY", symbol)}
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
        const checkIns = info.row.original.check_ins || [];
        // checked_in_count may be absent in the response; fall back to the
        // authoritative per-day list.
        const checkedInCount =
          info.row.original.checked_in_count || checkIns.length;
        const isCancelled = status === "cancelled" || status === "canceled";
        return (
          <div className="flex flex-col gap-1 items-start">
            <TicketStatusBadge status={status} />
            {isMultiDay && !isCancelled && (
              <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 rounded-sm px-1.5 py-0.5">
                {checkedInCount} / {eventDaysCount} {t("tickets.days", "days")}
              </span>
            )}
            {!isCancelled && checkIns.length > 0 && (
              <DayCheckInPills
                eventDays={eventDays}
                checkIns={checkIns}
                t={t}
              />
            )}
          </div>
        );
      },
    },
    {
      id: "check_in_time",
      header: isMultiDay
        ? t("tickets.columns.lastCheckInTime", "Last Check-in Time")
        : t("tickets.columns.checkInTime", "Check-In Time"),
      meta: { sortKey: "check_in_time" },
      cell: (info) => {
        const checkInTime = info.row.original.check_in_time;
        const checkedInCount = info.row.original.checked_in_count || 0;
        return (
          <div className="flex flex-col">
            <span className="text-gray-500 whitespace-nowrap">
              {checkInTime ? formatDateTime(checkInTime) : "-"}
            </span>
            {eventDaysCount && eventDaysCount > 1 && checkedInCount > 1 && (
              <span className="text-[10px] text-emerald-600 font-medium">
                {t("tickets.multipleScans", "Multiple scans")}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "checked_in_by",
      header: isMultiDay
        ? t("tickets.columns.lastCheckedInBy", "Last Checked In By")
        : t("tickets.columns.checkedInBy", "Checked In By"),
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
