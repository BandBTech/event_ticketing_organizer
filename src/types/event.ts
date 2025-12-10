export interface EventTier {
  id: string;
  tier_name: string;
  tier_template_id?: string;
  price: number;
  quantity: number;
  gst?: number;
  sales_start?: string;
  sales_end?: string;
  currency?: string;
  sort_order?: number;
  available?: number;
  sold?: number;
  is_active?: boolean;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  banner_image?: string;
  category: string[];
  venue_name: string;
  address: string;
  start_date: string;
  end_date: string;
  timezone?: string;
  capacity: number;
  price: number;
  status: string;
  tiers: EventTier[];
  organizer_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEventTierRequest {
  tier_template_id: string;
  price: number;
  quantity: number;
  currency?: string;
  gst?: number;
  sales_start?: string;
  sales_end?: string;
  sort_order?: number;
}

export interface CreateEventData {
  title: string;
  description?: string;
  banner_image?: File;
  category: string; // comma-separated
  venue_name: string;
  address: string;
  start_date: string;
  end_date: string;
  timezone?: string;
  capacity: number;
  price: number;
  tiers: string; // JSON string of CreateEventTierRequest[]
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  banner_image?: string | File;
  category?: string;
  venue_name?: string;
  address?: string;
  start_date?: string;
  end_date?: string;
  timezone?: string;
  capacity?: number;
  price?: number;
  tiers?: CreateEventTierRequest[];
  status?: string;
}

export interface TierTemplate {
  id: string;
  template_name: string;
  description?: string;
  is_active: boolean;
  organizer_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTierTemplateRequest {
  template_name: string;
  description?: string;
}

// Event Analytics Types
export interface EventTierAnalytics {
  tier_id: string;
  tier_name: string;
  price: number;
  currency?: string;
  total_seats: number;
  sold_seats: number;
  available_seats: number;
  revenue: number;
  sales_start?: string;
  sales_end?: string;
  is_active: boolean;
}

export interface EventAnalyticsResponse {
  event_id: string;
  event_title: string;
  event_status: string;
  sales_status: string;
  total_seats: number;
  sold_seats: number;
  available_seats: number;
  total_revenue: number;
  tier_count: number;
  tiers: EventTierAnalytics[];
  created_at: string;
}

// Event Sales Control Types
export type SalesAction = 'pause' | 'resume' | 'stop';

export interface EventSalesControlRequest {
  action: SalesAction;
  reason?: string;
}

// Event Cancellation Types
export interface EventCancellationRequest {
  reason: string;
}
