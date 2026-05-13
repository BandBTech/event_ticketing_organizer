export interface DashboardEarning {
  currency: string;
  gateway_fee: number;
  gross_revenue: number;
  net_revenue: number;
  paid_out: number;
  pending_payout: number;
  platform_commission: number;
  refund_amount: number;
  symbol: string;
}

export interface DashboardUpcomingEvent {
  id: string;
  title: string;
  banner_image: string;
  category: string;
  event_type?: string;
  country?: string;
  currency?: string;
  start_date: string;
  end_date: string;
  status: string;
  sales_status: string;
  is_featured: boolean;
  venue_name: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardEventsStats {
  approved: number;
  cancelled: number;
  completed: number;
  draft: number;
  live: number;
  on_sale: number;
  pending: number;
  rejected: number;
  total: number;
  upcoming: number;
}

export interface DashboardSelectedEvent {
  id: string;
  title: string;
  currency: string;
  symbol: string;
  country: string;
}

export interface OrganizerDashboardResponse {
  earnings: DashboardEarning[];
  events: DashboardEventsStats;
  refunds: { completed: number; failed: number; pending: number; processing: number };
  selected_event: DashboardSelectedEvent | null;
  tickets: { active: number; cancelled: number; refunded: number; total_sold: number; used: number };
  transactions: { completed: number; failed: number; pending: number; processing: number; refunded: number; total: number };
  upcoming_events: DashboardUpcomingEvent[];
}
