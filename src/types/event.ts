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
  currency?: string;
  event_type?: string;
  country?: string;
  start_date: string;
  end_date: string;
  timezone?: string;
  capacity: number;
  price: number;
  status: string;
  sales_status?: string;
  admin_remark?: string;
  tiers: EventTier[];
  organizer_id: string;
  created_at: string;
  updated_at: string;
  is_featured?: boolean;
  commission_rate?: number;
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
  category: string[];
  venue_name: string;
  address: string;
  currency?: string;
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
  category?: string[];
  venue_name?: string;
  address?: string;
  currency?: string;
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
// Event History Types
export interface EventStatusHistory {
  id: string;
  event_id: string;
  old_status: string;
  new_status: string;
  remark?: string;
  status_type: 'approval' | 'sales';
  changed_by: string;
  changed_by_name: string;
  created_at: string;
}

export interface EventMinimal {
  id: string;
  title: string;
  banner_image?: string;
  category: string; // API returns comma-separated string e.g. "Music,Concert"
  venue_name?: string;
  address: string;
  start_date: string;
  end_date: string;
  price: number;
  status: string;
  sales_status?: string;
  available?: number;
  capacity?: number;
  created_at?: string;
  is_featured?: boolean;
}

export interface EventListPagination {
  has_next: boolean;
  has_prev: boolean;
  limit: number;
  page: number;
  total: number;
  total_pages: number;
}

export interface EventListResponse {
  events: EventMinimal[];
  pagination: EventListPagination;
}

// Types for /organizer/list-all endpoint
export type ListAllType = 'events' | 'users';

export interface MinimalUserResponse {
  id: string;
  name: string;
  email: string;
}

export interface MinimalEventResponse {
  id: string;
  title: string;
}

export interface EventSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

// Ticket Types
export interface GuestUserResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface UserResponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  profile_image?: string;
  is_verified: boolean;
  status: string;
}

export interface Attendee {
  id: string;
  name: string;
  email: string;
  type: string;
}

export interface TicketTier {
  id: string;
  name: string;
}

export interface TicketResponse {
  id: string;
  event_id: string;
  ticket_number: string;
  tier: TicketTier;
  total_amount: number;
  payment_gateway: string;
  status: string; // 'active', 'cancelled', 'refunded'
  is_guest_purchase: boolean;
  attendee?: Attendee;
  check_in_time?: string;
  checked_in_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface EventTicketsListResponse {
  tickets: TicketResponse[];
  pagination: {
    has_next: boolean;
    has_prev: boolean;
    limit: number;
    page: number;
    total: number;
    total_pages: number;
  };
}
