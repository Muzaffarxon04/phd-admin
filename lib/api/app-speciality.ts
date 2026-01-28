import { apiRequest } from "@/lib/hooks/useUniversalFetch";

// Application Speciality Types
export interface ApplicationSpecialityList {
  id: number;
  application_title: string;
  speciality_name: string;
  speciality_code: string;
  max_applicants?: number;
  is_active: boolean;
  active_examiners: string;
  created_at: string;
}

export interface ApplicationSpecialityCreate {
  application_id: number;
  speciality_id: number[];
  max_applicants?: number;
  examiner_ids?: number[];
}

export interface ApplicationSpecialityDetail {
  id: number;
  application: string;
  speciality: string;
  max_applicants?: number;
  is_active: boolean;
  active_examiners: string;
  removed_examiners: string;
  created_at: string;
}

export interface ApplicationSpecialityUpdate {
  max_applicants?: number;
  is_active?: boolean;
}

export interface BulkAddExaminers {
  examiner_ids: number[];
  notes?: string;
}

export interface BulkRemoveExaminers {
  examiner_ids: number[];
  reason?: string;
}

export interface ReplaceExaminer {
  old_examiner_id: number;
  new_examiner_id: number;
  reason?: string;
}

export interface ApplicationSpecialityListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApplicationSpecialityList[];
}

// Application Speciality API Service
export const appSpecialityApi = {
  /**
   * GET /app-speciality/application-specialities/
   * Get list of all application-speciality links
   */
  getApplicationSpecialities: async (
    page = 1,
    pageSize = 20,
    application_id?: string,
    speciality_id?: string
  ): Promise<ApplicationSpecialityListResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    if (application_id) params.append("application_id", application_id);
    if (speciality_id) params.append("speciality_id", speciality_id);

    return apiRequest<ApplicationSpecialityListResponse>(
      `/app-speciality/application-specialities/?${params.toString()}`,
      {
        method: "GET",
      }
    );
  },

  /**
   * POST /app-speciality/application-specialities/create/
   * Create new application-speciality link
   */
  createApplicationSpeciality: async (data: ApplicationSpecialityCreate): Promise<ApplicationSpecialityDetail> => {
    return apiRequest<ApplicationSpecialityDetail>("/app-speciality/application-specialities/create/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * GET /app-speciality/application-specialities/{id}/
   * Get application-speciality link details
   */
  getApplicationSpeciality: async (id: string): Promise<ApplicationSpecialityDetail> => {
    return apiRequest<ApplicationSpecialityDetail>(`/app-speciality/application-specialities/${id}/`, {
      method: "GET",
    });
  },

  /**
   * DELETE /app-speciality/application-specialities/{id}/delete/
   * Delete application-speciality link
   */
  deleteApplicationSpeciality: async (id: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/app-speciality/application-specialities/${id}/delete/`, {
      method: "DELETE",
    });
  },

  /**
   * POST /app-speciality/application-specialities/{id}/add-examiners/
   * Add examiners to application-speciality link
   */
  addExaminers: async (id: string, data: BulkAddExaminers): Promise<BulkAddExaminers> => {
    return apiRequest<BulkAddExaminers>(`/app-speciality/application-specialities/${id}/add-examiners/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * GET /app-speciality/application-specialities/{id}/examiners/
   * Get examiners for application-speciality link
   */
  getApplicationSpecialityExaminers: async (id: string): Promise<{ examiners: unknown[]; count: number }> => {
    return apiRequest<{ examiners: unknown[]; count: number }>(`/app-speciality/application-specialities/${id}/examiners/`, {
      method: "GET",
    });
  },

  /**
   * POST /app-speciality/application-specialities/{id}/remove-examiners/
   * Remove examiners from application-speciality link
   */
  removeExaminers: async (id: string, data: BulkRemoveExaminers): Promise<BulkRemoveExaminers> => {
    return apiRequest<BulkRemoveExaminers>(`/app-speciality/application-specialities/${id}/remove-examiners/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * POST /app-speciality/application-specialities/{id}/replace-examiner/
   * Replace examiner in application-speciality link
   */
  replaceExaminer: async (id: string, data: ReplaceExaminer): Promise<ReplaceExaminer> => {
    return apiRequest<ReplaceExaminer>(`/app-speciality/application-specialities/${id}/replace-examiner/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * GET /app-speciality/application-specialities/{id}/statistics/
   * Get statistics for application-speciality link
   */
  getApplicationSpecialityStatistics: async (id: string): Promise<{ total_applicants: number; active_examiners: number; statistics: Record<string, unknown> }> => {
    return apiRequest<{ total_applicants: number; active_examiners: number; statistics: Record<string, unknown> }>(`/app-speciality/application-specialities/${id}/statistics/`, {
      method: "GET",
    });
  },

  /**
   * POST /app-speciality/application-specialities/{id}/update/
   * Update application-speciality link
   */
  updateApplicationSpeciality: async (id: string, data: ApplicationSpecialityUpdate): Promise<ApplicationSpecialityDetail> => {
    return apiRequest<ApplicationSpecialityDetail>(`/app-speciality/application-specialities/${id}/update/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};