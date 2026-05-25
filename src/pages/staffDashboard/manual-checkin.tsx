import Head from "next/head";
import { useState, useRef } from "react";
import { useRouter } from "next/router";
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  X,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import StaffDashboardLayout from "@/components/layout/StaffDashboardLayout";
import { useSearchTickets, useManualCheckIn } from "@/hooks/useTickets";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/lib/toast";
import type { Ticket } from "@/types/ticket";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { eventService } from "@/services/eventService";
import { queryKeys } from "@/lib/queryKeys";
import { getDefaultEventDay } from "@/hooks/useScannerState";
import { formatDateTime, parseTicketScanMessage } from "@/lib/utils";

export default function ManualCheckinPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const eventId = router.query.eventId as string;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Ticket[]>([]);
  const [checkedInIds, setCheckedInIds] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  const searchMutation = useSearchTickets();
  const checkInMutation = useManualCheckIn();

  const { data: eventData } = useQuery({
    queryKey: queryKeys.events.detail(eventId ?? ""),
    queryFn: () => eventService.getEvent(eventId!),
    enabled: !!eventId,
  });

  const [selectedEventDayId, setSelectedEventDayId] = useState<string | null>(null);

  useEffect(() => {
    if (eventData?.event_days && eventData.event_days.length > 0 && !selectedEventDayId) {
      const defaultDayId = getDefaultEventDay(eventData.event_days);
      setSelectedEventDayId(defaultDayId);
    }
  }, [eventData, selectedEventDayId]);

  // Reset checked-in cache when active day changes
  useEffect(() => {
    setCheckedInIds(new Set());
    if (query.trim() && eventId) {
      searchMutation.mutate(
        { eventId, q: query.trim() },
        {
          onSuccess: (data) => setResults(data),
        }
      );
    }
  }, [selectedEventDayId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !eventId) return;
    searchMutation.mutate(
      { eventId, q: query.trim() },
      {
        onSuccess: (data) => setResults(data),
        onError: (err) => {
          const { title: parsedTitle, description: parsedDesc } = parseTicketScanMessage(
            err.message,
            t("common.error", "Error")
          );
          toast.error(parsedTitle, parsedTitle, parsedDesc);
        },
      },
    );
  };

  const handleCheckIn = (ticket: Ticket) => {
    checkInMutation.mutate(
      { ticketNumber: ticket.ticket_number, eventId, eventDayId: selectedEventDayId || undefined },
      {
        onSuccess: (data) => {
          if (data.success) {
            setCheckedInIds((prev) => new Set(prev).add(ticket.id));
            const defaultFallback = data.already_checked_in
              ? "Already checked in"
              : "Ticket checked in successfully.";
            const { title: parsedTitle, description: parsedDesc } = parseTicketScanMessage(
              data.message,
              defaultFallback
            );
            toast.success(
              data.already_checked_in
                ? "scanner.ticket_already_checked_in"
                : "manualCheckin.checkInSuccess",
              parsedTitle,
              parsedDesc
            );
          } else {
            const { title: parsedTitle, description: parsedDesc } = parseTicketScanMessage(
              data.message || data.error,
              t("common.error", "Error")
            );
            toast.error(parsedTitle, parsedTitle, parsedDesc);
          }
        },
        onError: (err) => {
          const { title: parsedTitle, description: parsedDesc } = parseTicketScanMessage(
            err.message,
            t("common.error", "Error")
          );
          toast.error(parsedTitle, parsedTitle, parsedDesc);
        },
      },
    );
  };

  const isCheckedIn = (ticket: Ticket) =>
    ticket.checked_in || checkedInIds.has(ticket.id);

  return (
    <>
      <Head>
        <title>{t("manualCheckin.title", "Manual Check-in")}</title>
      </Head>

      <StaffDashboardLayout>
        <PermissionGuard permission={PERMISSIONS.TICKET_SCAN}>
          <div className="p-6 space-y-6 max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                aria-label={t(
                  "staffScanner.backToDashboard",
                  "Back to Dashboard",
                )}
              >
                <ArrowLeftIcon size={20} />
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {t("manualCheckin.title", "Manual Check-in")}
                </h1>
                {eventData?.title && (
                  <p className="text-sm font-semibold text-gray-700 mt-1">
                    {eventData.title}
                  </p>
                )}
                {eventData?.start_date && eventData?.end_date && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatDateTime(eventData.start_date)} - {formatDateTime(eventData.end_date)}
                  </p>
                )}
              </div>
            </div>

            {/* Event Day Selector */}
            {eventData?.event_days && eventData.event_days.length > 1 && (
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                  {t("manualCheckin.selectActiveDay", "Active Check-in Day")}
                </span>
                <div className="flex flex-wrap gap-2">
                  {eventData.event_days.map((day, idx) => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => setSelectedEventDayId(day.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                        selectedEventDayId === day.id
                          ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {day.name || `Day ${idx + 1}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search form */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={searchMutation.isPending}
                  placeholder={t(
                    "manualCheckin.searchPlaceholder",
                    "Search by ticket number...",
                  )}
                  className="min-h-10 pr-8"
                  autoFocus
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setResults([]);
                      inputRef.current?.focus();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <Button
                type="submit"
                disabled={!query.trim() || searchMutation.isPending}
              >
                <MagnifyingGlassIcon size={18} className="mr-1" />
                <span className="max-md:hidden">
                  {searchMutation.isPending
                    ? t("common.searching", "Searching...")
                    : t("common.search", "Search")}
                </span>
              </Button>
            </form>

            {/* Results */}
            {results.length > 0 ? (
              <ul className="space-y-3">
                  {results.map((ticket) => {
                    const checkedIn = isCheckedIn(ticket);
                  const isCheckingIn =
                    checkInMutation.isPending &&
                    checkInMutation.variables?.ticketNumber ===
                      ticket.ticket_number;

                  return (
                    <li
                      key={ticket.id}
                      className="flex flex-col md:flex-row items-stretch md:items-center gap-4 rounded-xl border p-4 bg-white shadow-sm"
                    >
                      {/* Left: ticket info */}
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex mb-2 justify-between items-center">
                          <p className="font-semibold text-md truncate">
                            #{ticket.ticket_number}
                          </p>
                        </div>
                        <div className="bg-gray-50 border p-2 rounded-md relative">
                          <div className="text-sm text-primary -mb-0.5">
                            Buyer
                          </div>
                          <p className="text-md text-gray-700">
                            {ticket.attendee?.name || ticket.buyer_name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {ticket.attendee?.email || ticket.buyer_email}
                          </p>
                          <span
                            className={`absolute top-1.5 right-1 text-xs px-2 py-0.5 rounded-full font-semibold ${
                              checkedIn
                                ? "bg-green-100 text-green-700"
                                : ticket.status === "active"
                                  ? "bg-blue-100 text-blue-700"
                                  : ticket.status === "cancelled"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {checkedIn
                              ? t("manualCheckin.checkedIn", "Checked In")
                              : ticket.status.charAt(0).toUpperCase() +
                                ticket.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      {/* Right: action or checked-in indicator */}
                      {!checkedIn && (
                        <div className="shrink-0 flex items-center">
                          <Button
                            disabled={isCheckingIn}
                            onClick={() => handleCheckIn(ticket)}
                            className="w-full"
                          >
                            {isCheckingIn
                              ? t("common.processing", "Processing...")
                              : t("manualCheckin.checkIn", "Check In")}
                          </Button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : searchMutation.isSuccess ? (
              <p className="text-center text-gray-500 py-8">
                {t("manualCheckin.noResults", "No tickets found.")}
              </p>
            ) : null}
          </div>
        </PermissionGuard>
      </StaffDashboardLayout>
    </>
  );
}
