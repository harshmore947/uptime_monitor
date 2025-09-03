import { Router } from "express";
import {
  getDashboard,
  getMonitorChecksSummary,
  getGlobalUptime,
  getAlerts,
} from "../controllers/dashboard.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// GET /api/dashboard - Overall stats for the user
router.get("/dashboard", authMiddleware, getDashboard);

// GET /api/monitors/:id/checks/summary - Aggregated check stats for a monitor
router.get(
  "/monitors/:id/checks/summary",
  authMiddleware,
  getMonitorChecksSummary
);

// GET /api/uptime/global - Global uptime stats
router.get("/uptime/global", authMiddleware, getGlobalUptime);

// GET /api/alerts - Lists recent alerts
router.get("/alerts", authMiddleware, getAlerts);

export default router;
