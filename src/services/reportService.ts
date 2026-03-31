import { api } from "@/lib/apiClient";
import { ReportParams, ReportData } from "@/types/report";

export const reportService = {
  getReport: async (params: ReportParams): Promise<ReportData> => {
    let endpoint = "/organizer/reports";
    const searchParams = new URLSearchParams();

    searchParams.append("type", params.type);
    if (params.start_date) searchParams.append("start_date", params.start_date);
    if (params.end_date) searchParams.append("end_date", params.end_date);
    if (params.event_id) searchParams.append("event_id", params.event_id);
    if (params.limit !== undefined)
      searchParams.append("limit", params.limit.toString());

    const queryString = searchParams.toString();
    if (queryString) {
      endpoint += `?${queryString}`;
    }

    return api.get<ReportData>(endpoint, { requiresAuth: true });
  },
};
