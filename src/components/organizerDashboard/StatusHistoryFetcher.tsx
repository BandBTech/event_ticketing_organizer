"use client";

import { useQuery } from "@tanstack/react-query";
import { eventService } from "@/services/eventService";
import { queryKeys } from "@/lib/queryKeys";
import StatusHistorySidebar from "./StatusHistorySidebar";

interface StatusHistoryFetcherProps {
  eventId: string;
}

export default function StatusHistoryFetcher({
  eventId,
}: StatusHistoryFetcherProps) {
  const {
    data: history,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: queryKeys.events.statusHistory(eventId),
    queryFn: () => eventService.getStatusHistory(eventId),
  });

  return (
    <StatusHistorySidebar
      history={history || []}
      isLoading={isLoading}
      onRefresh={() => refetch()}
    />
  );
}
