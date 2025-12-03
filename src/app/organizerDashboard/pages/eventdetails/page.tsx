"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import EventDetails from "@/app/organizerDashboard/components/eventDetails";
import { eventService } from "@/services/eventService";
import { Skeleton } from "@/components/ui/skeleton";

import { Suspense } from "react";

function EventDetailsContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") as string;

  const { data: event, isLoading, isError } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventService.getEvent(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <div className="flex gap-3">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-80 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !event) {
    return <div className="p-6 text-red-600">Event not found or failed to load!</div>;
  }

  return <EventDetails event={event} />;
}

export default function EventDetailsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EventDetailsContent />
    </Suspense>
  );
}