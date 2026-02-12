import { apiRequest } from "@/lib/hooks/useUniversalFetch";

// Word Templates Types
export interface BulkTemplateRequest {
  application_id?: string;
  speciality_id?: string;
}

export interface TemplateResponse {
  file_url?: string;
  file_name?: string;
  message?: string;
}

export interface PreviewTemplateResponse {
  preview_data?: Record<string, unknown>;
  template_fields?: Record<string, unknown>[];
  message?: string;
}

// Word Templates API Service
export const wordsApi = {
  /**
   * GET /words/guvohnoma-template/bulk/
   * Generate Word template for all applicants
   */
  generateBulkTemplates: async (
    applicationId?: string,
    specialityId?: string
  ): Promise<Blob> => {
    const params = new URLSearchParams();
    if (applicationId) params.append("application_id", applicationId);
    if (specialityId) params.append("speciality_id", specialityId);

    const queryString = params.toString();
    const urlString = queryString
      ? `/words/guvohnoma-template/bulk/?${queryString}`
      : "/words/guvohnoma-template/bulk/";

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://api-doktarant.tashmeduni.uz/api/v1"}${urlString}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to generate bulk templates");
    }

    return response.blob();
  },

  /**
   * GET /words/guvohnoma-template/preview/
   * Preview single guvohnoma template
   */
  previewTemplate: async (
    submissionId?: string,
    applicationId?: string
  ): Promise<PreviewTemplateResponse> => {
    const params = new URLSearchParams();
    if (submissionId) params.append("submission_id", submissionId);
    if (applicationId) params.append("application_id", applicationId);

    const queryString = params.toString();
    const url = queryString
      ? `/words/guvohnoma-template/preview/?${queryString}`
      : "/words/guvohnoma-template/preview/";

    return apiRequest<PreviewTemplateResponse>(url, {
      method: "GET",
    });
  },
};