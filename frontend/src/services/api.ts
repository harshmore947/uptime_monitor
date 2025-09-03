// API service for backend communication
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export interface ApiResponse<T = any> {
  success: boolean;
  msg: string;
  token?: string;
  user?: T;
  data?: T;
}

export interface LoginResponse {
  token: string;
  user: any;
}

export interface UserProfile {
  _id: string;
  email: string;
  name?: string;
  plan: "starter" | "pro" | "business";
  isActive: boolean;
  settings: {
    notification: {
      email: boolean;
      slack: boolean;
      discord: boolean;
    };
    timezone: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Monitor {
  _id: string;
  name: string;
  url: string;
  type: "http" | "https" | "tcp" | "ping";
  interval: number;
  timeout: number;
  retries: number;
  isActive: boolean;
  userId: string;
  method?: string;
  intervalSeconds?: number;
  timeoutSeconds?: number;
  status?: "up" | "down" | "paused" | "pending";
  alertSettings?: {
    enabled: boolean;
    email: boolean;
    slackWebhook: string;
    discordWebhook: string;
  };
  expectedStatusCode?: number;
  customHeaders?: { key: string; value: string }[];
  lastCheckAt?: string;
  lastDowntimeAt?: string;
  totalDowntime?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MonitorCheck {
  _id: string;
  monitorId: string;
  status: "up" | "down";
  responseTime: number;
  statusCode?: number;
  error?: string;
  timestamp: string;
}

export interface Incident {
  _id: string;
  monitorId: string;
  title: string;
  description: string;
  status: "investigating" | "identified" | "monitoring" | "resolved";
  severity: "low" | "medium" | "high" | "critical";
  startedAt: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalMonitors: number;
  activeMonitors: number;
  totalIncidents: number;
  resolvedIncidents: number;
  averageUptime: number;
  averageResponseTime: number;
  totalChecks: number;
  uptimePercentage: number;
}

export interface StatusPage {
  _id: string;
  name: string;
  slug: string;
  description: string;
  monitors: string[];
  isPublic: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("auth_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Request failed");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (!response.success) {
      throw new Error(response.msg);
    }

    return {
      token: response.token!,
      user: {} as UserProfile, // Will be fetched separately
    };
  }

  async register(
    email: string,
    password: string,
    name?: string
  ): Promise<LoginResponse> {
    const response = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.success) {
      throw new Error(response.msg);
    }

    return {
      token: response.token!,
      user: {} as UserProfile, // Will be fetched separately
    };
  }

  async logout(): Promise<void> {
    const response = await this.request("/auth/logout", {
      method: "POST",
    });

    if (!response.success) {
      throw new Error(response.msg);
    }
  }

  async getCurrentUser(): Promise<UserProfile> {
    const response = await this.request("/auth/me");

    if (!response.success) {
      throw new Error(response.msg);
    }

    return response.user as UserProfile;
  }

  async updateProfile(data: {
    email?: string;
    name?: string;
    password?: string;
    settings?: {
      notification?: {
        email?: boolean;
        slack?: boolean;
        discord?: boolean;
      };
      timezone?: string;
    };
  }): Promise<UserProfile> {
    const response = await this.request("/auth/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });

    if (!response.success) {
      throw new Error(response.msg);
    }

    return response.user as UserProfile;
  }

  async forgotPassword(email: string): Promise<void> {
    const response = await this.request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    if (!response.success) {
      throw new Error(response.msg);
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const response = await this.request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });

    if (!response.success) {
      throw new Error(response.msg);
    }
  }

  // Dashboard endpoints
  async getDashboard(): Promise<DashboardStats> {
    const response = await this.request<DashboardStats>("/dashboard");

    if (!response.success) {
      throw new Error(response.msg);
    }

    return response.data || (response as any);
  }

  async getGlobalUptime(): Promise<{ uptime: number; totalChecks: number }> {
    const response = await this.request("/uptime/global");

    if (!response.success) {
      throw new Error(response.msg);
    }

    return response.data as { uptime: number; totalChecks: number };
  }

  async getAlerts(): Promise<any[]> {
    const response = await this.request<{ alerts: any[] }>("/alerts");

    if (!response.success) {
      throw new Error(response.msg);
    }

    return response.data?.alerts || [];
  }

  // Monitor endpoints
  async getMonitors(): Promise<Monitor[]> {
    const response = await this.request<{ monitors: Monitor[] }>("/monitors");

    if (!response.success) {
      throw new Error(response.msg);
    }

    return response.data?.monitors || [];
  }

  async getMonitorById(id: string): Promise<Monitor> {
    const response = await this.request<{ monitor: Monitor }>(
      `/monitors/${id}`
    );

    if (!response.success) {
      throw new Error(response.msg);
    }

    return response.data?.monitor as Monitor;
  }

  async createMonitor(data: {
    name: string;
    url: string;
    type: "http" | "https" | "tcp" | "ping";
    interval?: number;
    timeout?: number;
    retries?: number;
    method?: string;
    expectedStatusCode?: number;
    customHeaders?: { key: string; value: string }[];
  }): Promise<Monitor> {
    const response = await this.request<{ monitor: Monitor }>("/monitors", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!response.success) {
      throw new Error(response.msg);
    }

    return response.data?.monitor as Monitor;
  }

  async updateMonitor(id: string, data: Partial<Monitor>): Promise<Monitor> {
    const response = await this.request<{ monitor: Monitor }>(
      `/monitors/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );

    if (!response.success) {
      throw new Error(response.msg);
    }

    return response.data?.monitor as Monitor;
  }

  async deleteMonitor(id: string): Promise<void> {
    const response = await this.request(`/monitors/${id}`, {
      method: "DELETE",
    });

    if (!response.success) {
      throw new Error(response.msg);
    }
  }

  async pauseMonitor(id: string): Promise<Monitor> {
    const response = await this.request<{ monitor: Monitor }>(
      `/monitors/${id}/pause`,
      {
        method: "POST",
      }
    );

    if (!response.success) {
      throw new Error(response.msg);
    }

    return response.data?.monitor as Monitor;
  }

  async resumeMonitor(id: string): Promise<Monitor> {
    const response = await this.request<{ monitor: Monitor }>(
      `/monitors/${id}/resume`,
      {
        method: "POST",
      }
    );

    if (!response.success) {
      throw new Error(response.msg);
    }

    return response.data?.monitor as Monitor;
  }

  async getMonitorChecks(
    id: string,
    params?: {
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<MonitorCheck[]> {
    const queryParams = params
      ? new URLSearchParams(params as any).toString()
      : "";
    const url = `/monitors/${id}/checks${queryParams ? `?${queryParams}` : ""}`;

    const response = await this.request<{ checks: MonitorCheck[] }>(url);

    if (!response.success) {
      throw new Error(response.msg);
    }

    return response.data?.checks || [];
  }

  async getMonitorUptime(
    id: string
  ): Promise<{ uptime: number; totalChecks: number; last24Hours: any[] }> {
    const response = await this.request(`/monitors/${id}/uptime`);

    if (!response.success) {
      throw new Error(response.msg);
    }

    return response.data as {
      uptime: number;
      totalChecks: number;
      last24Hours: any[];
    };
  }

  // Incident endpoints
  async getIncidents(): Promise<Incident[]> {
    const response = await this.request<{ incidents: Incident[] }>(
      "/incidents"
    );

    if (!response.success) {
      throw new Error(response.msg);
    }

    return response.data?.incidents || [];
  }

  async getIncidentsByMonitor(monitorId: string): Promise<Incident[]> {
    const response = await this.request<{ incidents: Incident[] }>(
      `/monitors/${monitorId}/incidents`
    );

    if (!response.success) {
      throw new Error(response.msg);
    }

    return response.data?.incidents || [];
  }

  async createIncident(
    monitorId: string,
    data: {
      title: string;
      description: string;
      severity: "low" | "medium" | "high" | "critical";
    }
  ): Promise<Incident> {
    const response = await this.request<{ incident: Incident }>(
      `/monitors/${monitorId}/incidents`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    if (!response.success) {
      throw new Error(response.msg);
    }

    return response.data?.incident as Incident;
  }

  async updateIncident(id: string, data: Partial<Incident>): Promise<Incident> {
    const response = await this.request<{ incident: Incident }>(
      `/incidents/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );

    if (!response.success) {
      throw new Error(response.msg);
    }

    return response.data?.incident as Incident;
  }

  async deleteIncident(id: string): Promise<void> {
    const response = await this.request(`/incidents/${id}`, {
      method: "DELETE",
    });

    if (!response.success) {
      throw new Error(response.msg);
    }
  }

  // Status Page endpoints
  async getStatusPages(): Promise<StatusPage[]> {
    const response = await this.request<{ statusPages: StatusPage[] }>(
      "/status"
    );

    if (!response.success) {
      throw new Error(response.msg);
    }

    return response.data?.statusPages || [];
  }

  async getStatusPageById(id: string): Promise<StatusPage> {
    const response = await this.request<{ statusPage: StatusPage }>(
      `/status/${id}`
    );

    if (!response.success) {
      throw new Error(response.msg);
    }

    return response.data?.statusPage as StatusPage;
  }

  async createStatusPage(data: {
    name: string;
    description: string;
    monitors: string[];
    isPublic?: boolean;
  }): Promise<StatusPage> {
    const response = await this.request<{ statusPage: StatusPage }>("/status", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!response.success) {
      throw new Error(response.msg);
    }

    return response.data?.statusPage as StatusPage;
  }

  async updateStatusPage(
    id: string,
    data: Partial<StatusPage>
  ): Promise<StatusPage> {
    const response = await this.request<{ statusPage: StatusPage }>(
      `/status/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );

    if (!response.success) {
      throw new Error(response.msg);
    }

    return response.data?.statusPage as StatusPage;
  }

  async deleteStatusPage(id: string): Promise<void> {
    const response = await this.request(`/status/${id}`, {
      method: "DELETE",
    });

    if (!response.success) {
      throw new Error(response.msg);
    }
  }

  async getPublicStatusPage(slug: string): Promise<StatusPage> {
    const response = await this.request<{ statusPage: StatusPage }>(
      `/status/public/${slug}`
    );

    if (!response.success) {
      throw new Error(response.msg);
    }

    return response.data?.statusPage as StatusPage;
  }
}

export const apiService = new ApiService();
