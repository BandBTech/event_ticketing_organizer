

// AuthError class for error handling
export class AuthError extends Error {
  details?: string;
  status?: number;
  
  constructor(message: string, details?: string, status?: number) {
    super(message);
    this.name = 'AuthError';
    this.details = details;
    this.status = status;
  }
}

// Types for auth service
export interface RegisterData {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  country_code?: string;
}

export interface OTPData {
  identifier: string;
  otp_code: string;
  otp_type: "registration" | "password_reset";
}

export interface SendOTPData {
  identifier: string;
  otp_type: "registration" | "password_reset";
}

export interface SetPasswordData {
  email: string;
  password: string;
}

export interface ResetPasswordRequestData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  otp_code: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  data?: string;
  token?: string;
  user?: string;
}

// Auth Service with actual API calls and proper types
export const authService = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await fetch('https://sandbox.timroticket.com/api/v1/auth/organizer/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new AuthError(errorData.message || 'Registration failed', errorData.details, response.status);
    }

    return await response.json();
  },

  verifyOTP: async (data: OTPData): Promise<AuthResponse> => {
    const response = await fetch('https://sandbox.timroticket.com/api/v1/auth/organizer/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new AuthError(errorData.message || 'OTP verification failed', errorData.details, response.status);
    }

    return await response.json();
  },

  sendOTP: async (data: SendOTPData): Promise<AuthResponse> => {
    const response = await fetch('https://sandbox.timroticket.com/api/v1/auth/organizer/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new AuthError(errorData.message || 'Failed to send OTP', errorData.details, response.status);
    }

    return await response.json();
  },

  setPassword: async (data: SetPasswordData): Promise<AuthResponse> => {
    const response = await fetch('https://sandbox.timroticket.com/api/v1/auth/organizer/set-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new AuthError(errorData.message || 'Failed to set password', errorData.details, response.status);
    }

    return await response.json();
  },

  resetPasswordRequest: async (data: ResetPasswordRequestData): Promise<AuthResponse> => {
    const response = await fetch('https://sandbox.timroticket.com/api/v1/auth/organizer/reset-password-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new AuthError(errorData.message || 'Failed to request password reset', errorData.details, response.status);
    }

    return await response.json();
  },

  resetPassword: async (data: ResetPasswordData): Promise<AuthResponse> => {
    const response = await fetch('https://sandbox.timroticket.com/api/v1/auth/organizer/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new AuthError(errorData.message || 'Failed to reset password', errorData.details, response.status);
    }

    return await response.json();
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await fetch('https://sandbox.timroticket.com/api/v1/auth/organizer/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new AuthError(errorData.message || 'Login failed', errorData.details, response.status);
    }

    return await response.json();
  },
};