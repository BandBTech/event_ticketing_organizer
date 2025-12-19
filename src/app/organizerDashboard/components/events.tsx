"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { eventService } from "@/services/eventService";
import { Event, EventListResponse } from "@/types/event";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useDebouncedState } from "@/hooks/useDebounce";
import EventCard from "./EventCard";
import EventCardSkeleton from "./EventCardSkeleton";
import EventPagination from "./EventPagination";
import { CalendarXIcon } from "@phosphor-icons/react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import { useTranslation } from "@/hooks/useTranslation";

export default function Events() {
  const { t } = useTranslation();
  // Use debounced state: searchInput for display, debouncedSearch for filtering
  const [searchInput, debouncedSearch, setSearchInput] = useDebouncedState("", 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const itemsPerPage = 9;

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ["events", currentPage, debouncedSearch, statusFilter],
    queryFn: () => eventService.getEvents({
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearch,
      status: statusFilter === "all" ? undefined : statusFilter
    }),
  });

  // Handle both array (legacy/mock) and new EventListResponse format
  const events = data ? (
    Array.isArray(data) ? data : (data as unknown as EventListResponse).events || []
  ) : [];

  const totalPages = data && !Array.isArray(data)
    ? (data as unknown as EventListResponse).total_pages
    : 0;

  // Show skeletons only on initial load or hard refresh, not on background refetch if we want smoother UX,
  // but for pagination/filtering changes, loading state is better.
  const showLoading = isLoading || (isFetching && !data);

  if (showLoading) {
    return (
      <div className="flex-1 px-6 py-4">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <Skeleton className="h-10 w-full max-w-md rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xxl:grid-cols-4 gap-6">
          <EventCardSkeleton count={6} />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-red-500">Failed to load events.</div>
    );
  }

  return (
    <div className="flex-1 px-6 py-4">
      {/* Search Bar & Filter */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center w-full max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder={t("common.placeholder.searchEvents", "Search events...")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div> */}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xxl:grid-cols-4 gap-6">
        {events.length === 0 ? (
          <div className="col-span-full grid place-items-center py-12 text-gray-500">
            <CalendarXIcon className="w-12 h-12 mb-2" />
            <p className="text-lg">{t("event.text.noEventsFound", "No events found")}</p>
            {(searchInput || statusFilter !== "all") && (
              <p className="text-sm mt-2">{t("event.text.adjustFilters", "Try adjusting your search or filters")}</p>
            )}
          </div>
        ) : (
          events.map((event) => (
            // Cast to generic Event type as EventCard handles missing optional props gracefully or we ensure backend returns enough
            <EventCard key={event.id} event={event as unknown as Event} />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <EventPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className="mt-8"
        />
      )}
    </div>
  );
}
