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
  summary_metrics?: {
    total_revenue?: number;
    total_commission?: number;
    organizer_share?: number;
    total_tickets_sold?: number;
    active_events?: number;
    total_events?: number;
    total_transactions?: number;
    completed_transactions?: number;
    pending_transactions?: number;
    failed_transactions?: number;
    average_order_value?: number;
    conversion_rate?: number;
  };
  daily_sales?: Array<{
    date: string;
    revenue: number;
    tickets_sold: number;
    transactions: number;
    average_order_value: number;
  }> | null;
  top_product_events?: Array<{
    event_id: string;
    event_name: string;
    revenue: number;
    tickets_sold: number;
  }> | null;
  sales_by_payment_gateway?: Array<{
    gateway_name: string;
    total_transactions: number;
    total_revenue: number;
    percentage_of_total: number;
    status: string;
  }>;
}

export interface CustomerAnalyticsData {
  total_customers?: number;
  registered_users?: number;
  guest_purchases?: number;
  repeat_customers?: number;
  average_order_value?: number;
  customer_segments?: Array<{
    segment_name: string;
    customer_count: number;
    total_spent: number;
    average_spent: number;
    percentage_of_total: number;
  }>;
  top_customers?: Array<{
    customer_id: string;
    customer_name: string;
    email: string;
    total_orders: number;
    total_spent: number;
  }> | null;
  customer_retention?: {
    new_customers: number;
    returning_customers: number;
    retention_rate: number;
    churn_rate: number;
  };
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
    event_id?: string;
    event_title: string;
    gross_revenue: number;
    commission: number;
    organizer_share: number;
    refunds: number;
    net_revenue: number;
    transaction_count?: number;
  }> | null;
  commission_history?: Array<{
    id: string;
    event_id: string;
    event_title: string;
    revenue: number;
    commission_rate: number;
    commission_amount: number;
    created_at: string;
  }> | null;
  bill_history?: Array<{
    id: string;
    bill_number: string;
    amount: number;
    status: string;
    processed_at: string;
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
}

export interface EventPerformanceData {
  event_id?: string;
  event_title?: string;
  banner_image?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  capacity?: number;
  tickets_sold?: number;
  sold_percentage?: number;
  revenue?: number;
  commission?: number;
  organizer_earnings?: number;
  average_ticket_price?: number;
  total_transactions?: number;
  top_tier?: {
    tier_id: string;
    tier_name: string;
    ticket_price: number;
    ticket_capacity: number;
    tickets_sold: number;
    sold_percentage: number;
    revenue: number;
  };
  tier_performance?: Array<{
    tier_id: string;
    tier_name: string;
    ticket_price: number;
    ticket_capacity: number;
    tickets_sold: number;
    sold_percentage: number;
    revenue: number;
  }> | null;
  revenue_by_tier?: Array<{
    tier_id: string;
    tier_name: string;
    revenue: number;
  }> | null;
}
