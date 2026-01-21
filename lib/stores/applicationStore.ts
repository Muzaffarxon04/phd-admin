import { create } from "zustand";
import type { Application, ApplicationStatus, DocumentType, ForeignLanguage } from "@/types";
import { delay } from "@/lib/data";

interface ApplicationState {
  applications: Application[];
  currentApplication: Application | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchApplications: () => Promise<void>;
  getApplication: (id: string) => Promise<void>;
  createApplication: (data: {
    specializationId: string;
    foreignLanguage: string;
    organizationName: string;
    examRules: string;
  }) => Promise<Application>;
  updateApplication: (id: string, data: Partial<Application>) => Promise<void>;
  submitApplication: (id: string) => Promise<void>;
  uploadDocument: (applicationId: string, file: File, type: DocumentType) => Promise<void>;
  deleteDocument: (applicationId: string, documentId: string) => Promise<void>;
  setCurrentApplication: (application: Application | null) => void;
}

export const useApplicationStore = create<ApplicationState>((set, get) => ({
  applications: [],
  currentApplication: null,
  isLoading: false,
  error: null,

  fetchApplications: async () => {
    set({ isLoading: true, error: null });
    try {
      // Mock - API ready bo'lganda o'zgartirish kerak
      await delay(500);
      // const applications = await applicationApi.getMyApplications();
      
      // Mock data
      set({
        applications: [],
        isLoading: false,
      });
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch applications",
        isLoading: false,
      });
    }
  },

  getApplication: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await delay(300);
      // const application = await applicationApi.getApplication(id);
      
      const app = get().applications.find((a) => a.id === id);
      set({
        currentApplication: app || null,
        isLoading: false,
      });
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch application",
        isLoading: false,
      });
    }
  },

  createApplication: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await delay(600);
      // const application = await applicationApi.createApplication(data);
      
      const newApplication: Application = {
        id: Date.now().toString(),
        applicantId: "1",
        specializationId: data.specializationId,
        foreignLanguage: data.foreignLanguage as ForeignLanguage,
        organizationName: data.organizationName,
        examRules: data.examRules,
        status: "draft",
        documents: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      set((state) => ({
        applications: [...state.applications, newApplication],
        currentApplication: newApplication,
        isLoading: false,
      }));

      return newApplication;
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : "Failed to create application",
        isLoading: false,
      });
      throw error;
    }
  },

  updateApplication: async (id: string, data: Partial<Application>) => {
    set({ isLoading: true, error: null });
    try {
      await delay(400);
      // await applicationApi.updateApplication(id, data);
      
      set((state) => ({
        applications: state.applications.map((app) =>
          app.id === id
            ? { ...app, ...data, updatedAt: new Date().toISOString() }
            : app
        ),
        currentApplication:
          state.currentApplication?.id === id
            ? {
                ...state.currentApplication,
                ...data,
                updatedAt: new Date().toISOString(),
              }
            : state.currentApplication,
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

  submitApplication: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await delay(500);
      // await applicationApi.submitApplication(id);
      
      set((state) => ({
        applications: state.applications.map((app) =>
          app.id === id
            ? {
                ...app,
                status: "submitted" as ApplicationStatus,
                updatedAt: new Date().toISOString(),
              }
            : app
        ),
        currentApplication:
          state.currentApplication?.id === id
            ? {
                ...state.currentApplication,
                status: "submitted" as ApplicationStatus,
                updatedAt: new Date().toISOString(),
              }
            : state.currentApplication,
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : "Failed to submit application",
        isLoading: false,
      });
      throw error;
    }
  },

  uploadDocument: async (applicationId: string, file: File, type: DocumentType) => {
    set({ isLoading: true, error: null });
    try {
      await delay(1000); // File upload simulation
      // await applicationApi.uploadDocument(applicationId, file, type);
      
      const mockDocument = {
        id: Date.now().toString(),
        applicationId,
        type,
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
      };

      set((state) => ({
        applications: state.applications.map((app) =>
          app.id === applicationId
            ? {
                ...app,
                documents: [...app.documents, mockDocument],
                updatedAt: new Date().toISOString(),
              }
            : app
        ),
        currentApplication:
          state.currentApplication?.id === applicationId
            ? {
                ...state.currentApplication,
                documents: [...state.currentApplication.documents, mockDocument],
                updatedAt: new Date().toISOString(),
              }
            : state.currentApplication,
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

  deleteDocument: async (applicationId: string, documentId: string) => {
    set({ isLoading: true, error: null });
    try {
      await delay(300);
      // await applicationApi.deleteDocument(applicationId, documentId);
      
      set((state) => ({
        applications: state.applications.map((app) =>
          app.id === applicationId
            ? {
                ...app,
                documents: app.documents.filter((doc) => doc.id !== documentId),
                updatedAt: new Date().toISOString(),
              }
            : app
        ),
        currentApplication:
          state.currentApplication?.id === applicationId
            ? {
                ...state.currentApplication,
                documents: state.currentApplication.documents.filter(
                  (doc) => doc.id !== documentId
                ),
                updatedAt: new Date().toISOString(),
              }
            : state.currentApplication,
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({
        error: error instanceof Error ? error.message : "Failed to delete document",
        isLoading: false,
      });
      throw error;
    }
  },

  setCurrentApplication: (application) => set({ currentApplication: application }),
}));
