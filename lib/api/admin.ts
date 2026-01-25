import { apiRequest } from "@/lib/hooks/useUniversalFetch";

// Types from Swagger
export interface ApplicationField {
  id: string;
  application_id: string;
  field_name: string;
  field_type: "text" | "textarea" | "select" | "checkbox" | "file";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation_rules?: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface ApplicationFieldCreate {
  field_name: string;
  field_type: "text" | "textarea" | "select" | "checkbox" | "file";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation_rules?: string;
  order: number;
}

export interface ApplicationDetail {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  deadline: string;
  is_active: boolean;
  specialization?: {
    id: string;
    code: string;
    name: string;
  };
  fields?: ApplicationField[];
  created_at: string;
  updated_at: string;
}

export interface ApplicationCreate {
  title: string;
  description: string;
  requirements: string[];
  deadline: string;
  is_active?: boolean;
  specialization_id?: string;
}

export interface ApplicationUpdate {
  title?: string;
  description?: string;
  requirements?: string[];
  deadline?: string;
  is_active?: boolean;
  specialization_id?: string;
}

export interface ApplicationListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApplicationDetail[];
}

export interface ReviewSubmission {
  id: string;
  application_id: string;
  applicant: {
    id: string;
    full_name: string;
    phone: string;
    pinfl: string;
  };
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected";
  submitted_at?: string;
  created_at: string;
  updated_at: string;
  answers?: {
    question: string;
    answer: string;
  }[];
  documents?: {
    document_type: string;
    file_name: string;
    file_url: string;
  }[];
}

export interface ApplicationSubmissionListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ReviewSubmission[];
}

export interface RejectRequest {
  reason: string;
}

export interface RejectResponse {
  message: string;
  submission: ReviewSubmission;
}

export interface ApproveResponse {
  message: string;
  submission: ReviewSubmission;
}

// Admin API Service
export const adminApi = {
  /**
   * GET /admin/application/
   * Get list of all applications
   */
  getApplications: async (
    page = 1,
    pageSize = 20
  ): Promise<ApplicationListResponse> => {
    return apiRequest<ApplicationListResponse>(
      `/admin/application/?page=${page}&page_size=${pageSize}`,
      {
        method: "GET",
      }
    );
  },

  /**
   * GET /admin/application/{id}/
   * Get application details by ID
   */
  getApplication: async (id: string): Promise<ApplicationDetail> => {
    return apiRequest<ApplicationDetail>(
      `/admin/application/${id}/`,
      {
        method: "GET",
      }
    );
  },

  /**
   * POST /admin/application/create/
   * Create a new application
   */
  createApplication: async (data: ApplicationCreate): Promise<ApplicationDetail> => {
    return apiRequest<ApplicationDetail>(
      "/admin/application/create/",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * PUT /admin/application/{id}/update/
   * Update an application
   */
  updateApplication: async (
    id: string,
    data: ApplicationUpdate
  ): Promise<ApplicationDetail> => {
    return apiRequest<ApplicationDetail>(
      `/admin/application/${id}/update/`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * DELETE /admin/application/{id}/delete/
   * Delete an application
   */
  deleteApplication: async (id: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(
      `/admin/application/${id}/delete/`,
      {
        method: "DELETE",
      }
    );
  },

  /**
   * POST /admin/application/{application_id}/fields/create/
   * Create a new field for an application
   */
  createApplicationField: async (
    applicationId: string,
    data: ApplicationFieldCreate
  ): Promise<ApplicationField> => {
    return apiRequest<ApplicationField>(
      `/admin/application/${applicationId}/fields/create/`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * PUT /admin/application/{application_id}/fields/{field_id}/update/
   * Update an application field
   */
  updateApplicationField: async (
    applicationId: string,
    fieldId: string,
    data: Partial<ApplicationFieldCreate>
  ): Promise<ApplicationField> => {
    return apiRequest<ApplicationField>(
      `/admin/application/${applicationId}/fields/${fieldId}/update/`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * DELETE /admin/application/{application_id}/fields/{field_id}/delete/
   * Delete an application field
   */
  deleteApplicationField: async (
    applicationId: string,
    fieldId: string
  ): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(
      `/admin/application/${applicationId}/fields/${fieldId}/delete/`,
      {
        method: "DELETE",
      }
    );
  },

  /**
   * GET /admin/application/submissions/
   * Get list of all submissions
   */
  getSubmissions: async (
    page = 1,
    pageSize = 20,
    status?: string
  ): Promise<ApplicationSubmissionListResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    if (status) params.append("status", status);

    return apiRequest<ApplicationSubmissionListResponse>(
      `/admin/application/submissions/?${params.toString()}`,
      {
        method: "GET",
      }
    );
  },

  /**
   * GET /admin/application/submissions/{id}/
   * Get submission details by ID
   */
  getSubmission: async (id: string): Promise<ReviewSubmission> => {
    return apiRequest<ReviewSubmission>(
      `/admin/application/submissions/${id}/`,
      {
        method: "GET",
      }
    );
  },

  /**
   * POST /admin/application/submissions/{id}/approve/
   * Approve a submission
   */
  approveSubmission: async (id: string): Promise<ApproveResponse> => {
    return apiRequest<ApproveResponse>(
      `/admin/application/submissions/${id}/approve/`,
      {
        method: "POST",
      }
    );
  },

  /**
   * POST /admin/application/submissions/{id}/reject/
   * Reject a submission
   */
  rejectSubmission: async (
    id: string,
    data: RejectRequest
  ): Promise<RejectResponse> => {
    return apiRequest<RejectResponse>(
      `/admin/application/submissions/${id}/reject/`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },
};
