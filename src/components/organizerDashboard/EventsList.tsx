"use client";

import { useState, useCallback } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { useOrganizerEvents } from "@/hooks/useOrganizerEvents";
import { useTranslation } from "@/hooks/useTranslation";
import { CalendarXIcon } from "@phosphor-icons/react/dist/ssr";
import { EventStatusSelect } from "@/components/EventStatusSelect";
import EventCard from "./EventCard";
import EventCardSkeleton from "./EventCardSkeleton";
import EventPagination from "./EventPagination";

const ITEMS_PER_PAGE = 9;

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

  const { events, totalPages, isLoading, isFetching, isError } =
    useOrganizerEvents({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      search: debouncedSearch,
      status: statusFilter,
    });

  const safeEvents = events ?? [];
  const showContentLoading =
    isLoading || (isFetching && safeEvents.length === 0);
  const hasActiveFilters = searchInput.trim() !== "" || statusFilter !== "all";

  return (
    <div className="flex-1 px-6 py-4 mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center w-full max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder={t(
              "event.placeholder.searchEvents",
              "Search events...",
            )}
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="w-full sm:w-48">
          <EventStatusSelect
            value={statusFilter}
            onChange={handleStatusChange}
            placeholder="event.filter.status"
          />
        </div>
      </div>

      {isError && (
        <div className="p-6 text-center text-red-500">
          {t("event.error.loadFailed", "Failed to load events.")}
        </div>
      )}

      {showContentLoading && !isError && (
        <div className="grid auto-fill-[400px] gap-6">
          <EventCardSkeleton count={6} />
        </div>
      )}

      {!showContentLoading && !isError && (
        <>
          <div className="grid auto-fill-[360px] gap-6">
            {safeEvents.length === 0 ? (
              <div className="col-span-full grid place-items-center py-12 text-gray-500">
                <CalendarXIcon className="w-12 h-12 mb-2" />
                <p className="text-lg">
                  {t("event.noEventsFound", "No events found")}
                </p>
                {hasActiveFilters && (
                  <p className="text-sm mt-2">
                    {t(
                      "event.adjustFilters",
                      "Try adjusting your search or filters",
                    )}
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
