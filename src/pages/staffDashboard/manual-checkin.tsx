import Head from "next/head";
import { useState, useRef } from "react";
import { useRouter } from "next/router";
import { ArrowLeft, MagnifyingGlass } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import StaffDashboardLayout from "@/components/layout/StaffDashboardLayout";
import { useSearchTickets, useScanTicket } from "@/hooks/useTickets";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/lib/toast";
import type { Ticket } from "@/types/ticket";

export default function ManualCheckinPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const eventId = router.query.eventId as string;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Ticket[]>([]);
  const [checkedInIds, setCheckedInIds] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  const searchMutation = useSearchTickets();
  const scanMutation = useScanTicket();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !eventId) return;
    searchMutation.mutate(
      { eventId, q: query.trim() },
      {
        onSuccess: (data) => setResults(data),
        onError: (err) => toast.error(t("common.error", "Error"), err.message),
      }
    );
  };

  const handleCheckIn = (ticket: Ticket) => {
    scanMutation.mutate(
      { ticketCode: ticket.qr_code, eventId },
      {
        onSuccess: (data) => {
          if (data.success) {
            setCheckedInIds((prev) => new Set(prev).add(ticket.id));
            toast.success(
              data.already_checked_in
                ? t("scanner.ticket_already_checked_in", "Already checked in")
                : t("manualCheckin.checkInSuccess", "Ticket checked in successfully."),
              data.message || ""
            );
          } else {
            toast.error(t("common.error", "Error"), data.message || data.error || "");
          }
        },
        onError: (err) => toast.error(t("common.error", "Error"), err.message),
      }
    );
  };

  const isCheckedIn = (ticket: Ticket) =>
    ticket.checked_in || checkedInIds.has(ticket.id);

  return (
    <>
      <Head>
        <title>{t("manualCheckin.title", "Manual Check-in")} | Staff Dashboard</title>
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
                aria-label={t("staffScanner.backToDashboard", "Back to Dashboard")}
              >
                <ArrowLeft size={20} />
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {t("manualCheckin.title", "Manual Check-in")}
                </h1>
              </div>
            </div>

            {/* Search form */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("manualCheckin.searchPlaceholder", "Search by ticket number...")}
                className="flex-1"
                autoFocus
              />
              <Button type="submit" disabled={!query.trim() || searchMutation.isPending}>
                <MagnifyingGlass size={18} className="mr-2" />
                {searchMutation.isPending
                  ? t("common.searching", "Searching...")
                  : t("manualCheckin.search", "Search")}
              </Button>
            </form>

            {/* Results */}
            {results.length > 0 ? (
              <ul className="space-y-3">
                {results.map((ticket) => {
                  const checkedIn = isCheckedIn(ticket);
                  const isCheckingIn =
                    scanMutation.isPending && scanMutation.variables?.ticketCode === ticket.qr_code;

                  return (
                    <li
                      key={ticket.id}
                      className="flex items-start justify-between gap-4 rounded-xl border p-4 bg-white shadow-sm"
                    >
                      <div className="space-y-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          #{ticket.ticket_number}
                        </p>
                        <p className="text-sm text-gray-700">{ticket.buyer_name}</p>
                        <p className="text-xs text-gray-500 truncate">{ticket.buyer_email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              checkedIn
                                ? "bg-green-100 text-green-700"
                                : ticket.status === "valid"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {checkedIn
                              ? t("manualCheckin.alreadyCheckedIn", "Already Checked In")
                              : ticket.status}
                          </span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        disabled={checkedIn || isCheckingIn || ticket.status !== "valid"}
                        onClick={() => handleCheckIn(ticket)}
                        className="shrink-0"
                      >
                        {isCheckingIn
                          ? t("common.processing", "Processing...")
                          : checkedIn
                          ? t("manualCheckin.alreadyCheckedIn", "Already Checked In")
                          : t("manualCheckin.checkIn", "Check In")}
                      </Button>
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
