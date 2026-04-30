import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { eventService } from "@/services/eventService";
import { queryKeys } from "@/lib/queryKeys";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/store/languageStore";
import { useCurrencyStore } from "@/store/currencyStore";
import { useDebounce } from "@/hooks/useDebounce";
import { usePaginationSync } from "@/hooks/usePaginationSync";
import { getColumns } from "@/components/organizerDashboard/tickets/columns";
import { Input } from "@/components/ui/input";
import { TicketIcon, Search, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/providers/ProtectedRoute";
import { PERMISSIONS } from "@/lib/permissions";
import Head from "next/head";
import { ReusableTable } from "@/components/organizerDashboard/ReusableTable";

function EventTicketsTable({
  eventId,
  currentPage,
  limit,
  search,
  t,
  sortBy,
  sortOrder,
  onSortChange,
  onPageChange,
  onLimitChange,
}: {
  eventId: string;
  currentPage: number;
  limit: number;
  search: string;
  t: (key: string, fallback?: string) => string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange: (
    sortBy: string | undefined,
    sortOrder: "asc" | "desc" | undefined,
  ) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}) {
  const { locale } = useLanguageStore();
  const { currency } = useCurrencyStore();
  const { data: ticketsResponse, isLoading } = useQuery({
    queryKey: queryKeys.events.tickets(eventId, {
      page: currentPage,
      limit,
      search: search,
      sort_by: sortBy,
      sort_order: sortOrder,
    }),
    queryFn: () =>
      eventService.getEventTickets(
        eventId,
        currentPage,
        limit,
        search || undefined,
        sortBy,
        sortOrder,
      ),
    enabled: !!eventId,
  });

  const tickets = ticketsResponse?.tickets || [];
  const paginationData = ticketsResponse?.pagination;
  const totalPages = paginationData?.total_pages || 0;

  const columns = useMemo(
    () =>
      getColumns({
        t,
        pageIndex: currentPage - 1,
        pageSize: limit,
        locale,
        currency,
      }),
    [t, currentPage, limit, locale, currency],
  );

  return (
    <ReusableTable
      wrapperClassName="flex-1 min-h-0 overflow-auto"
      columns={columns}
      data={tickets}
      isLoading={isLoading}
      currentPage={currentPage}
      totalPages={totalPages}
      total={paginationData?.total}
      limit={limit}
      onLimitChange={onLimitChange}
      hasNextPage={currentPage < totalPages}
      hasPreviousPage={currentPage > 1}
      onPageChange={onPageChange}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSortChange={onSortChange}
      emptyState={
        <div className="flex flex-col items-center justify-center text-gray-500 py-12">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <TicketIcon className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-lg font-medium mb-1">
            {t("tickets.empty.title", "No tickets found")}
          </p>
          <p className="text-sm text-muted-foreground max-w-sm text-center">
            {t(
              "tickets.empty.description",
              "No tickets match your search criteria or none have been sold yet.",
            )}
          </p>
        </div>
      }
    />
  );
}

export default function EventTicketsPage() {
  const router = useRouter();
  const { id } = router.query;
  const eventId = id as string;
  const { t } = useTranslation();

  const [globalFilter, setGlobalFilter] = useState("");
  const debouncedSearch = useDebounce(globalFilter, 500);

  const { currentPage, limit, handlePageChange, handleLimitChange } =
    usePaginationSync();

  // Sorting state
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(
    undefined,
  );

  const { data: event, isLoading: isEventLoading } = useQuery({
    queryKey: queryKeys.events.detail(eventId),
    queryFn: () => eventService.getEvent(eventId),
    enabled: router.isReady && !!eventId,
  });

  const handleSearch = (value: string) => {
    setGlobalFilter(value);
    handlePageChange(1);
  };

  const handleSortChange = useCallback(
    (
      newSortBy: string | undefined,
      newSortOrder: "asc" | "desc" | undefined,
    ) => {
      setSortBy(newSortBy);
      setSortOrder(newSortOrder);
      handlePageChange(1);
    },
    [handlePageChange],
  );

  return (
    <>
      <Head>
        <title>{t("tickets.pageTitle", "Event Tickets")}</title>
      </Head>
      <DashboardLayout>
        <ProtectedRoute permission={[PERMISSIONS.EVENT_READ]}>
          <div className="flex-1 space-y-6 p-4 lg:p-6 @container mx-auto w-full h-full flex flex-col overflow-hidden">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors w-fit"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                {t("common.backToEvent", "Back to Event")}
              </button>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {t("tickets.pageTitle", "Event Tickets")}
                  </h1>
                  <p className="text-gray-500">
                    {event?.title
                      ? `Manage tickets for ${event.title}`
                      : t(
                          "tickets.pageSubtitle",
                          "View and manage all tickets purchased for this event.",
                        )}
                  </p>
                </div>
              </div>
            </div>
            <div className="glass-card-lowest rounded-2xl flex-1 min-h-0 flex flex-col">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder={t(
                      "tickets.search",
                      "Search by ticket number, name or email...",
                    )}
                    value={globalFilter}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-9 bg-white border-gray-200"
                  />
                </div>
              </div>

              {!router.isReady || (isEventLoading && !event) ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <EventTicketsTable
                  eventId={eventId}
                  currentPage={currentPage}
                  limit={limit}
                  search={debouncedSearch}
                  t={t}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSortChange={handleSortChange}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                />
              )}
            </div>
          </div>
        </ProtectedRoute>
      </DashboardLayout>
    </>
  );
}
