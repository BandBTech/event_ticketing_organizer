"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboardService";
import { queryKeys } from "@/lib/queryKeys";
import { OrganizerDashboardResponse } from "@/types/dashboard";

export function useOrganizerDashboard(eventId?: string) {
  const query = useQuery({
    queryKey: [...queryKeys.dashboard.all, eventId ?? 'all'],
    queryFn: () => dashboardService.getDashboard(eventId),
  });

  const response = query.data as OrganizerDashboardResponse | undefined;

  return {
    ...query,
    data: response,
    selectedEvent: response?.selected_event ?? null,
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
        upcoming: 0,
      },
      earnings: response?.earnings ?? [],
      totalTicketsSold: response?.tickets?.total_sold ?? 0,
      tickets: response?.tickets ?? { active: 0, cancelled: 0, refunded: 0, total_sold: 0, used: 0 },
      refunds: response?.refunds ?? { completed: 0, failed: 0, pending: 0, processing: 0 },
      transactions: response?.transactions ?? { completed: 0, failed: 0, pending: 0, processing: 0, refunded: 0, total: 0 },
    },
    upcomingEvents: response?.upcoming_events ?? [],
  };
}
