import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "-";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  } catch {
    return "-";
  }
}

// Format date time
export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Format phone number
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 12 && cleaned.startsWith("998")) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`;
  }
  return phone;
}

// Format currency
export function formatCurrency(amount: number, currency: string = "UZS"): string {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

// Validate PINFL (12 digits)
export function validatePINFL(pinfl: string): boolean {
  return /^\d{14}$/.test(pinfl);
}

// Validate passport
export function validatePassport(series: string, number: string): boolean {
  return /^[A-Z]{2}$/.test(series) && /^\d{7}$/.test(number);
}

// Validate phone (Uzbekistan)
export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return /^998\d{9}$/.test(cleaned);
}

// Get application status label
export function getApplicationStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: "Qoralama",
    SUBMITTED: "Topshirilgan",
    UNDER_REVIEW: "Ko'rib chiqilmoqda",
    APPROVED: "Qabul qilingan",
    REJECTED: "Rad etilgan",
    WITHDRAWN: "Bekor qilingan",
    // Legacy statuses
    draft: "Qoralama",
    submitted: "Topshirilgan",
    under_review: "Ko'rib chiqilmoqda",
    accepted: "Qabul qilingan",
    rejected: "Rad etilgan",
    revision_required: "Qayta ko'rib chiqish talab qilinadi",
  };
  return labels[status] || status;
}

// Get application status color
export function getApplicationStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: "gray",
    SUBMITTED: "blue",
    UNDER_REVIEW: "yellow",
    APPROVED: "green",
    REJECTED: "red",
    WITHDRAWN: "gray",
    // Legacy statuses
    draft: "gray",
    submitted: "blue",
    under_review: "yellow",
    accepted: "green",
    rejected: "red",
    revision_required: "orange",
  };
  return colors[status] || "gray";
}

// Token management utilities
export const tokenStorage = {
  getAccessToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  },
  
  getRefreshToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refresh_token");
  },
  
  setTokens: (access: string, refresh: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
  },
  
  removeTokens: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  },
  
  hasTokens: (): boolean => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("access_token") && !!localStorage.getItem("refresh_token");
  },
  
  getUser: (): unknown | null => {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },
  
  setUser: (user: unknown): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem("user", JSON.stringify(user));
  },
};
