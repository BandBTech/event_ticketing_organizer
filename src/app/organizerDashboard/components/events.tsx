"use client";

import { useState } from "react";
import {
  Calendar,
  MapPin,
  Search,
  Filter,
  ArrowRight,
  PencilLine,
  ArrowLeft,
  CircleDot,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { eventService } from "@/services/eventService";
import { Event } from "@/types/event";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

export default function Events() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 3 columns x 3 rows

  const {
    data: queryData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["events"],
    queryFn: eventService.getEvents,
  });

  const events = Array.isArray(queryData)
    ? queryData
    : (queryData as unknown as { events: Event[] } | undefined)?.events || [];

  const filteredEvents = Array.isArray(events)
    ? events.filter((event: Event) =>
      event.title.toLowerCase().includes(search.toLowerCase())
    )
    : [];

  // Pagination calculations
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEvents = filteredEvents.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (isLoading) {
    return (
      <div className="flex-1 px-6 py-4">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-10 w-full max-w-md rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg ml-4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl shadow-md overflow-hidden flex flex-col h-full bg-white"
            >
              <Skeleton className="h-40 w-full" />
              <div className="p-4 space-y-3 flex flex-col flex-1">
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-lg" />
                  <Skeleton className="h-6 w-16 rounded-lg" />
                </div>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/2" />
                <div className="mt-auto pt-3">
                  <div className="my-4 border-t border-gray-100" />
                  <div className="flex justify-between">
                    <Skeleton className="h-9 w-24 rounded-lg" />
                    <Skeleton className="h-9 w-9 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          ))}
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center w-full max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search events"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        {/* <button className="ml-4 flex items-center gap-2 px-4 py-2 border rounded-lg shadow-sm hover:bg-gray-50">
          <Filter className="w-5 h-5" />
          Filter events
        </button> */}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentEvents.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <p className="text-lg">No events found</p>
            {search && (
              <p className="text-sm mt-2">Try adjusting your search terms</p>
            )}
          </div>
        ) : (
          currentEvents.map((event) => {
            const eventDate = event.start_date
              ? new Date(event.start_date)
              : null;
            const eventEndDate = event.end_date
              ? new Date(event.end_date)
              : null;
            const formattedDate = eventDate
              ? format(eventDate, "MMM dd, yyyy")
              : "TBA";
            const formattedTime = eventDate ? format(eventDate, "hh:mm a") : "";
            const now = new Date();

            // Determine event status
            const getEventStatus = () => {
              // If event has ended
              if (eventEndDate && eventEndDate < now) {
                return {
                  label: "ENDED",
                  color: "bg-gradient-to-r from-gray-500 to-gray-400",
                  icon: false,
                };
              }

              // If event is currently happening
              if (
                eventDate &&
                eventEndDate &&
                eventDate <= now &&
                eventEndDate >= now
              ) {
                return {
                  label: "LIVE NOW",
                  color: "bg-gradient-to-r from-red-600 to-pink-500",
                  icon: true,
                };
              }

              // Check if any tickets exist
              const hasTickets =
                event.tiers &&
                Array.isArray(event.tiers) &&
                event.tiers.length > 0;

              if (hasTickets) {
                // Check if all tickets are sold out
                const allSoldOut = event.tiers.every(
                  (ticket: any) => (ticket.sold || 0) >= ticket.quantity
                );

                if (allSoldOut) {
                  return {
                    label: "SOLD OUT",
                    color: "bg-gradient-to-r from-red-500 to-red-400",
                    icon: false,
                  };
                }

                // Check if sales have started
                const firstTicket = event.tiers[0];
                const salesStart = firstTicket.sales_start
                  ? new Date(firstTicket.sales_start)
                  : null;
                const salesEnd = firstTicket.sales_end
                  ? new Date(firstTicket.sales_end)
                  : null;

                // If sales haven't started yet
                if (salesStart && salesStart > now) {
                  return {
                    label: "UPCOMING",
                    color: "bg-gradient-to-r from-blue-500 to-blue-400",
                    icon: false,
                  };
                }

                // If sales have ended
                if (salesEnd && salesEnd < now) {
                  return {
                    label: "SALES ENDED",
                    color: "bg-gradient-to-r from-orange-500 to-orange-400",
                    icon: false,
                  };
                }

                // Sales are active
                return {
                  label: "ON SALE",
                  color: "bg-gradient-to-r from-green-500 to-emerald-400",
                  icon: true,
                };
              }

              // If event is in the future but no tickets
              if (eventDate && eventDate > now) {
                return {
                  label: "UPCOMING",
                  color: "bg-gradient-to-r from-blue-500 to-blue-400",
                  icon: false,
                };
              }

              // Default
              return {
                label: "SCHEDULED",
                color: "bg-gradient-to-r from-gray-500 to-gray-400",
                icon: false,
              };
            };

            const status = getEventStatus();

            return (
              <div
                key={event.id}
                className="rounded-xl bg-white/60 shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 overflow-hidden flex flex-col h-full" // Added flex flex-col h-full
              >
                {/* Image */}
                <div className="relative h-40">
                  <Image
                    src={event.banner_image || "/placeholder.png"}
                    alt={event.title}
                    fill={true}
                    className="w-full h-full object-cover"
                  />
                  <span
                    className={`flex items-center gap-1 absolute top-2 left-2 text-xs font-semibold px-3 py-1 rounded-full text-white shadow-lg ${status.color}`}
                  >
                    {status.icon && (
                      <CircleDot className="w-3 h-3 animate-pulse" />
                    )}
                    {status.label}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3 flex flex-col flex-1">
                  {" "}
                  {/* Added flex flex-col flex-1 */}
                  {/* Tags */}
                  <div className="flex text-gray-700 flex-wrap gap-2">
                    {Array.isArray(event.category)
                      ? event.category.map((tag: string) => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-200 px-2 py-1 rounded-lg"
                        >
                          {tag}
                        </span>
                      ))
                      : typeof event.category === "string"
                        ? (event.category as string)
                          .split(",")
                          .map((tag: string) => (
                            <span
                              key={tag}
                              className="text-xs bg-gray-200 px-2 py-1 rounded-lg"
                            >
                              {tag}
                            </span>
                          ))
                        : null}
                  </div>
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {event.title}
                  </h3>
                  {/* Date & Location */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {formattedDate} {formattedTime && `• ${formattedTime}`}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {event.address}
                  </div>
                  {/* Actions */}
                  <div className="mt-auto pt-3">
                    <div className="my-4 border-t border-gray-300" />
                    <div className="flex justify-between items-center">
                      <Link
                        href={`/organizerDashboard/pages/eventdetails?id=${event.id}`}
                        className="flex items-center gap-2 border border-gray-300 hover:no-underline rounded-lg p-2 text-sm text-gray-700 font-medium hover:bg-gray-100 hover:shadow-lg"
                      >
                        View Detail <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/organizerDashboard/pages/createevents?id=${event.id}&edit=true`}
                        className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 hover:shadow-lg"
                      >
                        <PencilLine className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center text-gray-700 items-center gap-2 mt-8">
          <button
            onClick={goToPrevious}
            disabled={currentPage === 1}
            className={`flex items-center px-3 py-1 border border-gray-300 rounded-full transition-colors ${currentPage === 1
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-50 hover:shadow-sm"
              }`}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Previous
          </button>

          {/* Page Numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            // Show first page, last page, current page, and pages around current
            const showPage =
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1);

            if (!showPage) {
              // Show ellipsis
              if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span key={page} className="px-2 text-gray-400">
                    ...
                  </span>
                );
              }
              return null;
            }

            return (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-3 py-1 rounded-full transition-all ${currentPage === page
                  ? "bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-md"
                  : "border border-gray-300 hover:bg-gray-50 hover:shadow-sm"
                  }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={goToNext}
            disabled={currentPage === totalPages}
            className={`flex items-center px-3 py-1 border border-gray-300 rounded-full transition-colors ${currentPage === totalPages
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-50 hover:shadow-sm"
              }`}
          >
            Next
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}
