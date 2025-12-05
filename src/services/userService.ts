import { api } from "@/lib/apiClient";

export interface OrgUser {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    account_status: string;
    country_code?: string;
    organization_id?: string;
    roles?: { id: string; name: string }[];
    created_at?: string;
    updated_at?: string;
}

export interface CreateOrgUserRequest {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    role_name: "staff" | "manager";
    phone?: string;
}

export interface UpdateOrgUserRequest {
    role_name?: "staff" | "manager";
    account_status?: "active" | "inactive" | "suspended";
}

class UserService {
    /**
     * Get all users in the organization
     */
    async getOrgUsers(organizationId: string): Promise<OrgUser[]> {
        const response = await api.get<{ data: OrgUser[] }>(
            `/organizer/organizations/${organizationId}/users`
        );
        return response.data || [];
    }

    /**
     * Create a new user in the organization
     */
    async createOrgUser(
        organizationId: string,
        userData: CreateOrgUserRequest
    ): Promise<OrgUser> {
        const response = await api.post<{ data: OrgUser }>(
            `/organizer/organizations/${organizationId}/users`,
            userData
        );
        return response.data;
    }

    /**
     * Update a user in the organization
     */
    async updateOrgUser(
        organizationId: string,
        userId: string,
        userData: UpdateOrgUserRequest
    ): Promise<OrgUser> {
        const response = await api.put<{ data: OrgUser }>(
            `/organizer/organizations/${organizationId}/users/${userId}`,
            userData
        );
        return response.data;
    }

    /**
     * Delete a user from the organization
     */
    async deleteOrgUser(organizationId: string, userId: string): Promise<void> {
        await api.delete(`/organizer/organizations/${organizationId}/users/${userId}`);
    }
}

export const userService = new UserService();
