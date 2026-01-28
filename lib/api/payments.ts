import { apiRequest } from "@/lib/hooks/useUniversalFetch";

// Payment Types
export interface PaymePaymentInitiate {
  amount: string; // Amount in UZS as decimal string
}

export interface PaymePaymentResponse {
  payment_url?: string;
  transaction_id?: string;
  message?: string;
}

export interface PaymentStatus {
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  transaction_id?: string;
  paid_at?: string;
  amount?: string;
  error_message?: string;
}

// Payment API Service
export const paymentsApi = {
  /**
   * POST /payments/submission/{id}/payme/initiate/
   * Initiate Payme payment for submission
   */
  initiatePaymePayment: async (submissionId: string, data: PaymePaymentInitiate): Promise<PaymePaymentResponse> => {
    return apiRequest<PaymePaymentResponse>(`/payments/submission/${submissionId}/payme/initiate/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * GET /payments/submission/{id}/payme/status/
   * Get Payme payment status for submission
   */
  getPaymePaymentStatus: async (submissionId: string): Promise<PaymentStatus> => {
    return apiRequest<PaymentStatus>(`/payments/submission/${submissionId}/payme/status/`, {
      method: "GET",
    });
  },
};