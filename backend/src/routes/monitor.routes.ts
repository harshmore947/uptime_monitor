import { Router } from "express";
import {
  fetchMonitors,
  fetchMonitorsById,
  createMonitor,
  updateMonitor,
  deleteMonitor,
  pauseMonitor,
  resumeMonitor,
  getMonitorChecks,
  getMonitorUptime,
} from "../controllers/monitor.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// GET /api/monitors - List all monitors (with pagination & status filter)
router.get("/", authMiddleware, fetchMonitors);

// POST /api/monitors - Create new monitor
router.post("/", authMiddleware, createMonitor);

// GET /api/monitors/:id - Get monitor details
router.get("/:id", authMiddleware, fetchMonitorsById);

// PUT /api/monitors/:id - Update monitor
router.put("/:id", authMiddleware, updateMonitor);

// DELETE /api/monitors/:id - Delete monitor
router.delete("/:id", authMiddleware, deleteMonitor);

// POST /api/monitors/:id/pause - Pause monitor
router.post("/:id/pause", authMiddleware, pauseMonitor);

// POST /api/monitors/:id/resume - Resume monitor
router.post("/:id/resume", authMiddleware, resumeMonitor);

// GET /api/monitors/:id/checks - Get check history (with date range & pagination)
router.get("/:id/checks", authMiddleware, getMonitorChecks);

// GET /api/monitors/:id/uptime - Get uptime stats
router.get("/:id/uptime", authMiddleware, getMonitorUptime);

export default router;
