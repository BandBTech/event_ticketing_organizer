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
      events: response?.events ?? {
        approved: 0,
        cancelled: 0,
        completed: 0,
        draft: 0,
        live: 0,
        on_sale: 0,
        pending: 0,
        rejected: 0,
        total: 0,
      },
      organizerEarnings: response?.organizer_earnings ?? 0,
      totalAmountReceived: response?.total_amount_received ?? 0,
      totalPendingAmount: response?.total_pending_amount ?? 0,
      totalRevenue: response?.total_revenue ?? 0,
      totalTicketsSold: response?.total_tickets_sold ?? 0,
      upcomingEventsCount: response?.upcoming_list?.length ?? (typeof response?.upcoming_events === 'number' ? response.upcoming_events : 0),
    },
    upcomingEvents: response?.upcoming_list ?? [],
  };
}
