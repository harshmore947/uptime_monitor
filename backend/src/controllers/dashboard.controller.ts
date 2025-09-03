import { Request, Response } from "express";
import { Monitor } from "../model/monitor-model";
import { Check } from "../model/check-model";
import { Incident } from "../model/incident-model";

// GET /api/dashboard - Overall stats for the user
export const getDashboard = async (req: Request, res: Response) => {
  try {
    const userId = req.user;

    if (!userId) {
      return res
        .status(401)
        .json({ msg: "User not authenticated", success: false });
    }

    // Total monitors
    const totalMonitors = await Monitor.countDocuments({ userId });

    // Active monitors (up or down, not paused)
    const activeMonitors = await Monitor.countDocuments({
      userId,
      status: { $in: ["up", "down"] },
    });

    // Paused monitors
    const pausedMonitors = await Monitor.countDocuments({
      userId,
      status: "paused",
    });

    // Global uptime percentage (calculated from totalDowntime and createdAt)
    const monitors = await Monitor.find({ userId });
    const totalUptime = monitors.reduce((sum, m) => {
      const totalTime = Date.now() - m.createdAt.getTime();
      const uptime =
        totalTime > 0
          ? ((totalTime - m.totalDowntime * 60000) / totalTime) * 100
          : 0;
      return sum + Math.max(0, Math.min(100, uptime)); // Clamp to 0-100
    }, 0);
    const avgUptime = monitors.length > 0 ? totalUptime / monitors.length : 0;

    // Active incidents (open status)
    const activeIncidents = await Incident.countDocuments({
      monitorId: { $in: monitors.map((m) => m._id) },
      status: "open",
    });

    // Recent checks (last 10)
    const recentChecks = await Check.find({
      monitorId: { $in: monitors.map((m) => m._id) },
    })
      .populate("monitorId", "name url")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      msg: "Dashboard data fetched successfully",
      success: true,
      data: {
        totalMonitors,
        activeMonitors,
        pausedMonitors,
        avgUptime: Math.round(avgUptime * 100) / 100, // Round to 2 decimals
        activeIncidents,
        recentChecks,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    res.status(500).json({ msg: "Internal server error", success: false });
  }
};

// GET /api/monitors/:id/checks/summary - Aggregated check stats for a monitor
export const getMonitorChecksSummary = async (req: Request, res: Response) => {
  try {
    const monitorId = req.params.id;
    const userId = req.user;
    const { period = "7d" } = req.query; // e.g., 1d, 7d, 30d

    if (!userId) {
      return res
        .status(401)
        .json({ msg: "User not authenticated", success: false });
    }

    // Ensure ownership
    const monitor = await Monitor.findOne({ _id: monitorId, userId });
    if (!monitor) {
      return res
        .status(404)
        .json({ msg: "Monitor not found or access denied", success: false });
    }

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    if (period === "1d") startDate.setDate(now.getDate() - 1);
    else if (period === "7d") startDate.setDate(now.getDate() - 7);
    else if (period === "30d") startDate.setDate(now.getDate() - 30);

    // Aggregate checks
    const checks = await Check.find({
      monitorId,
      createdAt: { $gte: startDate },
    });

    const totalChecks = checks.length;
    const successfulChecks = checks.filter((c) => c.success).length;
    const failureRate =
      totalChecks > 0
        ? ((totalChecks - successfulChecks) / totalChecks) * 100
        : 0;

    const avgResponseTime =
      checks.length > 0
        ? checks.reduce((sum, c) => sum + (c.responseTimeMs || 0), 0) /
          checks.length
        : 0;

    res.status(200).json({
      msg: "Check summary fetched successfully",
      success: true,
      summary: {
        period,
        totalChecks,
        successfulChecks,
        failureRate: Math.round(failureRate * 100) / 100,
        avgResponseTime: Math.round(avgResponseTime),
      },
    });
  } catch (error) {
    console.error("Error fetching check summary:", error);
    res.status(500).json({ msg: "Internal server error", success: false });
  }
};

// GET /api/uptime/global - Global uptime stats across all user's monitors
export const getGlobalUptime = async (req: Request, res: Response) => {
  try {
    const userId = req.user;
    const { period = "daily" } = req.query; // daily, weekly, monthly

    if (!userId) {
      return res
        .status(401)
        .json({ msg: "User not authenticated", success: false });
    }

    const monitors = await Monitor.find({ userId });
    const monitorIds = monitors.map((m) => m._id);

    // Aggregate uptime from checks (simplified; adjust for real aggregation)
    const now = new Date();
    let startDate: Date;
    if (period === "daily")
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    else if (period === "weekly")
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    else startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const checks = await Check.find({
      monitorId: { $in: monitorIds },
      createdAt: { $gte: startDate },
    });

    const totalChecks = checks.length;
    const upChecks = checks.filter((c) => c.success).length;
    const uptimePercentage =
      totalChecks > 0 ? (upChecks / totalChecks) * 100 : 0;

    const avgResponseTime =
      checks.length > 0
        ? checks.reduce((sum, c) => sum + (c.responseTimeMs || 0), 0) /
          checks.length
        : 0;

    res.status(200).json({
      msg: "Global uptime fetched successfully",
      success: true,
      uptime: {
        period,
        uptimePercentage: Math.round(uptimePercentage * 100) / 100,
        avgResponseTime: Math.round(avgResponseTime),
        totalChecks,
        upChecks,
      },
    });
  } catch (error) {
    console.error("Error fetching global uptime:", error);
    res.status(500).json({ msg: "Internal server error", success: false });
  }
};

// GET /api/alerts - Lists recent alerts for the user
export const getAlerts = async (req: Request, res: Response) => {
  try {
    const userId = req.user;
    const { page = 1, limit = 10 } = req.query;

    if (!userId) {
      return res
        .status(401)
        .json({ msg: "User not authenticated", success: false });
    }

    // Convert to numbers for pagination
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;

    const monitors = await Monitor.find({ userId }).select("_id");
    const monitorIds = monitors.map((m) => m._id);

    // Derive alerts from incidents or failed checks (adjust based on your alert logic)
    const alerts = await Incident.find({
      monitorId: { $in: monitorIds },
      status: "open", // Or recent failed checks
    })
      .populate("monitorId", "name url")
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Incident.countDocuments({
      monitorId: { $in: monitorIds },
      status: "open",
    });

    res.status(200).json({
      msg: "Alerts fetched successfully",
      success: true,
      alerts,
      pagination: { page: pageNum, limit: limitNum, total },
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({ msg: "Internal server error", success: false });
  }
};
