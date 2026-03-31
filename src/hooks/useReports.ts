"use client";

import { useQuery } from "@tanstack/react-query";
import { reportService } from "@/services/reportService";
import { queryKeys } from "@/lib/queryKeys";
import { ReportType, ReportData } from "@/types/report";

interface UseReportOptions {
  start_date?: string;
  end_date?: string;
  event_id?: string;
  limit?: number;
  enabled?: boolean;
}

export function useReport(type: ReportType, options: UseReportOptions = {}) {
  const { enabled = true, ...params } = options;

  return useQuery<ReportData>({
    queryKey: queryKeys.reports.byType(type, params),
    queryFn: () => reportService.getReport({ type, ...params }),
    enabled,
  });
}
