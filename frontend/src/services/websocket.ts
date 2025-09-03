import { io, Socket } from "socket.io-client";

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(userId?: string) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(import.meta.env.VITE_WS_URL || "http://localhost:3000", {
      transports: ["websocket", "polling"],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
    });

    this.socket.on("connect", () => {
      console.log("🔌 Connected to WebSocket server");
      this.reconnectAttempts = 0;

      // Join user-specific room if userId is provided
      if (userId) {
        this.socket?.emit("join-user-room", userId);
      }
    });

    this.socket.on("disconnect", (reason) => {
      console.log("🔌 Disconnected from WebSocket server:", reason);

      if (reason === "io server disconnect") {
        // Server disconnected, try to reconnect
        this.attemptReconnect();
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("🔌 WebSocket connection error:", error);
      this.attemptReconnect();
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log(
        "🔌 Reconnected to WebSocket server after",
        attemptNumber,
        "attempts"
      );
    });

    this.socket.on("reconnect_error", (error) => {
      console.error("🔌 WebSocket reconnection error:", error);
    });

    this.socket.on("reconnect_failed", () => {
      console.error("🔌 WebSocket reconnection failed");
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `🔌 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );

      setTimeout(() => {
        this.socket?.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error("🔌 Max reconnection attempts reached");
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Monitor-specific room management
  joinMonitorRoom(monitorId: string) {
    if (this.socket?.connected) {
      this.socket.emit("join-monitor-room", monitorId);
    }
  }

  leaveMonitorRoom(monitorId: string) {
    if (this.socket?.connected) {
      this.socket.emit("leave-monitor-room", monitorId);
    }
  }

  // Event listeners for real-time updates
  onMonitorStatusChange(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on("monitor-status-change", callback);
    }
  }

  onStatusUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on("status-update", callback);
    }
  }

  // Generic event listener
  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  // Check connection status
  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get socket instance (for advanced usage)
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Create singleton instance
export const websocketService = new WebSocketService();
export default websocketService;
