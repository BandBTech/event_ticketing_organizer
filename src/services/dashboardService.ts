import { api } from '@/lib/apiClient';
import { OrganizerDashboardResponse } from '@/types/dashboard';

export const dashboardService = {
  getDashboard: async () => {
    return api.get<OrganizerDashboardResponse>('/organizer/dashboard', { requiresAuth: true });
  },
};
