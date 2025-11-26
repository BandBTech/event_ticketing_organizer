// Authentication Request Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface UpdateProfileRequest {
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// Authentication Response Types
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  organizer_id: string;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: string;
  action: string;
  resource: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface UserResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_email_verified: boolean;
  organization_id?: string;
  organization?: Organization;
  roles: Role[];
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  country_code?: string;
  is_email_verified: boolean;
  organization_id?: string;
  organization?: Organization;
  roles?: Role[];
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// API Response Wrapper
export interface AuthApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  request_id?: string;
  timestamp?: string;
}

export interface AuthApiError {
  success: false;
  message: string;
  error: {
    code: string;
    details?: string;
    fields?: Record<string, string[]>;
  };
  request_id?: string;
  timestamp?: string;
}

// Auth State Types
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  countryCode?: string;
  isEmailVerified: boolean;
  organization?: Organization;
  roles: Role[];
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
