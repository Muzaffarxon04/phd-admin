import { apiRequest } from "@/lib/hooks/useUniversalFetch";

// Marks Types
export interface ApplicantMark {
  id: number;
  submission: number;
  submission_details?: {
    id: number;
    submission_number: string;
    applicant_name: string;
    speciality_name: string;
    application_title: string;
    status: string;
  };
  score: string; // Decimal as string
  percentage?: string;
  comments?: string;
  is_active: boolean;
  marked_by?: number;
  marked_at: string;
  updated_at: string;
}

export interface ApplicantMarkCreate {
  submission: number;
  score: string; // Decimal as string
  comments?: string;
}

export interface ApplicantMarkUpdate {
  score?: string;
  comments?: string;
  is_active?: boolean;
}

export interface ApplicantMarkListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApplicantMark[];
}

export interface MarksStatistics {
  total_marks: number;
  average_score: string;
  average_percentage: string;
  highest_score: string;
  lowest_score: string;
  passed_count: number;
  failed_count: number;
  approved_marks: number;
  pending_marks: number;
  by_mark_type: Record<string, number>;
}

// Marks API Service
export const marksApi = {
  /**
   * GET /admin/application/marks/
   * Get list of all applicant marks
   */
  getMarks: async (
    page = 1,
    pageSize = 20,
    submission?: string,
    marked_by?: string
  ): Promise<ApplicantMarkListResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    if (submission) params.append("submission", submission);
    if (marked_by) params.append("marked_by", marked_by);

    return apiRequest<ApplicantMarkListResponse>(
      `/admin/application/marks/?${params.toString()}`,
      {
        method: "GET",
      }
    );
  },

  /**
   * POST /admin/application/marks/
   * Create a new applicant mark
   */
  createMark: async (data: ApplicantMarkCreate): Promise<ApplicantMark> => {
    return apiRequest<ApplicantMark>("/admin/application/marks/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * GET /admin/application/marks/{id}/
   * Get applicant mark details
   */
  getMark: async (id: string): Promise<ApplicantMark> => {
    return apiRequest<ApplicantMark>(`/admin/application/marks/${id}/`, {
      method: "GET",
    });
  },

  /**
   * PUT /admin/application/marks/{id}/
   * Update an applicant mark
   */
  updateMark: async (id: string, data: ApplicantMarkUpdate): Promise<ApplicantMark> => {
    return apiRequest<ApplicantMark>(`/admin/application/marks/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * PATCH /admin/application/marks/{id}/
   * Partially update an applicant mark
   */
  patchMark: async (id: string, data: Partial<ApplicantMarkUpdate>): Promise<ApplicantMark> => {
    return apiRequest<ApplicantMark>(`/admin/application/marks/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE /admin/application/marks/{id}/
   * Delete an applicant mark
   */
  deleteMark: async (id: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/admin/application/marks/${id}/`, {
      method: "DELETE",
    });
  },

  /**
   * GET /admin/application/marks/statistics/
   * Get marks statistics
   */
  getMarksStatistics: async (): Promise<MarksStatistics> => {
    return apiRequest<MarksStatistics>("/admin/application/marks/statistics/", {
      method: "GET",
    });
  },
};