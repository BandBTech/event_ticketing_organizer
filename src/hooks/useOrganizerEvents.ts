"use client";

import { useQuery } from "@tanstack/react-query";
import { eventService } from "@/services/eventService";
import {
  EventSearchParams,
  EventListResponse,
  MinimalEventResponse,
} from "@/types/event";
import { queryKeys } from "@/lib/queryKeys";

interface UseOrganizerEventsOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

/**
 * Custom hook for fetching organizer events with server-side pagination and filtering
 */
export function useOrganizerEvents(options: UseOrganizerEventsOptions = {}) {
  const { page = 1, limit = 9, search, status } = options;

  // Build params, only include non-empty values
  const params: EventSearchParams = {
    page,
    limit,
    ...(search && search.trim() !== "" && { search: search.trim() }),
    ...(status && status !== "all" && { status }),
  };

  const query = useQuery({
    queryKey: queryKeys.events.list(params),
    queryFn: () => eventService.getEvents(params),
  });

  // Extract data with proper typing
  const response = query.data as EventListResponse | undefined;
  const pagination = response?.pagination;

  return {
    ...query,
    events: response?.events ?? [],
    totalPages: pagination?.total_pages ?? 0,
    currentPage: pagination?.page ?? page,
    total: pagination?.total ?? 0,
    hasNext: pagination?.has_next ?? false,
    hasPrevious: pagination?.has_prev ?? false,
  };
}

/**
 * Hook that fetches a flat, unpaginated list of all organizer events.
 * Ideal for dropdowns and select fields.
 */
export function useEventListAll() {
  const query = useQuery({
    queryKey: [...queryKeys.events.all, "listAll"] as const,
    queryFn: async () => {
      const data = await eventService.listAll("events");
      return data as MinimalEventResponse[];
    },
  });

  return {
    ...query,
    events: (query.data as MinimalEventResponse[] | undefined) ?? [],
  };
}

/**
 * Hook for fetching comprehensive analytics for a single event.
 * Only fetches when a valid eventId is provided.
 */
export function useEventAnalytics(eventId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.events.analytics(eventId ?? ""),
    queryFn: () => eventService.getEventAnalytics(eventId!),
    enabled: !!eventId,
  });
}
