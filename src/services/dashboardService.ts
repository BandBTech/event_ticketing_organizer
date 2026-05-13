import { api } from '@/lib/apiClient';
import { OrganizerDashboardResponse } from '@/types/dashboard';

export const dashboardService = {
  getDashboard: async (eventId?: string) => {
    const endpoint = eventId
      ? `/organizer/dashboard?event_id=${eventId}`
      : '/organizer/dashboard';
    return api.get<OrganizerDashboardResponse>(endpoint, { requiresAuth: true });
  },
};
