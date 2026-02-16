export interface DashboardUpcomingEvent {
  id: string;
  title: string;
  banner_image: string;
  category: string;
  start_date: string;
  end_date: string;
  status: string;
  sales_status: string;
  is_featured: boolean;
  venue_name: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizerDashboardResponse {
  total_events_organized: number;
  total_revenue: number;
  total_tickets_sold: number;
  upcoming_events: number;
  upcoming_list: DashboardUpcomingEvent[];
}
