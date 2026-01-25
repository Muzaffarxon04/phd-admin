import { apiRequest } from "@/lib/hooks/useUniversalFetch";
import type { Examiner, Speciality } from "@/types";

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

// Examiner API Service
export const examinerApi = {
  /**
   * GET /admin/examiners/
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
      `/admin/examiners/?${params.toString()}`,
      {
        method: "GET",
      }
    );
  },

  /**
   * GET /admin/examiners/{id}/
   * Get examiner details by ID
   */
  getExaminer: async (id: string): Promise<Examiner> => {
    return apiRequest<Examiner>(`/admin/examiners/${id}/`, {
      method: "GET",
    });
  },

  /**
   * POST /admin/examiners/create/
   * Create a new examiner
   */
  createExaminer: async (data: ExaminerCreate): Promise<Examiner> => {
    return apiRequest<Examiner>("/admin/examiners/create/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * PUT /admin/examiners/{id}/update/
   * Update an examiner
   */
  updateExaminer: async (
    id: string,
    data: ExaminerUpdate
  ): Promise<Examiner> => {
    return apiRequest<Examiner>(`/admin/examiners/${id}/update/`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE /admin/examiners/{id}/delete/
   * Delete an examiner
   */
  deleteExaminer: async (id: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/admin/examiners/${id}/delete/`, {
      method: "DELETE",
    });
  },

  /**
   * GET /examiner/
   * Get list of all specialities for dropdown
   */
  getSpecialities: async (): Promise<Speciality[]> => {
    return apiRequest<Speciality[]>("/examiner/", {
      method: "GET",
    });
  },
};