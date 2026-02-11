import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Applicant } from "@/types";
import { authApi, type User } from "@/lib/api";
import { tokenStorage } from "@/lib/utils";

interface AuthState {
  user: Applicant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: {
    username: string;
    password: string;
  }) => Promise<void>;
  register: (data: {
    phone: string;
    full_name: string;
  }) => Promise<void>;
  verifyOTP: (data: {
    phone: string;
    otp: string;
  }) => Promise<void>;
  completeRegistration: (data: {
    pinfl: string;
    passport_series: string;
    passport_number: string;
    address: string;
    email?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  requestPasswordReset: (data: {
    phone: string;
  }) => Promise<void>;
  verifyPasswordResetOTP: (data: {
    phone: string;
    otp: string;
  }) => Promise<void>;
  confirmPasswordReset: (data: {
    phone: string;
    otp: string;
    new_password: string;
    confirm_password: string;
  }) => Promise<void>;
  resendOTP: (data: {
    phone: string;
  }) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(credentials);
          
          // Store tokens
          tokenStorage.setTokens(response.access, response.refresh);
          
          // Convert API user to Applicant type
          const user: Applicant = {
            id: response.user?.id || "",
            oneId: response.user?.pinfl || "",
            fullName: response.user?.full_name || "",
            address: response.user?.address || "",
            passportSeries: response.user?.passport_series || "",
            passportNumber: response.user?.passport_number || "",
            pinfl: response.user?.pinfl || "",
            phone: response.user?.phone || "",
            email: response.user?.email,
            createdAt: response.user?.created_at || new Date().toISOString(),
            updatedAt: response.user?.updated_at || new Date().toISOString(),
          };

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          set({
            error: error instanceof Error ? error.message : "Login failed",
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.register(data);
          set({ isLoading: false });
        } catch (error: unknown) {
          set({
            error: error instanceof Error ? error.message : "Registration failed",
            isLoading: false,
          });
          throw error;
        }
      },

      verifyOTP: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.verifyRegistrationOTP(data);
          
          // Store tokens
          tokenStorage.setTokens(response.access, response.refresh);
          
          // Convert API user to Applicant type
          const user: Applicant = {
            id: response.user.id,
            oneId: response.user.pinfl || "",
            fullName: response.user.full_name || "",
            address: response.user.address || "",
            passportSeries: response.user.passport_series || "",
            passportNumber: response.user.passport_number || "",
            pinfl: response.user.pinfl || "",
            phone: response.user.phone || "",
            email: response.user.email,
            createdAt: response.user.created_at,
            updatedAt: response.user.updated_at,
          };

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          set({
            error: error instanceof Error ? error.message : "OTP verification failed",
            isLoading: false,
          });
          throw error;
        }
      },

      completeRegistration: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const user = await authApi.completeRegistration(data);
          
          // Update current user with completed registration data
          const currentUser = get().user;
          if (currentUser) {
            const updatedUser: Applicant = {
              ...currentUser,
              oneId: user.pinfl || "",
              fullName: user.full_name || currentUser.fullName,
              address: user.address || "",
              passportSeries: user.passport_series || "",
              passportNumber: user.passport_number || "",
              pinfl: user.pinfl || "",
              phone: user.phone || currentUser.phone,
              email: user.email,
              updatedAt: user.updated_at,
            };

            set({
              user: updatedUser,
              isLoading: false,
            });
          }
        } catch (error: unknown) {
          set({
            error: error instanceof Error ? error.message : "Registration completion failed",
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          // Clear tokens
          tokenStorage.removeTokens();

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          set({ error: error instanceof Error ? error.message : "Logout failed", isLoading: false });
        }
      },

      checkAuth: async () => {
        set({ isLoading: true });
        try {
          // Check if tokens exist
          if (!tokenStorage.hasTokens()) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
            return;
          }

          // Fetch current user from API
          const user = await authApi.getMe();
          
          // Convert API user to Applicant type
          const applicant: Applicant = {
            id: user.id,
            oneId: user.pinfl || "",
            fullName: user.full_name || "",
            address: user.address || "",
            passportSeries: user.passport_series || "",
            passportNumber: user.passport_number || "",
            pinfl: user.pinfl || "",
            phone: user.phone || "",
            email: user.email,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
          };

          set({
            user: applicant,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          // Clear tokens on error
          tokenStorage.removeTokens();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const updatedUser = await authApi.patchMe(data);
          
          // Convert API user to Applicant type
          const applicant: Applicant = {
            id: updatedUser.id,
            oneId: updatedUser.pinfl || "",
            fullName: updatedUser.full_name || "",
            address: updatedUser.address || "",
            passportSeries: updatedUser.passport_series || "",
            passportNumber: updatedUser.passport_number || "",
            pinfl: updatedUser.pinfl || "",
            phone: updatedUser.phone || "",
            email: updatedUser.email,
            createdAt: updatedUser.created_at,
            updatedAt: updatedUser.updated_at,
          };

          set({
            user: applicant,
            isLoading: false,
          });
        } catch (error: unknown) {
          set({
            error: error instanceof Error ? error.message : "Update failed",
            isLoading: false,
          });
          throw error;
        }
      },

      requestPasswordReset: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.requestPasswordReset(data);
          set({ isLoading: false });
        } catch (error: unknown) {
          set({
            error: error instanceof Error ? error.message : "Password reset request failed",
            isLoading: false,
          });
          throw error;
        }
      },

      verifyPasswordResetOTP: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.verifyPasswordResetOTP(data);
          if (!response.valid) {
            throw new Error("OTP code is invalid");
          }
          set({ isLoading: false });
        } catch (error: unknown) {
          set({
            error: error instanceof Error ? error.message : "OTP verification failed",
            isLoading: false,
          });
          throw error;
        }
      },

      confirmPasswordReset: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.confirmPasswordReset(data);
          set({ isLoading: false });
        } catch (error: unknown) {
          set({
            error: error instanceof Error ? error.message : "Password reset confirmation failed",
            isLoading: false,
          });
          throw error;
        }
      },

      resendOTP: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.resendOTP({ phone_number: data.phone });
          set({ isLoading: false });
        } catch (error: unknown) {
          set({
            error: error instanceof Error ? error.message : "Failed to resend OTP",
            isLoading: false,
          });
          throw error;
        }
      },

      setError: (error) => set({ error }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
