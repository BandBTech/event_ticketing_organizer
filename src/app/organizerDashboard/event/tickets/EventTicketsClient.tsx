"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { eventService } from "@/services/eventService";
import { queryKeys } from "@/lib/queryKeys";
import { useTranslation } from "@/hooks/useTranslation";
import { useDebounce } from "@/hooks/useDebounce";
import { PaginationState } from "@tanstack/react-table";
import { DataTable } from "./data-table";
import { getColumns } from "./columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TicketIcon, Search, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EventTicketsClient() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("id");
  const router = useRouter();

  // Redirect if no event ID
  if (!eventId) {
    // Ideally should redirect or show error, but handled by loading/error states for now
  }

  // --- State ---
  const [globalFilter, setGlobalFilter] = useState("");
  const debouncedSearch = useDebounce(globalFilter, 500); // 500ms debounce
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // --- Data Fetching ---
  const { data: ticketsResponse, isLoading, isError } = useQuery({
    queryKey: queryKeys.events.tickets(eventId || "", {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: debouncedSearch,
    }),
    queryFn: () => eventService.getEventTickets(
      eventId || "",
      pagination.pageIndex + 1,
      pagination.pageSize,
      debouncedSearch || undefined
    ),
    enabled: !!eventId,
  });

  // Also fetch event details to get the title
  const { data: event } = useQuery({
    queryKey: queryKeys.events.detail(eventId || ""),
    queryFn: () => eventService.getEvent(eventId || ""),
    enabled: !!eventId,
  });

  const tickets = ticketsResponse?.tickets || [];
  const paginationData = ticketsResponse?.pagination;
  const totalPages = paginationData?.total_pages || 0;
  const totalTickets = paginationData?.total || 0;

  // --- Event Handlers ---
  const handleSearch = (value: string) => {
    setGlobalFilter(value);
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  // --- Columns ---
  const columns = useMemo(
    () => getColumns({
      t,
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize
    }),
    [t, pagination.pageIndex, pagination.pageSize]
  );

  if (!eventId) {
    return <div className="p-8 text-center text-red-500">Event ID is required</div>;
  }

  return (
    <div className="flex-1 space-y-6 p-6 container mx-auto max-w-7xl">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link
          href={`/organizerDashboard/event/details?id=${eventId}`}
          className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t('common.backToEvent', "Back to Event")}
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('tickets.pageTitle', "Event Tickets")}</h1>
            <p className="text-gray-500">
              {event?.title ? `Manage tickets for ${event.title}` : t('tickets.pageSubtitle', "View and manage all tickets purchased for this event.")}
            </p>
          </div>
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
            {t('tickets.totalSold', "Total Sold")}: {totalTickets}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={t('tickets.search', "Search by ticket number, name or email...")}
            value={globalFilter}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 bg-white border-gray-200"
          />
        </div>
      </div>

      {/* Table Content */}
      {isError ? (
        <div className="text-center p-8 text-red-500">{t('common.error', "An error occurred while loading tickets.")}</div>
      ) : (
        <DataTable
          columns={columns}
          data={tickets}
          isLoading={isLoading}
          pagination={pagination}
          onPaginationChange={setPagination}
          pageCount={totalPages}
          emptyState={
            <div className="flex flex-col items-center justify-center text-gray-500 py-12">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <TicketIcon className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-lg font-medium mb-1">
                {t('tickets.empty.title', "No tickets found")}
              </p>
              <p className="text-sm text-muted-foreground max-w-sm">
                {t('tickets.empty.description', "No tickets match your search criteria or none have been sold yet.")}
              </p>
            </div>
          }
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination(prev => ({ ...prev, pageIndex: Math.max(0, prev.pageIndex - 1) }))}
            disabled={pagination.pageIndex === 0}
            className="h-8 rounded-full px-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t('common.previous', "Previous")}
          </Button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              // Only show a window of pages including first, last, current, and surrounding
              (i === 0 || i === totalPages - 1 || (i >= pagination.pageIndex - 1 && i <= pagination.pageIndex + 1)) ? (
                <Button
                  key={i}
                  variant={pagination.pageIndex === i ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, pageIndex: i }))}
                  className={`h-8 w-8 rounded-full p-0 ${pagination.pageIndex === i ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                >
                  {i + 1}
                </Button>
              ) : (
                (i === 1 && pagination.pageIndex > 2) || (i === totalPages - 2 && pagination.pageIndex < totalPages - 3) ? <span key={i} className="flex items-center justify-center w-8 text-gray-400">...</span> : null
              )
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination(prev => ({ ...prev, pageIndex: Math.min(totalPages - 1, prev.pageIndex + 1) }))}
            disabled={pagination.pageIndex >= totalPages - 1}
            className="h-8 rounded-full px-4"
          >
            {t('common.next', "Next")}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
