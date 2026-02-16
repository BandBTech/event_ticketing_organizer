"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboardService";
import { queryKeys } from "@/lib/queryKeys";
import { OrganizerDashboardResponse } from "@/types/dashboard";

/**
 * Custom hook for fetching organizer dashboard statistics
 */
export function useOrganizerDashboard() {
  const query = useQuery({
    queryKey: queryKeys.dashboard.all,
    queryFn: () => dashboardService.getDashboard(),
  });

  const response = query.data as OrganizerDashboardResponse | undefined;

  return {
    ...query,
    data: response,
    stats: {
      totalEvents: response?.total_events_organized ?? 0,
      totalRevenue: response?.total_revenue ?? 0,
      totalTicketsSold: response?.total_tickets_sold ?? 0,
      upcomingEventsCount: response?.upcoming_events ?? 0,
    },
    upcomingEvents: response?.upcoming_list ?? [],
  };
}
