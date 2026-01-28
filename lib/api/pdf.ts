// PDF API uses direct fetch for file downloads

// PDF Types
export interface PDFResponse {
  file_url?: string;
  file_name?: string;
  message?: string;
}

// PDF API Service
export const pdfApi = {
  /**
   * GET /pdf/submission-marks/{id}/generate-guvohnoma/
   * Generate and return PDF certificate for submission marks
   */
  generateCertificate: async (submissionId: string): Promise<Blob> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/pdf/submission-marks/${submissionId}/generate-guvohnoma/`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to generate certificate");
    }

    return response.blob();
  },
};