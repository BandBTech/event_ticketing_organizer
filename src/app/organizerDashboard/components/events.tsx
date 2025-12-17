"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { eventService } from "@/services/eventService";
import { Event } from "@/types/event";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useDebouncedState } from "@/hooks/useDebounce";
import EventCard from "./EventCard";
import EventCardSkeleton from "./EventCardSkeleton";
import EventPagination from "./EventPagination";
import { CalendarXIcon } from "@phosphor-icons/react";

export default function Events() {
  // Use debounced state: searchInput for display, debouncedSearch for filtering
  const [searchInput, debouncedSearch, setSearchInput] = useDebouncedState("", 300);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const {
    data: queryData,
    isLoading,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ["events"],
    queryFn: () => eventService.getEvents(),
  });

  const events = Array.isArray(queryData)
    ? queryData
    : (queryData as unknown as { events: Event[] } | undefined)?.events || [];

  // Filter using debounced search value
  const filteredEvents = Array.isArray(events)
    ? events.filter((event: Event) =>
      event.title.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
    : [];

  // Pagination calculations
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEvents = filteredEvents.slice(startIndex, endIndex);

  // Reset to page 1 when debounced search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  if (isLoading || isFetching) {
    return (
      <div className="flex-1 px-6 py-4">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-10 w-full max-w-md rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg ml-4" />
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
      {/* Search Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center w-full max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search events"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xxl:grid-cols-4 gap-6">
        {currentEvents.length === 0 ? (
          <div className="col-span-full grid place-items-center py-12 text-gray-500">
            <CalendarXIcon className="w-12 h-12 mb-2" />
            <p className="text-lg">No events found</p>
            {searchInput && (
              <p className="text-sm mt-2">Try adjusting your search terms</p>
            )}
          </div>
        ) : (
          currentEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))
        )}
      </div>

      {/* Pagination */}
      <EventPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className="mt-8"
      />
    </div>
  );
}
