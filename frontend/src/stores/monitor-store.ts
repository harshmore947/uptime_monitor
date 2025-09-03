import { create } from "zustand";
import { apiService } from "../services/api";
import type {
  Monitor,
  Incident,
  DashboardStats,
  MonitorCheck,
  StatusPage,
} from "../services/api";

interface MonitorState {
  monitors: Monitor[];
  currentMonitor: Monitor | null;
  monitorChecks: MonitorCheck[];
  isLoading: boolean;
  error: string | null;
}

interface IncidentState {
  incidents: Incident[];
  currentIncident: Incident | null;
  isLoading: boolean;
  error: string | null;
}

interface DashboardState {
  stats: DashboardStats | null;
  alerts: any[];
  isLoading: boolean;
  error: string | null;
}

interface StatusPageState {
  statusPages: StatusPage[];
  currentStatusPage: StatusPage | null;
  isLoading: boolean;
  error: string | null;
}

interface MonitorActions {
  fetchMonitors: () => Promise<void>;
  fetchMonitorById: (id: string) => Promise<void>;
  createMonitor: (data: {
    name: string;
    url: string;
    type: "http" | "https" | "tcp" | "ping";
    interval?: number;
    timeout?: number;
    retries?: number;
    method?: string;
    expectedStatusCode?: number;
    customHeaders?: { key: string; value: string }[];
  }) => Promise<void>;
  updateMonitor: (id: string, data: Partial<Monitor>) => Promise<void>;
  deleteMonitor: (id: string) => Promise<void>;
  pauseMonitor: (id: string) => Promise<void>;
  resumeMonitor: (id: string) => Promise<void>;
  fetchMonitorChecks: (
    id: string,
    params?: {
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
    }
  ) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
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

interface DashboardActions {
  fetchDashboard: () => Promise<void>;
  fetchAlerts: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
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

export type MonitorStore = MonitorState & MonitorActions;
export type IncidentStore = IncidentState & IncidentActions;
export type DashboardStore = DashboardState & DashboardActions;
export type StatusPageStore = StatusPageState & StatusPageActions;

// Monitor Store
export const useMonitorStore = create<MonitorStore>((set, get) => ({
  monitors: [],
  currentMonitor: null,
  monitorChecks: [],
  isLoading: false,
  error: null,

  fetchMonitors: async () => {
    set({ isLoading: true, error: null });
    try {
      const monitors = await apiService.getMonitors();
      set({ monitors, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch monitors",
      });
    }
  },

  fetchMonitorById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const monitor = await apiService.getMonitorById(id);
      set({ currentMonitor: monitor, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch monitor",
      });
    }
  },

  createMonitor: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newMonitor = await apiService.createMonitor(data);
      const { monitors } = get();
      set({
        monitors: [...monitors, newMonitor],
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to create monitor",
      });
      throw error;
    }
  },

  updateMonitor: async (id: string, data: Partial<Monitor>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedMonitor = await apiService.updateMonitor(id, data);
      const { monitors } = get();
      set({
        monitors: monitors.map((m) => (m._id === id ? updatedMonitor : m)),
        currentMonitor: updatedMonitor,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to update monitor",
      });
      throw error;
    }
  },

  deleteMonitor: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.deleteMonitor(id);
      const { monitors } = get();
      set({
        monitors: monitors.filter((m) => m._id !== id),
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to delete monitor",
      });
      throw error;
    }
  },

  pauseMonitor: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedMonitor = await apiService.pauseMonitor(id);
      const { monitors } = get();
      set({
        monitors: monitors.map((m) => (m._id === id ? updatedMonitor : m)),
        currentMonitor: updatedMonitor,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to pause monitor",
      });
      throw error;
    }
  },

  resumeMonitor: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedMonitor = await apiService.resumeMonitor(id);
      const { monitors } = get();
      set({
        monitors: monitors.map((m) => (m._id === id ? updatedMonitor : m)),
        currentMonitor: updatedMonitor,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to resume monitor",
      });
      throw error;
    }
  },

  fetchMonitorChecks: async (id: string, params) => {
    set({ isLoading: true, error: null });
    try {
      const checks = await apiService.getMonitorChecks(id, params);
      set({ monitorChecks: checks, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch monitor checks",
      });
    }
  },

  clearError: () => set({ error: null }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));

// Incident Store
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

// Dashboard Store
export const useDashboardStore = create<DashboardStore>((set) => ({
  stats: null,
  alerts: [],
  isLoading: false,
  error: null,

  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const stats = await apiService.getDashboard();
      set({ stats, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch dashboard",
      });
    }
  },

  fetchAlerts: async () => {
    set({ isLoading: true, error: null });
    try {
      const alerts = await apiService.getAlerts();
      set({ alerts, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch alerts",
      });
    }
  },

  clearError: () => set({ error: null }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));

// Status Page Store
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
