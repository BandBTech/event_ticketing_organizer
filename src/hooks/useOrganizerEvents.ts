"use client";

import { useQuery } from "@tanstack/react-query";
import { eventService } from "@/services/eventService";
import { EventSearchParams, EventListResponse } from "@/types/event";
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

  return {
    ...query,
    events: response?.events ?? [],
    totalPages: response?.total_pages ?? 0,
    currentPage: response?.page ?? page,
    total: response?.total ?? 0,
    hasNext: response?.has_next ?? false,
    hasPrevious: response?.has_previous ?? false,
  };
}
