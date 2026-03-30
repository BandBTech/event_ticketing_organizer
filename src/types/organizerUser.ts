/**
 * Organization User Types
 * Based on API documentation for /organizer/organizations/{id}/users endpoints
 */

// Role response from API
export interface RoleResponse {
  id: string;
  name: string;
  description?: string;
  is_system_role?: boolean;
}

// User response from API - matches models.UserResponse
export interface OrgUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  country_code?: string;
  organization_id: string;
  roles: RoleResponse[];
  organizer_status?: 'pending' | 'approved' | 'rejected' | 'inactive';
  account_status?: 'active' | 'inactive' | 'suspended';
  admin_remark?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  is_email_verified: boolean;
}

/**
 * Request to create a new user in organization
 * POST /api/v1/organizer/organizations/{id}/users
 * 
 * Required fields: email, first_name, last_name, password, role_name
 */
export interface CreateOrgUserRequest {
  email: string;
  first_name: string;  // min: 2, max: 50
  last_name: string;   // min: 2, max: 50
  password: string;
  phone?: string;
  role_name: 'staff' | 'manager';
}

/**
 * Request to update a user in organization
 * PUT /api/v1/organizer/organizations/{id}/users/{userId}
 * 
 * Required fields: role_type
 */
export interface UpdateOrgUserRequest {
  role_type: 'staff' | 'manager';
  active?: boolean;
}

/**
 * Request to update a user's role in organization
 * PUT /api/v1/organizer/organizations/{orgId}/users/role
 * 
 * Required fields: user_id, role_name
 */
export interface UpdateUserRoleRequest {
  user_id: string;
  role_name: 'staff' | 'manager';
}

export interface OrgUsersPagination {
  has_next: boolean;
  has_prev: boolean;
  limit: number;
  page: number;
  total: number;
  total_pages: number;
}

export interface OrgUsersListResponse {
  users: OrgUser[];
  pagination: OrgUsersPagination;
}

