import { apiRequest, apiUpload } from "@/lib/hooks/useUniversalFetch";

// Types from Swagger
export interface AvailableApplication {
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
  created_at: string;
  updated_at: string;
}

export interface ApplicationAnswer {
  id: string;
  application_id: string;
  question_id: string;
  answer: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicationDocument {
  id: string;
  submission_id: string;
  document_type: string;
  file: string;
  file_name: string;
  file_size: number;
  uploaded_at: string;
}

export interface MySubmission {
  id: string;
  application_id: string;
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected";
  submitted_at?: string;
  created_at: string;
  updated_at: string;
  answers?: ApplicationAnswer[];
  documents?: ApplicationDocument[];
  application?: {
    id: string;
    title: string;
  };
}

export interface ApplicationSubmissionDetail extends MySubmission {
  // Additional fields for detailed view
  review_comments?: string;
  rejection_reason?: string;
  approved_at?: string;
  rejected_at?: string;
}

export interface ApplicationSubmissionCreate {
  application_id: string;
}

export interface ApplicationAnswerCreate {
  question_id: string;
  answer: string;
}

export interface ApplicationSubmissionUpdate {
  answers?: ApplicationAnswerCreate[];
  // Other updatable fields
}

// Applicant API Service
export const applicantApi = {
  /**
   * GET /applicant/applications/
   * Get list of available applications
   */
  getApplications: async (): Promise<AvailableApplication[]> => {
    return apiRequest<AvailableApplication[]>("/applicant/applications/", {
      method: "GET",
    });
  },

  /**
   * GET /applicant/applications/{id}/
   * Get application details by ID
   */
  getApplication: async (id: string): Promise<AvailableApplication> => {
    return apiRequest<AvailableApplication>(`/applicant/applications/${id}/`, {
      method: "GET",
    });
  },

  /**
   * GET /applicant/my-submissions/
   * Get list of user's submissions
   */
  getMySubmissions: async (): Promise<MySubmission[]> => {
    return apiRequest<MySubmission[]>("/applicant/my-submissions/", {
      method: "GET",
    });
  },

  /**
   * GET /applicant/my-submissions/{id}/
   * Get submission details by ID
   */
  getSubmission: async (id: string): Promise<ApplicationSubmissionDetail> => {
    return apiRequest<ApplicationSubmissionDetail>(`/applicant/my-submissions/${id}/`, {
      method: "GET",
    });
  },

  /**
   * POST /applicant/submissions/create/
   * Create a new submission
   */
  createSubmission: async (data: ApplicationSubmissionCreate): Promise<MySubmission> => {
    return apiRequest<MySubmission>("/applicant/submissions/create/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * POST /applicant/submissions/{id}/documents/
   * Upload documents for a submission
   */
  uploadDocument: async (
    submissionId: string,
    formData: FormData
  ): Promise<ApplicationDocument> => {
    return apiUpload(
      `/applicant/submissions/${submissionId}/documents/`,
      formData
    ) as Promise<ApplicationDocument>;
  },

  /**
   * POST /applicant/submissions/{id}/submit/
   * Submit a submission for review
   */
  submitSubmission: async (id: string): Promise<{ message: string; submission: MySubmission }> => {
    return apiRequest<{ message: string; submission: MySubmission }>(
      `/applicant/submissions/${id}/submit/`,
      {
        method: "POST",
      }
    );
  },

  /**
   * PUT /applicant/submissions/{id}/update/
   * Update a submission
   */
  updateSubmission: async (
    id: string,
    data: ApplicationSubmissionUpdate
  ): Promise<ApplicationSubmissionDetail> => {
    return apiRequest<ApplicationSubmissionDetail>(
      `/applicant/submissions/${id}/update/`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  },
};
