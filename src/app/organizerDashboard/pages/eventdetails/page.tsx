
"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { eventService } from "@/services/eventService";
import EventDetailsPage from "../../components/eventDetails";
import { Loader2 } from "lucide-react";
import { EventAnalyticsResponse } from "@/types/event";

export default function EventDetailsRoute() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("id");

  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventService.getEvent(eventId!),
    enabled: !!eventId,
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['eventAnalytics', eventId],
    queryFn: () => eventService.getEventAnalytics(eventId!),
    enabled: !!eventId,
  });

  if (!eventId) {
    return <div className="p-8 text-center text-gray-500">Event ID missing</div>;
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

