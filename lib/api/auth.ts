import { apiRequest } from "@/lib/hooks/useUniversalFetch";

// Auth Types from Swagger
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user?: {
    id: string;
    email: string;
    full_name: string;
    phone?: string;
    role: string;
    pinfl?: string;
    address?: string;
    passport_series?: string;
    passport_number?: string;
    created_at?: string;
    updated_at?: string;
  };
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  passport_series?: string;
  passport_number?: string;
  pinfl?: string;
  address?: string;
  role: "applicant" | "admin" | "SUPER_ADMIN";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserUpdate {
  email?: string;
  full_name?: string;
  phone?: string;
  address?: string;
  passport_series?: string;
  passport_number?: string;
  pinfl?: string;
}

export interface RegisterRequest {
  phone: string;
  full_name: string;
}

export interface VerifyOTPRequest {
  phone: string;
  otp: string;
}

export interface VerifyOTPResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface CompleteRegistrationRequest {
  pinfl: string;
  passport_series: string;
  passport_number: string;
  address: string;
  email?: string;
}

export interface ResendOTPRequest {
  phone_number: string;
}

export interface ResendOTPResponse {
  message: string;
  data?: {
    expires_in_minutes: string;
  };
}

export interface RegisterResponse {
  message: string;
  data?: {
    expires_in_minutes: string;
  };
}

export interface PasswordResetRequest {
  phone: string;
}

export interface PasswordResetVerifyRequest {
  phone: string;
  otp: string;
}

export interface PasswordResetConfirmRequest {
  phone: string;
  otp: string;
  new_password: string;
  confirm_password: string;
}

export interface TokenRefreshRequest {
  refresh: string;
}

export interface TokenRefreshResponse {
  access: string;
  refresh?: string;
}

export interface PhoneNumberUpdateRequest {
  phone_number: string;
}

export interface PhoneNumberVerifyRequest {
  otp: string;
}

// Auth API Service
export const authApi = {
  /**
   * POST /auth/login/
   * User login with username and password
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>("/auth/login/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * GET /auth/me/
   * Get current user profile
   */
  getMe: async (): Promise<User> => {
    return apiRequest<User>("/auth/me/", {
      method: "GET",
    });
  },

  /**
   * PUT /auth/me/
   * Update user profile
   */
  updateMe: async (data: UserUpdate): Promise<User> => {
    return apiRequest<User>("/auth/me/", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * PATCH /auth/me/
   * Partially update user profile
   */
  patchMe: async (data: Partial<UserUpdate>): Promise<User> => {
    return apiRequest<User>("/auth/me/", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * POST /auth/otp/resend/
   * Resend OTP code
   */
  resendOTP: async (data: ResendOTPRequest): Promise<ResendOTPResponse> => {
    return apiRequest<ResendOTPResponse>("/auth/otp/resend/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * POST /auth/password/reset/
   * Request password reset
   */
  requestPasswordReset: async (data: PasswordResetRequest): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>("/auth/password/reset/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * POST /auth/password/reset/confirm/
   * Confirm password reset
   */
  confirmPasswordReset: async (data: PasswordResetConfirmRequest): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>("/auth/password/reset/confirm/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * POST /auth/password/reset/verify/
   * Verify password reset OTP
   */
  verifyPasswordResetOTP: async (data: PasswordResetVerifyRequest): Promise<{ valid: boolean }> => {
    return apiRequest<{ valid: boolean }>("/auth/password/reset/verify/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * POST /auth/register/
   * Register with phone number
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    return apiRequest<RegisterResponse>("/auth/register/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * POST /auth/register/complete/
   * Complete registration with additional details
   */
  completeRegistration: async (data: CompleteRegistrationRequest): Promise<User> => {
    return apiRequest<User>("/auth/register/complete/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * POST /auth/register/verify/
   * Verify OTP during registration
   */
  verifyRegistrationOTP: async (data: VerifyOTPRequest): Promise<VerifyOTPResponse> => {
    return apiRequest<VerifyOTPResponse>("/auth/register/verify/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * POST /auth/token/refresh/
   * Refresh access token
   */
  refreshToken: async (data: TokenRefreshRequest): Promise<TokenRefreshResponse> => {
    return apiRequest<TokenRefreshResponse>("/auth/token/refresh/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * POST /auth/me/phone/request/
   * Request phone number change
   */
  requestPhoneChange: async (data: PhoneNumberUpdateRequest): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>("/auth/me/phone/request/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * POST /auth/me/phone/verify/
   * Verify phone number change with OTP
   */
  verifyPhoneChange: async (data: PhoneNumberVerifyRequest): Promise<User> => {
    return apiRequest<User>("/auth/me/phone/verify/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
