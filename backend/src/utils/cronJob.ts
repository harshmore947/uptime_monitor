import axios from "axios";
import cron from "node-cron";
import { Monitor } from "../model/monitor-model";
import { Check } from "../model/check-model";
import { triggerAlerts } from "./alerts";
import { io } from "../index";

export const performCheck = async (monitor: any) => {
  const startTime = Date.now();
  const previousStatus = monitor.status;

  try {
    const response = await axios.request({
      url: monitor.url,
      method: monitor.method || "GET",
      timeout: monitor.timeoutSeconds * 1000,
      headers: {
        "User-Agent": "UptimeMonitor/1.0 (https://github.com/your-repo)",
        ...monitor.customHeaders.reduce((acc: any, header: any) => {
          acc[header.key] = header.value;
          return acc;
        }, {}),
      },
      maxRedirects: 5,
      validateStatus: function (status) {
        return status < 400; // Accept any status code below 400
      },
    });

    const responseTime = Date.now() - startTime;
    const success = response.status === monitor.expectedStatusCode;

    // Store check result
    const check = new Check({
      monitorId: monitor._id,
      success,
      responseTimeMs: responseTime,
      statusCode: response.status,
      responseHeaders: response.headers,
      location: {
        name: "Primary Server",
        region: process.env.MONITORING_REGION || "us-east-1",
        city: process.env.MONITORING_CITY || "Unknown",
        country: process.env.MONITORING_COUNTRY || "Unknown",
        coordinates: {
          latitude: parseFloat(process.env.MONITORING_LATITUDE || "0"),
          longitude: parseFloat(process.env.MONITORING_LONGITUDE || "0"),
        },
      },
    });
    await check.save();

    //check if status matched expected
    if (success) {
      monitor.status = "up";
      // Reset downtime if was down
      if (monitor.lastDowntimeAt) {
        monitor.totalDowntime += Math.floor(
          (Date.now() - monitor.lastDowntimeAt.getTime()) / 60000
        );
        monitor.lastDowntimeAt = null;
      }
    } else {
      monitor.status = "down";
      if (!monitor.lastDowntimeAt) {
        monitor.lastDowntimeAt = new Date();
      }
    }

    //update last check time
    monitor.lastCheckAt = new Date();

    // Trigger alerts if status changed
    if (previousStatus !== monitor.status) {
      await triggerAlerts(monitor, {
        monitorName: monitor.name,
        url: monitor.url,
        status: monitor.status,
        responseTime,
      });
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;

    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
      // Handle specific error types
      if (error.message.includes("timeout")) {
        errorMessage = `Request timeout after ${monitor.timeoutSeconds} seconds`;
      } else if (error.message.includes("ENOTFOUND")) {
        errorMessage = "DNS resolution failed - domain not found";
      } else if (error.message.includes("ECONNREFUSED")) {
        errorMessage = "Connection refused - service may be down";
      } else if (error.message.includes("CERT_HAS_EXPIRED")) {
        errorMessage = "SSL certificate has expired";
      }
    }

    // Store failed check result
    const check = new Check({
      monitorId: monitor._id,
      success: false,
      responseTimeMs: responseTime,
      errorMessage,
      location: {
        name: "Primary Server",
        region: process.env.MONITORING_REGION || "us-east-1",
        city: process.env.MONITORING_CITY || "Unknown",
        country: process.env.MONITORING_COUNTRY || "Unknown",
        coordinates: {
          latitude: parseFloat(process.env.MONITORING_LATITUDE || "0"),
          longitude: parseFloat(process.env.MONITORING_LONGITUDE || "0"),
        },
      },
    });
    await check.save();

    monitor.status = "down";
    monitor.lastCheckAt = new Date();
    if (!monitor.lastDowntimeAt) {
      monitor.lastDowntimeAt = new Date();
    }

    // Trigger alerts if status changed
    if (previousStatus !== monitor.status) {
      await triggerAlerts(monitor, {
        monitorName: monitor.name,
        url: monitor.url,
        status: monitor.status,
        responseTime,
        errorMessage: errorMessage,
      });

      // Emit real-time update via Socket.io
      io.to(`user_${monitor.userId}`).emit("monitor-status-change", {
        monitorId: monitor._id,
        monitorName: monitor.name,
        status: monitor.status,
        previousStatus,
        responseTime,
        timestamp: new Date(),
      });

      io.to(`monitor_${monitor._id}`).emit("status-update", {
        status: monitor.status,
        responseTime,
        timestamp: new Date(),
      });
    }

    //log error or send alert here
    if (error instanceof Error) {
      console.error(`Check failed for ${monitor.url}: `, error.message);
    } else {
      console.error(`Check failed for ${monitor.url}: `, error);
    }
  }
  await monitor.save();
};

//main scheduler function
export const startUptimeScheduler = () => {
  //run every minute
  cron.schedule("* * * * *", async () => {
    console.log("Running uptime checks:", new Date());

    try {
      //fecth all the monitors not paused
      const monitors = await Monitor.find({
        isActive: true,
        status: { $ne: "paused" },
      });

      for (const monitor of monitors) {
        const now = Date.now();
        const lastCheck = monitor.lastCheckAt
          ? monitor.lastCheckAt.getTime()
          : 0;
        const intervalMs = monitor.intervalSeconds * 1000;

        //check if its time for this monitor
        if (now >= lastCheck + intervalMs) {
          await performCheck(monitor);
        }
      }
    } catch (error) {
      console.error("Scheduler error:", error);
    }
  });
};

startUptimeScheduler();
