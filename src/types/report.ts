export type ReportType =
  | "overview"
  | "sales"
  | "customer-analytics"
  | "financial"
  | "event-performance";

export interface ReportParams {
  type: ReportType;
  start_date?: string;
  end_date?: string;
  event_id?: string;
  limit?: number;
}

export type ReportData = Record<string, unknown>;

export interface OverviewReportData {
  total_revenue: number;
  total_events: number;
  tickets_sold: number;
  total_attendees: number;
  revenue_change_pct?: number;
  events_change_pct?: number;
  tickets_change_pct?: number;
  attendees_change_pct?: number;
  revenue_trend?: Array<{ date: string; revenue: number }>;
}

export interface SalesReportData {
  sales_by_event?: Array<{
    event_name: string;
    total_sales: number;
    tickets_sold: number;
  }>;
  sales_over_time?: Array<{ date: string; sales: number }>;
  top_selling_events?: Array<{
    event_id: string;
    event_name: string;
    tickets_sold: number;
    revenue: number;
  }>;
  total_sales?: number;
  total_tickets?: number;
}

export interface CustomerAnalyticsData {
  demographics?: Array<{ label: string; count: number }>;
  repeat_customers?: number;
  new_customers?: number;
  total_customers?: number;
  customer_growth?: Array<{ date: string; customers: number }>;
}

export interface FinancialReportData {
  total_revenue?: number;
  total_expenses?: number;
  net_income?: number;
  commission_total?: number;
  revenue_vs_expenses?: Array<{
    date: string;
    revenue: number;
    expenses: number;
  }>;
  commission_breakdown?: Array<{ label: string; amount: number }>;
}

export interface EventPerformanceData {
  event_title?: string;
  total_tickets?: number;
  tickets_sold?: number;
  tickets_remaining?: number;
  attendance_rate?: number;
  revenue?: number;
  ticket_sales_over_time?: Array<{ date: string; sold: number }>;
  tier_breakdown?: Array<{
    tier_name: string;
    sold: number;
    total: number;
  }>;
}
