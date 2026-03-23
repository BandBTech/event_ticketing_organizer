"use client";

import { useState, useCallback } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { useOrganizerEvents } from "@/hooks/useOrganizerEvents";
import { useTranslation } from "@/hooks/useTranslation";
import { CalendarXIcon } from "@phosphor-icons/react/dist/ssr";
import EventCard from "./EventCard";
import EventCardSkeleton from "./EventCardSkeleton";
import EventPagination from "./EventPagination";

const ITEMS_PER_PAGE = 9;

const EVENT_STATUSES = [
  { value: "all", label: "All Statuses" },
  { value: "approved", label: "Approved" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
  { value: "hold", label: "On Hold" },
  { value: "live", label: "Live" },
  { value: "on_sale", label: "On Sale" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
] as const;

export default function EventsList() {
  const { t } = useTranslation();

  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearch = useDebounce(searchInput, 300);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  }, []);

  const {
    events,
    totalPages,
    isLoading,
    isFetching,
    isError,
  } = useOrganizerEvents({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: debouncedSearch,
    status: statusFilter,
  });

  const safeEvents = events ?? [];
  const showContentLoading = isLoading || (isFetching && safeEvents.length === 0);
  const hasActiveFilters = searchInput.trim() !== "" || statusFilter !== "all";

  return (
    <div className="flex-1 px-6 py-4 container mx-auto max-w-7xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center w-full max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder={t("event.placeholder.searchEvents", "Search events...")}
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder={t("event.filter.status", "Filter by Status")} />
            </SelectTrigger>
            <SelectContent>
              {EVENT_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {t(status.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isError && (
        <div className="p-6 text-center text-red-500">
          {t("event.error.loadFailed", "Failed to load events.")}
        </div>
      )}

      {showContentLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xxl:grid-cols-4 gap-6">
          <EventCardSkeleton count={6} />
        </div>
      )}

      {!showContentLoading && !isError && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xxl:grid-cols-4 gap-6">
            {safeEvents.length === 0 ? (
              <div className="col-span-full grid place-items-center py-12 text-gray-500">
                <CalendarXIcon className="w-12 h-12 mb-2" />
                <p className="text-lg">
                  {t("event.noEventsFound", "No events found")}
                </p>
                {hasActiveFilters && (
                  <p className="text-sm mt-2">
                    {t("event.adjustFilters", "Try adjusting your search or filters")}
                  </p>
                )}
              </div>
            ) : (
                safeEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))
            )}
          </div>

          {safeEvents.length > 0 && totalPages > 1 && (
            <EventPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="mt-8"
            />
          )}
        </>
      )}
    </div>
  );
}
