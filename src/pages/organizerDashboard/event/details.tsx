import { useRouter } from "next/router";
import { useQueries } from "@tanstack/react-query";
import { eventService } from "@/services/eventService";
import { EventAnalyticsResponse } from "@/types/event";
import EventDetails from "@/components/organizerDashboard/EventDetails";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { queryKeys } from "@/lib/queryKeys";
import Head from "next/head";
import { Loader2 } from "lucide-react";

export default function EventDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const eventId = id as string;

  const [eventQuery, analyticsQuery] = useQueries({
    queries: [
      {
        queryKey: queryKeys.events.detail(eventId),
        queryFn: () => eventService.getEvent(eventId),
        enabled: router.isReady && !!eventId,
        staleTime: 0,
      },
      {
        queryKey: queryKeys.events.analytics(eventId),
        queryFn: () => eventService.getEventAnalytics(eventId),
        enabled: router.isReady && !!eventId,
        staleTime: 0,
      },
    ],
  });

  const isLoading = eventQuery.isLoading || analyticsQuery.isLoading;
  const isError = eventQuery.isError;
  const eventData = eventQuery.data;
  const analyticsData = analyticsQuery.data as EventAnalyticsResponse | undefined;

  if (!router.isReady || (isLoading && !eventData)) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !eventData) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-red-500">
          {isError ? "Error loading event details" : "Event not found"}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>{eventData.title} | Event Details</title>
      </Head>
      <DashboardLayout>
        <EventDetails event={eventData} analytics={analyticsData} />
      </DashboardLayout>
    </>
  );
}
