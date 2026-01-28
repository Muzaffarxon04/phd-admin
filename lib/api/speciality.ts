import { apiRequest } from "@/lib/hooks/useUniversalFetch";
import type { Speciality } from "@/types";

// Speciality Types
export interface SpecialityCreate {
  code: string;
  name: string;
  description?: string;
  field_of_science: string;
  is_active?: boolean;
}

export interface SpecialityUpdate extends Partial<SpecialityCreate> {
  is_active?: boolean;
}

export interface SpecialityListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Speciality[];
}

export interface SpecialityDetail {
  id: number;
  name: string;
  code: string;
  description?: string;
  field_of_science: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  applications_count: string;
  examiners_count: string;
  submissions_count: string;
  statistics: string;
  applications: string;
}

// Speciality API Service
export const specialityApi = {
  /**
   * GET /speciality/list/
   * Get list of all specialities
   */
  getSpecialities: async (
    page = 1,
    pageSize = 20,
    search?: string
  ): Promise<SpecialityListResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    if (search) params.append("search", search);

    return apiRequest<SpecialityListResponse>(
      `/speciality/list/?${params.toString()}`,
      {
        method: "GET",
      }
    );
  },

  /**
   * GET /speciality/specialities/{id}/
   * Get speciality details by ID
   */
  getSpeciality: async (id: string): Promise<SpecialityDetail> => {
    return apiRequest<SpecialityDetail>(`/speciality/specialities/${id}/`, {
      method: "GET",
    });
  },

  /**
   * POST /speciality/create/
   * Create a new speciality
   */
  createSpeciality: async (data: SpecialityCreate): Promise<SpecialityCreate> => {
    return apiRequest<SpecialityCreate>("/speciality/create/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * POST /speciality/update/
   * Update a speciality
   */
  updateSpeciality: async (
    id: string,
    data: SpecialityUpdate
  ): Promise<SpecialityUpdate> => {
    return apiRequest<SpecialityUpdate>("/speciality/update/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE /speciality/delete/
   * Delete a speciality
   */
  deleteSpeciality: async (): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>("/speciality/delete/", {
      method: "DELETE",
    });
  },
};