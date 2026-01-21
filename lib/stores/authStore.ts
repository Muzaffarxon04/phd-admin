import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Applicant } from "@/types";
import { authApi } from "@/lib/api/client";
import { delay } from "@/lib/data";

interface AuthState {
  user: Applicant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (oneIdData: {
    passportSeries: string;
    passportNumber: string;
    pinfl: string;
    phone: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (data: Partial<Applicant>) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (oneIdData) => {
        set({ isLoading: true, error: null });
        try {
          // Mock login - API ready bo'lganda o'zgartirish kerak
          await delay(800);
          
          // Simulate API call
          // const response = await authApi.loginWithOneId(oneIdData);
          
          // Mock user data
          const mockUser: Applicant = {
            id: "1",
            oneId: oneIdData.pinfl,
            fullName: "Test User",
            address: "Toshkent shahri",
            passportSeries: oneIdData.passportSeries,
            passportNumber: oneIdData.passportNumber,
            pinfl: oneIdData.pinfl,
            phone: oneIdData.phone,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Mock token
          if (typeof window !== "undefined") {
            localStorage.setItem("auth_token", "mock_token_" + Date.now());
          }

          set({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            error: error.message || "Login failed",
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          // await authApi.logout();
          await delay(300);
          
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
          }

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      checkAuth: async () => {
        set({ isLoading: true });
        try {
          // const response = await authApi.getMe();
          await delay(300);
          
          const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
          
          if (!token) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
            return;
          }

          // Mock: if token exists, user is authenticated
          // In real app, verify token with backend
          const mockUser: Applicant = {
            id: "1",
            oneId: "12345678901234",
            fullName: "Test User",
            address: "Toshkent shahri",
            passportSeries: "AA",
            passportNumber: "1234567",
            pinfl: "12345678901234",
            phone: "+998901234567",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
          }
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
          await delay(500);
          
          const currentUser = get().user;
          if (!currentUser) throw new Error("User not authenticated");

          const updatedUser: Applicant = {
            ...currentUser,
            ...data,
            updatedAt: new Date().toISOString(),
          };

          set({
            user: updatedUser,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || "Update failed",
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
