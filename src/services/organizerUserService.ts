import { api } from '@/lib/apiClient';
import {
  OrgUser,
  CreateOrgUserRequest,
  UpdateOrgUserRequest,
  UpdateUserRoleRequest
} from '@/types/organizerUser';

/**
 * Organization User Service
 * Handles CRUD operations for organization team members
 * 
 * API Endpoints:
 * - GET    /organizer/organizations/{id}/users          - List all users
 * - POST   /organizer/organizations/{id}/users          - Create user
 * - PUT    /organizer/organizations/{id}/users/{userId} - Update user
 * - DELETE /organizer/organizations/{id}/users/{userId} - Delete user
 * - PUT    /organizer/organizations/{orgId}/users/role  - Update user role
 */
export const organizerUserService = {
  /**
   * Get all users in an organization
   * @param orgId - Organization ID (same as organizer_id from organizer profile)
   */
  getUsers: async (orgId: string): Promise<OrgUser[]> => {
    return api.get<OrgUser[]>(`/organizer/organizations/${orgId}/users`, {
      requiresAuth: true
    });
  },

  /**
   * Create a new user in the organization
   * @param orgId - Organization ID
   * @param data - User data (email, first_name, last_name, password, role_name, phone?)
   */
  createUser: async (orgId: string, data: CreateOrgUserRequest): Promise<OrgUser> => {
    return api.post<OrgUser>(`/organizer/organizations/${orgId}/users`, data, {
      requiresAuth: true
    });
  },

  /**
   * Update a user's role or status in the organization
   * @param orgId - Organization ID
   * @param userId - User ID to update
   * @param data - Update data (role_type, active?)
   */
  updateUser: async (orgId: string, userId: string, data: UpdateOrgUserRequest): Promise<OrgUser> => {
    return api.put<OrgUser>(`/organizer/organizations/${orgId}/users/${userId}`, data, {
      requiresAuth: true
    });
  },

  /**
   * Remove a user from the organization
   * @param orgId - Organization ID
   * @param userId - User ID to delete
   */
  deleteUser: async (orgId: string, userId: string): Promise<void> => {
    return api.delete<void>(`/organizer/organizations/${orgId}/users/${userId}`, {
      requiresAuth: true
    });
  },

  /**
   * Update a user's role in the organization
   * Alternative endpoint for role updates
   * @param orgId - Organization ID
   * @param data - Role update data (user_id, role_name)
   */
  updateUserRole: async (orgId: string, data: UpdateUserRoleRequest): Promise<void> => {
    return api.put<void>(`/organizer/organizations/${orgId}/users/role`, data, {
      requiresAuth: true
    });
  },
};
