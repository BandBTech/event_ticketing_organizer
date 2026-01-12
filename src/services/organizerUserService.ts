import { api } from '@/lib/apiClient';
import {
  OrgUser,
  CreateOrgUserRequest,
  UpdateOrgUserRequest,
  OrgUsersListResponse
} from '@/types/organizerUser';

// Helper to build query string
const buildQuery = (params: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.append(key, String(value));
    }
  });
  return query.toString();
};

export const organizerUserService = {
  /**
   * Get all users in the organization with pagination
   */
  getUsers: async (page = 1, limit = 10, search?: string, role?: string /* , sortBy?: string, sortOrder?: 'asc' | 'desc' */): Promise<OrgUsersListResponse> => {
    const query = buildQuery({ page, limit, search, role /* , sortBy, sortOrder */ });
    return api.get<OrgUsersListResponse>(`/organizer/users?${query}`, {
      requiresAuth: true
    });
  },

  /**
   * Create a new user in the organization
   */
  createUser: async (data: CreateOrgUserRequest): Promise<OrgUser> => {
    return api.post<OrgUser>(`/organizer/users`, data, {
      requiresAuth: true,
      showSuccessToast: false,  
    });
  },

  /**
   * Update a user's role or status in the organization
   */
  updateUser: async (userId: string, data: UpdateOrgUserRequest): Promise<OrgUser> => {
    return api.put<OrgUser>(`/organizer/users/${userId}`, data, {
      requiresAuth: true
    });
  },

  /**
   * Remove a user from the organization
   */
  deleteUser: async (userId: string): Promise<void> => {
    return api.delete<void>(`/organizer/users/${userId}`, {
      requiresAuth: true
    });
  },
};
