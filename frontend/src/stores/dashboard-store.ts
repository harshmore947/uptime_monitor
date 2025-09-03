import { create } from "zustand";
import { apiService } from "../services/api";
import { websocketService } from "../services/websocket";
import type { DashboardStats } from "../services/api";

interface DashboardState {
  stats: DashboardStats | null;
  alerts: any[];
  isLoading: boolean;
  error: string | null;
}

interface DashboardActions {
  fetchDashboard: () => Promise<void>;
  fetchAlerts: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  connectWebSocket: (userId: string) => void;
  disconnectWebSocket: () => void;
  updateMonitorStatus: (data: any) => void;
}

export type DashboardStore = DashboardState & DashboardActions;

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
          error instanceof Error
            ? error.message
            : "Failed to fetch dashboard stats",
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

  connectWebSocket: (userId: string) => {
    websocketService.connect(userId);

    // Listen for monitor status changes
    websocketService.onMonitorStatusChange((data) => {
      console.log("📡 Real-time monitor status change:", data);
      // Update local state or trigger a refresh
      // You could also emit a custom event for components to listen to
    });
  },

  disconnectWebSocket: () => {
    websocketService.disconnect();
  },

  updateMonitorStatus: (data) => {
    // Handle real-time monitor status updates
    console.log("📡 Monitor status update:", data);
    // This could trigger a local state update or emit events
  },
}));
