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
  summary_metrics?: {
    total_revenue?: number;
    total_earnings?: number;
    total_refunds?: number;
    net_revenue?: number;
    net_earnings?: number;
    total_tickets_sold?: number;
    active_events?: number;
    total_events?: number;
    total_transactions?: number;
    completed_transactions?: number;
    pending_payouts?: number;
    average_tickets_per_event?: number;
    conversion_rate?: number;
  };
  events_statistics?: {
    total_events?: number;
    draft_events?: number;
    pending_events?: number;
    approved_events?: number;
    rejected_events?: number;
    on_sale_events?: number;
    live_events?: number;
    completed_events?: number;
    cancelled_events?: number;
  };
  top_performing_events?: Array<{
    event_id: string;
    event_name: string;
    revenue: number;
    tickets_sold: number;
  }> | null;
  recent_transactions?: Array<Record<string, unknown>> | null;
  revenue_trend?: Array<{ date: string; revenue: number }> | null;
  ticket_sales_trend?: Array<{ date: string; tickets: number }> | null;
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
  summary_metrics?: {
    total_gross_revenue?: number;
    total_commission?: number;
    total_organizer_share?: number;
    total_refunds?: number;
    net_revenue?: number;
    pending_payouts?: number;
    completed_payouts?: number;
    average_ticket_price?: number;
    total_transactions?: number;
  };
  revenue_breakdown?: Array<{
    event_id: string;
    event_title: string;
    gross_revenue: number;
    commission: number;
    organizer_share: number;
    refunds: number;
    net_revenue: number;
    transaction_count: number;
  }> | null;
  commission_history?: Array<{
    transaction_id: string;
    event_id: string;
    event_title: string;
    revenue: number;
    commission_rate: number;
    commission_amount: number;
    created_at: string;
  }> | null;
  payout_history?: Array<{
    payout_id: string;
    amount: number;
    status: string;
    created_at: string;
  }> | null;
  currency_breakdown?: Array<{
    currency: string;
    gross_revenue: number;
    commission: number;
    organizer_share: number;
    transaction_count: number;
    percentage_of_total: number;
  }> | null;
  // Legacy fields for backward compatibility
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
