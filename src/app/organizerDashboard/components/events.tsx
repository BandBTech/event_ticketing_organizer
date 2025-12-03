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

export default function Events() {
  const [search, setSearch] = useState("");

  const { data: queryData, isLoading, isError } = useQuery({
    queryKey: ['events'],
    queryFn: eventService.getEvents,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const events = (queryData as any)?.events || (Array.isArray(queryData) ? queryData : []);

  const filteredEvents = Array.isArray(events) ? events.filter((event: Event) =>
    event.title.toLowerCase().includes(search.toLowerCase())
  ) : [];

  if (isLoading) {
    return (
      <div className="flex-1 px-6 py-4">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-10 w-full max-w-md rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg ml-4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl shadow-md overflow-hidden flex flex-col h-full bg-white">
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
    )
  }

  if (isError) {
    return <div className="p-6 text-center text-red-500">Failed to load events.</div>
  }
  return (
    <div className="flex-1 px-6 py-4">
  
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center w-full max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search events"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <button className="ml-4 flex items-center gap-2 px-4 py-2 border rounded-lg shadow-sm hover:bg-gray-50">
          <Filter className="w-5 h-5" />
          Filter events
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => {
          const eventDate = event.start_date ? new Date(event.start_date) : null;
          const formattedDate = eventDate ? format(eventDate, "MMM dd, yyyy") : "TBA";
          const formattedTime = eventDate ? format(eventDate, "hh:mm a") : "";

          // Determine status based on dates or other logic if not provided by API directly
          // Assuming API provides status or we derive it. 
          // If API doesn't provide status, we might need to calculate it.
          // For now, let's use a default or derived status if missing.
          const status = "ON SALE"; // Placeholder logic

          return (
          <div
            key={event.id}
            className="rounded-xl shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 overflow-hidden flex flex-col h-full" // Added flex flex-col h-full
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
                className={`flex items-center gap-1 absolute top-2 left-2 text-xs font-semibold px-3 py-1 rounded-full text-white ${
                    status === "ON SALE"
                  ? "bg-gradient-to-r from-green-500 to-emerald-400" 
                    : status === "SOLD OUT"
                  ? "bg-gradient-to-r from-red-500 to-red-400"
                  : "bg-gradient-to-r from-yellow-500 to-amber-400"
                }`}
              >
                  {status === "ON SALE" && (
                  <CircleDot className="w-3 h-3" />
                )}
                  {status}
              </span>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3 flex flex-col flex-1"> {/* Added flex flex-col flex-1 */}
              {/* Tags */}
              <div className="flex text-gray-700 flex-wrap gap-2">
                  {Array.isArray(event.category) ? event.category.map((tag: string) => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-200 px-2 py-1 rounded-lg"
                    >
                      {tag}
                    </span>
                  )) : typeof event.category === 'string' ? (event.category as string).split(',').map((tag: string) => (
                    <span
                    key={tag}
                    className="text-xs bg-gray-200 px-2 py-1 rounded-lg"
                  >
                    {tag}
                  </span>
                  )) : null}
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
                  <button className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 hover:shadow-lg">
                    <PencilLine className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          )
        })}
      </div>

      {/* Pagination */}
      <div className="flex justify-center text-gray-700 items-center gap-2 mt-8">
        <button className="flex items-center px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-50">
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>
        <button className="px-3 py-1 rounded-full border-gray-300 bg-gradient-to-r from-blue-600 to-indigo-500 text-white">
          1
        </button>
        <button className="px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-50">
          2
        </button>
        <button className="px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-50">
          3
        </button>
        <button className="flex items-center px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-50">
          Next
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}