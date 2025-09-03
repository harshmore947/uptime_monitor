import type { Request, Response } from "express";
import { Monitor } from "../model/monitor-model";
import { Check } from "../model/check-model";
import axios from "axios";
import { User } from "../model/user-model";
import { performCheck, startUptimeScheduler } from "../utils/cronJob";

export const fetchMonitors = async (req: Request, res: Response) => {
  try {
    //return user id from middleware
    const userId = req.user;
    if (!userId) {
      return res.status(403).json({ msg: "not authenticated", success: false });
    }

    const { page = 1, limit = 10, status } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const query: any = { userId };
    if (status) query.status = status;

    const monitors = await Monitor.find(query)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Monitor.countDocuments(query);

    res.status(200).json({
      msg: "Monitors fetched successfully",
      monitors,
      success: true,
      pagination: { page: pageNum, limit: limitNum, total },
    });
  } catch (error) {
    return res.status(500).json({ msg: "error", error });
  }
};

export const fetchMonitorsById = async (req: Request, res: Response) => {
  try {
    const monitorId = req.params.id;
    const userId = req.user;

    if (!userId) {
      return res.status(401).json({ msg: "userId required", succes: false });
    }

    //fecth monitor and ensure it belongs to the user
    const monitorData = await Monitor.findOne({ _id: monitorId, userId });
    if (!monitorData) {
      return res
        .status(404)
        .json({ msg: "Monitor not found or access denied", success: false });
    }

    //return deatiled Monitor info (and populate for related data if needed)
    res.status(200).json({
      msg: "Monitor fetched successfully",
      success: true,
      monitor: monitorData,
    });
  } catch (error) {
    console.error("Error fecthing the Monitor Data", error); // Log for debugging
    res.status(500).json({ msg: "Internal server error", success: false });
  }
};

export const createMonitor = async (req: Request, res: Response) => {
  try {
    const {
      name,
      url,
      intervalSeconds,
      method,
      timeoutSeconds,
      customHeaders,
      expectedStatusCode,
    } = req.body;
    const userId = req.user;

    //valdiate URL format
    try {
      new URL(url);
    } catch (error) {
      return res
        .status(400)
        .json({ msg: "invalid URL format", success: false });
    }

    //check URL accessibility (using get as default; adjust for other methods if needed)
    try {
      const response = await axios.request({
        url,
        method: method || "GET",
        timeout: 5000, //5-seconds timeout
      });
    } catch (error) {
      return res
        .status(400)
        .json({ msg: "URL not accessible", success: false });
    }

    //check existing URL in the users account
    const existingUrl = await Monitor.findOne({ url: url, userId });
    if (existingUrl) {
      return res
        .status(401)
        .json({ msg: "url already exist please check", success: false });
    }

    //creating new monitor
    const newMonitor = new Monitor({
      userId,
      name,
      url,
      intervalSeconds,
      method,
      timeoutSeconds,
      customHeaders,
      expectedStatusCode,
    });

    await newMonitor.save();

    //immediately schedule first monitor check
    await performCheck(newMonitor);

    return res.status(201).json({ msg: "monitor created successfully" });
  } catch (error) {
    return res.status(500).json({ msg: "error while creating the monitor" });
  }
};

export const updateMonitor = async (req: Request, res: Response) => {
  try {
    const monitorId = req.params.id;
    const userId = req.user;
    const updates = req.body;

    if (!userId) {
      return res
        .status(401)
        .json({ msg: "User not authenticated", success: false });
    }

    //find and ensure ownership
    const monitor = await Monitor.findOne({ _id: monitorId, userId });
    if (!monitor) {
      return res
        .status(404)
        .json({ msg: "Monitor not found or access denied", success: false });
    }

    //valdiate URL if provided
    if (updates.url) {
      try {
        new URL(updates.url);
        const response = await axios.request({
          url: updates.url,
          method: updates.method || monitor.method || "GET",
          timeout: 5000,
        });
      } catch (error) {
        return res
          .status(400)
          .json({ msg: "URL not accessible", success: false });
      }
    }

    //update monitor
    Object.assign(monitor, updates);
    await monitor.save();

    //Reschdeule jobs if interval changed  (implement scheduling logic here)
    if (
      updates.intervalSeconds &&
      updates.intervalSeconds !== monitor.intervalSeconds
    ) {
      //cancel old job and schedule a new one
    }

    if (updates.url || updates.method || updates.timeoutSeconds) {
      await performCheck(monitor);
    }

    res
      .status(200)
      .json({ msg: "Monitor updated successfully", success: true, monitor });
  } catch (error) {
    console.error("Error updating monitor:", error);
    res.status(500).json({ msg: "Internal server error", success: false });
  }
};

export const deleteMonitor = async (req: Request, res: Response) => {
  try {
    const monitorId = req.params.id;
    const userId = req.user;

    if (!userId) {
      return res
        .status(401)
        .json({ msg: "user not authenticated", success: false });
    }

    //find and ensure the ownership
    const monitor = await Monitor.findOne({ _id: monitorId, userId });
    if (!monitor) {
      return res
        .status(404)
        .json({ msg: "Monitor not found or access denied", success: false });
    }

    // Remove associated check history (assume Check model exists; replace with actual)
    // await Check.deleteMany({ monitorId });

    // Cancel scheduled jobs (implement scheduling logic here)

    // Delete monitor
    await Monitor.deleteOne({ _id: monitorId });

    res
      .status(200)
      .json({ msg: "Monitor deleted successfully", success: true });
  } catch (error) {
    console.error("Error deleting monitor", error);
    res.status(500).json({ msg: "Internal server error", success: false });
  }
};

export const pauseMonitor = async (req: Request, res: Response) => {
  try {
    const monitorId = req.params.id;
    const userId = req.user;

    if (!userId) {
      return res
        .status(401)
        .json({ msg: "User not authenticated", success: false });
    }

    // Find and ensure ownership
    const monitor = await Monitor.findOne({ _id: monitorId, userId });
    if (!monitor) {
      return res
        .status(404)
        .json({ msg: "Monitor not found or access denied", success: false });
    }

    // Update status to paused
    monitor.status = "paused";
    await monitor.save();

    // Cancel scheduled checks (implement scheduling logic here)

    res.status(200).json({ msg: "Monitor paused successfully", success: true });
  } catch (error) {
    console.error("Error pausing monitor:", error);
    res.status(500).json({ msg: "Internal server error", success: false });
  }
};

export const resumeMonitor = async (req: Request, res: Response) => {
  try {
    const monitorId = req.params.id;
    const userId = req.user;

    if (!userId) {
      return res
        .status(401)
        .json({ msg: "User not authenticated", success: false });
    }

    // Find and ensure ownership
    const monitor = await Monitor.findOne({ _id: monitorId, userId });
    if (!monitor) {
      return res
        .status(404)
        .json({ msg: "Monitor not found or access denied", success: false });
    }

    // Update status to active (or "up" based on last check)
    monitor.status = "up"; // Or "pending" if no recent check
    await monitor.save();

    // Reschedule checks (implement scheduling logic here)
    // Perform immediate health check (implement check logic here)
    await performCheck(monitor);

    res
      .status(200)
      .json({ msg: "Monitor resumed successfully", success: true });
  } catch (error) {
    console.error("Error resuming monitor:", error);
    res.status(500).json({ msg: "Internal server error", success: false });
  }
};

export const getMonitorChecks = async (req: Request, res: Response) => {
  try {
    const monitorId = req.params.id;
    const userId = req.user;
    const { startDate, endDate, page = 1, limit = 10 } = req.query;

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

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;

    // Build query
    const query: any = { monitorId };
    if (startDate) query.checkedAt = { $gte: new Date(startDate as string) };
    if (endDate)
      query.checkedAt = {
        ...query.checkedAt,
        $lte: new Date(endDate as string),
      };

    // Fetch check history
    const checks = await Check.find(query)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ checkedAt: -1 });

    const total = await Check.countDocuments(query);

    res.status(200).json({
      msg: "Check history fetched",
      success: true,
      checks,
      pagination: { page: pageNum, limit: limitNum, total },
    });
  } catch (error) {
    console.error("Error fetching checks:", error);
    res.status(500).json({ msg: "Internal server error", success: false });
  }
};

export const getMonitorUptime = async (req: Request, res: Response) => {
  try {
    const monitorId = req.params.id;
    const userId = req.user;
    const { period = "30d" } = req.query;

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

    // Aggregate checks for uptime calculation
    const checks = await Check.find({
      monitorId,
      checkedAt: { $gte: startDate },
    });

    const totalChecks = checks.length;
    const successfulChecks = checks.filter((c) => c.success).length;
    const uptimePercentage =
      totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 0;

    const avgResponseTime =
      checks.length > 0
        ? checks.reduce((sum, c) => sum + c.responseTimeMs, 0) / checks.length
        : 0;

    res.status(200).json({
      msg: "Uptime stats fetched",
      success: true,
      uptime: {
        period,
        uptimePercentage: Math.round(uptimePercentage * 100) / 100,
        avgResponseTime: Math.round(avgResponseTime),
        totalChecks,
        successfulChecks,
      },
    });
  } catch (error) {
    console.error("Error fetching uptime:", error);
    res.status(500).json({ msg: "Internal server error", success: false });
  }
};
