import { create } from "zustand";
import { apiService } from "../services/api";
import type { Incident } from "../services/api";

interface IncidentState {
  incidents: Incident[];
  currentIncident: Incident | null;
  isLoading: boolean;
  error: string | null;
}

interface IncidentActions {
  fetchIncidents: () => Promise<void>;
  fetchIncidentsByMonitor: (monitorId: string) => Promise<void>;
  createIncident: (
    monitorId: string,
    data: {
      title: string;
      description: string;
      severity: "low" | "medium" | "high" | "critical";
    }
  ) => Promise<void>;
  updateIncident: (id: string, data: Partial<Incident>) => Promise<void>;
  deleteIncident: (id: string) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export type IncidentStore = IncidentState & IncidentActions;

export const useIncidentStore = create<IncidentStore>((set, get) => ({
  incidents: [],
  currentIncident: null,
  isLoading: false,
  error: null,

  fetchIncidents: async () => {
    set({ isLoading: true, error: null });
    try {
      const incidents = await apiService.getIncidents();
      set({ incidents, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch incidents",
      });
    }
  },

  fetchIncidentsByMonitor: async (monitorId: string) => {
    set({ isLoading: true, error: null });
    try {
      const incidents = await apiService.getIncidentsByMonitor(monitorId);
      set({ incidents, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch incidents",
      });
    }
  },

  createIncident: async (monitorId: string, data) => {
    set({ isLoading: true, error: null });
    try {
      const newIncident = await apiService.createIncident(monitorId, data);
      const { incidents } = get();
      set({
        incidents: [...incidents, newIncident],
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to create incident",
      });
      throw error;
    }
  },

  updateIncident: async (id: string, data: Partial<Incident>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedIncident = await apiService.updateIncident(id, data);
      const { incidents } = get();
      set({
        incidents: incidents.map((i) => (i._id === id ? updatedIncident : i)),
        currentIncident: updatedIncident,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to update incident",
      });
      throw error;
    }
  },

  deleteIncident: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.deleteIncident(id);
      const { incidents } = get();
      set({
        incidents: incidents.filter((i) => i._id !== id),
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to delete incident",
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
