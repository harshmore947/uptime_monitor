import express from "express";
import "dotenv/config";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.routes";
import monitorRoutes from "./routes/monitor.routes";
import statusPageRoutes from "./routes/statusPage.routes";
import incidentRoutes from "./routes/incident.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import type { Application, Request, Response } from "express";
import { connectDatabase } from "./lib/database";
import { startEscalationMonitoring } from "./utils/alerts";
require("./utils/cronJob");

const app: Application = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  },
});

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], // Frontend dev server ports
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("hello there");
});

//auth routes
app.use("/api", authRoutes);
//dashboard routes (must come before monitor routes to avoid conflicts)
app.use("/api", dashboardRoutes);
//monitors routes
app.use("/api", monitorRoutes);
//status page routes
app.use("/api", statusPageRoutes);
//incident routes
app.use("/api", incidentRoutes);

connectDatabase(process.env.MONGO_URL as string);

// Start escalation monitoring
startEscalationMonitoring();

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Join user-specific room for personalized updates
  socket.on("join-user-room", (userId: string) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room`);
  });

  // Join monitor-specific room for monitor updates
  socket.on("join-monitor-room", (monitorId: string) => {
    socket.join(`monitor_${monitorId}`);
    console.log(`Monitor ${monitorId} joined room`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Export io instance for use in other modules
export { io };

server.listen(process.env.PORT, () => {
  console.log(`Server started on Port ${process.env.PORT} ✅`);
  console.log(`WebSocket server ready ✅`);
});
