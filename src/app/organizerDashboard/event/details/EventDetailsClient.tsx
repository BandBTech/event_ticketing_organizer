"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { eventService } from "@/services/eventService";
import { EventAnalyticsResponse } from "@/types/event";
import EventDetailsPage from "../../components/eventDetails";
import { Loader2 } from "lucide-react";
import { queryKeys } from "@/lib/queryKeys";


export default function EventDetailsRoute() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("id");

  // Ensure eventId is a string, default to empty string if null to satisfy query key type, 
  // but enabled flag will prevents execution if empty.
  const safeId = eventId || "";

  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: queryKeys.events.detail(safeId),
    queryFn: () => eventService.getEvent(safeId),
    enabled: !!eventId, // Only run if eventId exists
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: queryKeys.events.analytics(safeId),
    queryFn: () => eventService.getEventAnalytics(safeId),
    enabled: !!eventId,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  if (!eventId) {
    return <div className="p-8 text-center text-gray-500">Loading event details...</div>;
  }

  if (eventLoading || analyticsLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return <div className="p-8 text-center text-red-500">Event not found</div>;
  }

  return <EventDetailsPage event={event} analytics={analytics as EventAnalyticsResponse | undefined} />;
}
