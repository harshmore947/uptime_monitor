import { create } from "zustand";
import { apiService } from "../services/api";
import type { StatusPage } from "../services/api";

interface StatusPageState {
  statusPages: StatusPage[];
  currentStatusPage: StatusPage | null;
  isLoading: boolean;
  error: string | null;
}

interface StatusPageActions {
  fetchStatusPages: () => Promise<void>;
  fetchStatusPageById: (id: string) => Promise<void>;
  createStatusPage: (data: {
    name: string;
    description: string;
    monitors: string[];
    isPublic?: boolean;
  }) => Promise<void>;
  updateStatusPage: (id: string, data: Partial<StatusPage>) => Promise<void>;
  deleteStatusPage: (id: string) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export type StatusPageStore = StatusPageState & StatusPageActions;

export const useStatusPageStore = create<StatusPageStore>((set, get) => ({
  statusPages: [],
  currentStatusPage: null,
  isLoading: false,
  error: null,

  fetchStatusPages: async () => {
    set({ isLoading: true, error: null });
    try {
      const statusPages = await apiService.getStatusPages();
      set({ statusPages, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch status pages",
      });
    }
  },

  fetchStatusPageById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const statusPage = await apiService.getStatusPageById(id);
      set({ currentStatusPage: statusPage, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch status page",
      });
    }
  },

  createStatusPage: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newStatusPage = await apiService.createStatusPage(data);
      const { statusPages } = get();
      set({
        statusPages: [...statusPages, newStatusPage],
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create status page",
      });
      throw error;
    }
  },

  updateStatusPage: async (id: string, data: Partial<StatusPage>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedStatusPage = await apiService.updateStatusPage(id, data);
      const { statusPages } = get();
      set({
        statusPages: statusPages.map((s) =>
          s._id === id ? updatedStatusPage : s
        ),
        currentStatusPage: updatedStatusPage,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update status page",
      });
      throw error;
    }
  },

  deleteStatusPage: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.deleteStatusPage(id);
      const { statusPages } = get();
      set({
        statusPages: statusPages.filter((s) => s._id !== id),
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete status page",
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
