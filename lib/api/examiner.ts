import { apiRequest } from "@/lib/hooks/useUniversalFetch";
import type { Examiner } from "@/types";

// Examiner Types
export interface ExaminerCreate {
  full_name: string;
  email: string;
  phone?: string;
  specialization_id: string;
  degree: string;
  position: string;
  organization: string;
  is_active?: boolean;
}

export interface ExaminerUpdate extends Partial<ExaminerCreate> {
  is_active?: boolean;
}

export interface ExaminerListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Examiner[];
}

export interface ExaminerDetail {
  id: number;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  degree: string;
  position: string;
  organization: string;
  specialization?: {
    id: string;
    code: string;
    name: string;
  };
  specialization_id: string;
  title: string;
  department: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  specialities: string;
  statistics: string;
  recent_assignments: string;
}

export interface ExaminerStatistics {
  total_submissions: number;
  approved_submissions: number;
  rejected_submissions: number;
  pending_submissions: number;
  average_score: string;
}

export interface Assignment {
  id: number;
  submission_number: string;
  status: string;
}

export interface ExaminerWorkloadData {
  examiner: {
    id: number;
    title: string;
    department: string;
  };
  workload: {
    total_assignments: number;
    pending_reviews: number;
    in_progress_reviews: number;
    completed_reviews: number;
    total_reviews: number;
  };
  assignments: Assignment[];
}

export interface ExaminerWorkloadResponse {
  message: string;
  error: null | string;
  status: number;
  data: ExaminerWorkloadData;
}

// Examiner API Service
export const examinerApi = {
  /**
   * GET /examiner/list/
   * Get list of all examiners
   */
  getExaminers: async (
    page = 1,
    pageSize = 20,
    search?: string
  ): Promise<ExaminerListResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    if (search) params.append("search", search);

    return apiRequest<ExaminerListResponse>(
      `/examiner/list/?${params.toString()}`,
      {
        method: "GET",
      }
    );
  },

  /**
   * GET /examiner/{id}/
   * Get examiner details by ID
   */
  getExaminer: async (id: string): Promise<ExaminerDetail> => {
    return apiRequest<ExaminerDetail>(`/examiner/${id}/`, {
      method: "GET",
    });
  },

  /**
   * POST /examiner/create/
   * Create a new examiner
   */
  createExaminer: async (data: ExaminerCreate): Promise<ExaminerDetail> => {
    return apiRequest<ExaminerDetail>("/examiner/create/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * POST /examiner/{id}/update/
   * Update an examiner
   */
  updateExaminer: async (
    id: string,
    data: ExaminerUpdate
  ): Promise<ExaminerDetail> => {
    return apiRequest<ExaminerDetail>(`/examiner/${id}/update/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE /examiner/{id}/delete/
   * Delete an examiner
   */
  deleteExaminer: async (id: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/examiner/${id}/delete/`, {
      method: "DELETE",
    });
  },

  /**
   * GET /examiner/{id}/statistics/
   * Get examiner statistics
   */
  getExaminerStatistics: async (id: string): Promise<ExaminerStatistics> => {
    return apiRequest<ExaminerStatistics>(`/examiner/${id}/statistics/`, {
      method: "GET",
    });
  },

  /**
   * GET /examiner/{id}/workload/
   * Get examiner workload details
   */
  getExaminerWorkload: async (id: string): Promise<ExaminerWorkloadResponse> => {
    return apiRequest<ExaminerWorkloadResponse>(`/examiner/${id}/workload/`, {
      method: "GET",
    });
  },
};