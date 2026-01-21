// API Client Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api-doktarant.tashmeduni.uz/api/v1";

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  // Add auth token if available
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        (errorData as any)?.message || response.statusText,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

// Upload file function
async function uploadFile(
  endpoint: string,
  formData: FormData
): Promise<unknown> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    method: "POST",
    headers: {},
  };

  // Add auth token if available
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  config.body = formData;

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        (errorData as any)?.message || response.statusText,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

// ==================== AUTH API ====================

export const authApi = {
  // Register - Send OTP
  register: async (data: { phone_number: string }) => {
    return request<unknown>("/auth/register/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Verify OTP
  verifyOTP: async (data: {
    phone_number: string;
    otp_code: string;
    purpose?: "REGISTRATION" | "LOGIN" | "PASSWORD_RESET" | "PHONE_VERIFICATION";
  }) => {
    return request<unknown>("/auth/register/verify/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Complete registration
  completeRegistration: async (data: {
    phone_number: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    email?: string;
    password: string;
  }) => {
    return request<{ access: string; refresh: string }>("/auth/register/complete/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Login
  login: async (data: { phone_number: string; password: string }) => {
    return request<{ access: string; refresh: string }>("/auth/login/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Get current user
  getMe: async () => {
    return request<unknown>("/auth/me/");
  },

  // Update current user
  updateMe: async (data: {
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    email?: string;
  }) => {
    return request<unknown>("/auth/me/", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  // Refresh token
  refreshToken: async (refreshToken: string) => {
    return request<{ access: string }>("/auth/token/refresh/", {
      method: "POST",
      body: JSON.stringify({ refresh: refreshToken }),
    });
  },

  // Resend OTP
  resendOTP: async (data: {
    phone_number: string;
    purpose?: "REGISTRATION" | "LOGIN" | "PASSWORD_RESET" | "PHONE_VERIFICATION";
  }) => {
    return request<unknown>("/auth/otp/resend/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// ==================== APPLICANT API ====================

export const applicantApi = {
  // Get available applications
  getApplications: async () => {
    return request<unknown[]>("/applicant/");
  },

  // Get application details
  getApplication: async (id: string) => {
    return request<unknown>(`/applicant/${id}/`);
  },

  // Check eligibility
  checkEligibility: async (id: string) => {
    return request<unknown>(`/applicant/${id}/check-eligibility/`);
  },

  // Get my submissions
  getMySubmissions: async () => {
    return request<unknown[]>("/applicant/my-submissions/");
  },

  // Get submission statistics
  getMySubmissionStatistics: async () => {
    return request<unknown>("/applicant/my-submissions/statistics/");
  },

  // Create submission
  createSubmission: async (data: {
    application_id: number;
    answers: Array<{
      field_id: number;
      answer_text?: string;
      answer_number?: string;
      answer_date?: string;
      answer_json?: unknown;
    }>;
  }) => {
    return request<unknown>("/applicant/my-submissions/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Get submission details
  getSubmission: async (id: string) => {
    return request<unknown>(`/applicant/my-submissions/${id}/`);
  },

  // Update submission
  updateSubmission: async (id: string, data: {
    answers: Array<{
      field_id: number;
      answer_text?: string;
      answer_number?: string;
      answer_date?: string;
      answer_json?: unknown;
    }>;
  }) => {
    return request<unknown>(`/applicant/my-submissions/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  // Delete submission
  deleteSubmission: async (id: string) => {
    return request(`/applicant/my-submissions/${id}/`, {
      method: "DELETE",
    });
  },

  // Submit (finalize) submission
  submitSubmission: async (id: string) => {
    return request(`/applicant/my-submissions/${id}/submit/`, {
      method: "POST",
    });
  },

  // Withdraw submission
  withdrawSubmission: async (id: string) => {
    return request(`/applicant/my-submissions/${id}/withdraw/`, {
      method: "POST",
    });
  },

  // Upload document
  uploadDocument: async (id: string, file: File, documentType: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", documentType);

    return uploadFile(`/applicant/my-submissions/${id}/upload-document/`, formData);
  },

  // Delete document
  deleteDocument: async (id: string) => {
    return request(`/applicant/my-submissions/${id}/delete-document/`, {
      method: "DELETE",
    });
  },

  // Get submission documents
  getSubmissionDocuments: async () => {
    return request<unknown[]>("/applicant/submission-documents/");
  },

  // Get document details
  getDocument: async (id: string) => {
    return request<unknown>(`/applicant/submission-documents/${id}/`);
  },
};

// ==================== ADMIN API ====================

export const adminApi = {
  // Get all applications
  getApplications: async () => {
    return request<unknown[]>("/admin/application/");
  },

  // Create application
  createApplication: async (data: {
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    max_submissions?: number;
    requires_oneid_verification?: boolean;
  }) => {
    return request<unknown>("/admin/application/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Get application details
  getApplication: async (id: string) => {
    return request<unknown>(`/admin/application/${id}/`);
  },

  // Update application
  updateApplication: async (id: string, data: Partial<unknown>) => {
    return request<unknown>(`/admin/application/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  // Delete application
  deleteApplication: async (id: string) => {
    return request(`/admin/application/${id}/`, {
      method: "DELETE",
    });
  },

  // Publish application
  publishApplication: async (id: string) => {
    return request(`/admin/application/${id}/publish/`, {
      method: "PUT",
    });
  },

  // Close application
  closeApplication: async (id: string) => {
    return request(`/admin/application/${id}/close/`, {
      method: "PUT",
    });
  },

  // Get application statistics
  getApplicationStatistics: async (id: string) => {
    return request<unknown>(`/admin/application/${id}/statistics/`);
  },

  // Get application submissions
  getApplicationSubmissions: async (id: string) => {
    return request<unknown[]>(`/admin/application/${id}/submissions/`);
  },

  // Add field to application
  addFieldToApplication: async (id: string) => {
    return request(`/admin/application/${id}/add-field/`, {
      method: "POST",
    });
  },

  // Get all submissions
  getSubmissions: async () => {
    return request<unknown[]>("/admin/application/submissions/");
  },

  // Get submission statistics
  getSubmissionsStatistics: async () => {
    return request<unknown>("/admin/application/submissions/statistics/");
  },

  // Get submission details
  getSubmission: async (id: string) => {
    return request<unknown>(`/admin/application/submissions/${id}/`);
  },

  // Review submission (approve/reject)
  reviewSubmission: async (id: string, data: {
    action: "approve" | "reject";
    notes?: string;
  }) => {
    return request(`/admin/application/submissions/${id}/review/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Get all documents
  getDocuments: async () => {
    return request<unknown[]>("/admin/application/documents/");
  },

  // Get document details
  getDocument: async (id: string) => {
    return request<unknown>(`/admin/application/documents/${id}/`);
  },

  // Verify document
  verifyDocument: async (id: string) => {
    return request(`/admin/application/documents/${id}/verify/`, {
      method: "POST",
    });
  },

  // Reject document
  rejectDocument: async (id: string) => {
    return request(`/admin/application/documents/${id}/reject/`, {
      method: "POST",
    });
  },

  // Get all fields
  getFields: async () => {
    return request<unknown[]>("/admin/application/fields/");
  },

  // Get field details
  getField: async (id: string) => {
    return request<unknown>(`/admin/application/fields/${id}/`);
  },

  // Create field
  createField: async (data: {
    application: number;
    label: string;
    field_type: string;
    help_text?: string;
    required?: boolean;
    order?: number;
  }) => {
    return request<unknown>("/admin/application/fields/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update field
  updateField: async (id: string, data: Partial<unknown>) => {
    return request<unknown>(`/admin/application/fields/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  // Delete field
  deleteField: async (id: string) => {
    return request(`/admin/application/fields/${id}/`, {
      method: "DELETE",
    });
  },
};

const apiClient = {
  auth: authApi,
  applicant: applicantApi,
  admin: adminApi,
};

export default apiClient;
