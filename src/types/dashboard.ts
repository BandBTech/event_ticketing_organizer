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
  // draft: number;
  live: number;
  on_sale: number;
  pending: number;
  rejected: number;
  total: number;
}

export interface OrganizerDashboardResponse {
  events: DashboardEventsStats;
  organizer_earnings: number;
  total_amount_received: number;
  total_commission_amount: number;
  total_pending_amount: number;
  total_revenue: number;
  total_tickets_sold: number;
  upcoming_events: number | DashboardUpcomingEvent;
  upcoming_list: DashboardUpcomingEvent[];
}
