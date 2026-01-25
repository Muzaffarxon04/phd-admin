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

// Speciality API Service
export const specialityApi = {
  /**
   * GET /examiner/
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
      `/examiner/?${params.toString()}`,
      {
        method: "GET",
      }
    );
  },

  /**
   * GET /examiner/{id}/
   * Get speciality details by ID
   */
  getSpeciality: async (id: string): Promise<Speciality> => {
    return apiRequest<Speciality>(`/examiner/${id}/`, {
      method: "GET",
    });
  },

  /**
   * POST /examiner/create/
   * Create a new speciality
   */
  createSpeciality: async (data: SpecialityCreate): Promise<Speciality> => {
    return apiRequest<Speciality>("/examiner/create/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * PUT /examiner/{id}/update/
   * Update a speciality
   */
  updateSpeciality: async (
    id: string,
    data: SpecialityUpdate
  ): Promise<Speciality> => {
    return apiRequest<Speciality>(`/examiner/${id}/update/`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE /examiner/{id}/delete/
   * Delete a speciality
   */
  deleteSpeciality: async (id: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/examiner/${id}/delete/`, {
      method: "DELETE",
    });
  },
};