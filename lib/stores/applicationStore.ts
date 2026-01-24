import { create } from "zustand";
import type { Application, ApplicationStatus, DocumentType, ForeignLanguage } from "@/types";
import { applicantApi, adminApi } from "@/lib/api";
import type {
  AvailableApplication,
  MySubmission,
  ApplicationSubmissionDetail,
  ApplicationSubmissionCreate,
  ApplicationDocument,
  ApplicationDetail,
  ApplicationCreate,
  ApplicationUpdate,
} from "@/lib/api";

interface ApplicationState {
  applications: AvailableApplication[];
  submissions: MySubmission[];
  currentApplication: ApplicationDetail | null;
  currentSubmission: ApplicationSubmissionDetail | null;
  isLoading: boolean;
  error: string | null;
  
  // Applicant Actions
  fetchApplications: () => Promise<void>;
  fetchSubmissions: () => Promise<void>;
  getApplication: (id: string) => Promise<void>;
  getSubmission: (id: string) => Promise<void>;
  createSubmission: (applicationId: string) => Promise<MySubmission>;
  uploadDocument: (submissionId: string, file: File, documentType: string) => Promise<void>;
  submitSubmission: (submissionId: string) => Promise<void>;
  updateSubmission: (id: string, data: any) => Promise<void>;
  
  // Admin Actions
  adminFetchApplications: (page?: number, pageSize?: number) => Promise<void>;
  adminGetApplication: (id: string) => Promise<void>;
  adminCreateApplication: (data: ApplicationCreate) => Promise<ApplicationDetail>;
  adminUpdateApplication: (id: string, data: ApplicationUpdate) => Promise<void>;
  adminDeleteApplication: (id: string) => Promise<void>;
  adminFetchSubmissions: (page?: number, pageSize?: number, status?: string) => Promise<void>;
  adminGetSubmission: (id: string) => Promise<void>;
  adminApproveSubmission: (id: string) => Promise<void>;
  adminRejectSubmission: (id: string, reason: string) => Promise<void>;
  
  // Common Actions
  setCurrentApplication: (application: ApplicationDetail | null) => void;
  setCurrentSubmission: (submission: ApplicationSubmissionDetail | null) => void;
  clearCurrent: () => void;
}

export const useApplicationStore = create<ApplicationState>((set, get) => ({
  applications: [],
  submissions: [],
  currentApplication: null,
  currentSubmission: null,
  isLoading: false,
  error: null,

  // Applicant Actions
  fetchApplications: async () => {
    set({ isLoading: true, error: null });
    try {
      const applications = await applicantApi.getApplications();
      set({
        applications,
        isLoading: false,
      });
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch applications",
        isLoading: false,
      });
    }
  },

  fetchSubmissions: async () => {
    set({ isLoading: true, error: null });
    try {
      const submissions = await applicantApi.getMySubmissions();
      set({
        submissions,
        isLoading: false,
      });
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch submissions",
        isLoading: false,
      });
    }
  },

  getApplication: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const application = await applicantApi.getApplication(id);
      set({
        currentApplication: application,
        isLoading: false,
      });
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch application",
        isLoading: false,
      });
    }
  },

  getSubmission: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const submission = await applicantApi.getSubmission(id);
      set({
        currentSubmission: submission,
        isLoading: false,
      });
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch submission",
        isLoading: false,
      });
    }
  },

  createSubmission: async (applicationId: string) => {
    set({ isLoading: true, error: null });
    try {
      const submission = await applicantApi.createSubmission({ application_id: applicationId });
      set((state) => ({
        submissions: [...state.submissions, submission],
        currentSubmission: submission as ApplicationSubmissionDetail,
        isLoading: false,
      }));
      return submission;
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : "Failed to create submission",
        isLoading: false,
      });
      throw error;
    }
  },

  uploadDocument: async (submissionId: string, file: File, documentType: string) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_type", documentType);
      
      const document = await applicantApi.uploadDocument(submissionId, formData);

      set((state) => ({
        currentSubmission: state.currentSubmission
          ? {
              ...state.currentSubmission,
              documents: [...(state.currentSubmission.documents || []), document],
            }
          : null,
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : "Failed to upload document",
        isLoading: false,
      });
      throw error;
    }
  },

  submitSubmission: async (submissionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await applicantApi.submitSubmission(submissionId);
      set((state) => ({
        submissions: state.submissions.map((sub) =>
          sub.id === submissionId ? result.submission : sub
        ),
        currentSubmission: state.currentSubmission?.id === submissionId
          ? (result.submission as ApplicationSubmissionDetail)
          : state.currentSubmission,
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : "Failed to submit submission",
        isLoading: false,
      });
      throw error;
    }
  },

  updateSubmission: async (id: string, data: any) => {
    set({ isLoading: true, error: null });
    try {
      const submission = await applicantApi.updateSubmission(id, data);
      set((state) => ({
        submissions: state.submissions.map((sub) =>
          sub.id === id ? submission : sub
        ),
        currentSubmission: state.currentSubmission?.id === id ? submission : state.currentSubmission,
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : "Failed to update submission",
        isLoading: false,
      });
      throw error;
    }
  },

  // Admin Actions
  adminFetchApplications: async (page = 1, pageSize = 20) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminApi.getApplications(page, pageSize);
      set({
        applications: response.results,
        isLoading: false,
      });
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch applications",
        isLoading: false,
      });
    }
  },

  adminGetApplication: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const application = await adminApi.getApplication(id);
      set({
        currentApplication: application,
        isLoading: false,
      });
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch application",
        isLoading: false,
      });
    }
  },

  adminCreateApplication: async (data: ApplicationCreate) => {
    set({ isLoading: true, error: null });
    try {
      const application = await adminApi.createApplication(data);
      set((state) => ({
        applications: [...state.applications, application],
        currentApplication: application,
        isLoading: false,
      }));
      return application;
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : "Failed to create application",
        isLoading: false,
      });
      throw error;
    }
  },

  adminUpdateApplication: async (id: string, data: ApplicationUpdate) => {
    set({ isLoading: true, error: null });
    try {
      const application = await adminApi.updateApplication(id, data);
      set((state) => ({
        applications: state.applications.map((app) =>
          app.id === id ? application : app
        ),
        currentApplication: state.currentApplication?.id === id ? application : state.currentApplication,
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : "Failed to update application",
        isLoading: false,
      });
      throw error;
    }
  },

  adminDeleteApplication: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await adminApi.deleteApplication(id);
      set((state) => ({
        applications: state.applications.filter((app) => app.id !== id),
        currentApplication: state.currentApplication?.id === id ? null : state.currentApplication,
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : "Failed to delete application",
        isLoading: false,
      });
      throw error;
    }
  },

  adminFetchSubmissions: async (page = 1, pageSize = 20, status?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminApi.getSubmissions(page, pageSize, status);
      // Convert admin submission format to MySubmission format for display
      const submissions = response.results as any[];
      set({
        submissions: submissions,
        isLoading: false,
      });
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch submissions",
        isLoading: false,
      });
    }
  },

  adminGetSubmission: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const submission = await adminApi.getSubmission(id);
      set({
        currentSubmission: submission as ApplicationSubmissionDetail,
        isLoading: false,
      });
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch submission",
        isLoading: false,
      });
    }
  },

  adminApproveSubmission: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await adminApi.approveSubmission(id);
      set((state) => ({
        submissions: state.submissions.map((sub) =>
          sub.id === id ? result.submission : sub
        ),
        currentSubmission: state.currentSubmission?.id === id
          ? (result.submission as ApplicationSubmissionDetail)
          : state.currentSubmission,
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : "Failed to approve submission",
        isLoading: false,
      });
      throw error;
    }
  },

  adminRejectSubmission: async (id: string, reason: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await adminApi.rejectSubmission(id, { reason });
      set((state) => ({
        submissions: state.submissions.map((sub) =>
          sub.id === id ? result.submission : sub
        ),
        currentSubmission: state.currentSubmission?.id === id
          ? (result.submission as ApplicationSubmissionDetail)
          : state.currentSubmission,
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : "Failed to reject submission",
        isLoading: false,
      });
      throw error;
    }
  },

  // Common Actions
  setCurrentApplication: (application) => set({ currentApplication: application }),
  setCurrentSubmission: (submission) => set({ currentSubmission: submission }),
  clearCurrent: () => set({ currentApplication: null, currentSubmission: null }),
}));
