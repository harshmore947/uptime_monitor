import axios from "axios";
import nodemailer from "nodemailer";
import { User } from "../model/user-model";
import { Monitor } from "../model/monitor-model";
import cron from "node-cron";

interface AlertData {
  monitorName: string;
  url: string;
  status: string;
  responseTime?: number;
  errorMessage?: string;
  escalationLevel?: number;
  downtimeDuration?: number;
}

interface EscalationRule {
  level: number;
  delayMinutes: number;
  channels: string[];
  message: string;
}

// Default escalation rules
const DEFAULT_ESCALATION_RULES: EscalationRule[] = [
  {
    level: 1,
    delayMinutes: 0, // Immediate
    channels: ["email", "slack"],
    message: "🚨 Service is DOWN",
  },
  {
    level: 2,
    delayMinutes: 15,
    channels: ["email", "slack", "discord"],
    message: "🚨 URGENT: Service still DOWN after 15 minutes",
  },
  {
    level: 3,
    delayMinutes: 60,
    channels: ["email", "slack", "discord"],
    message: "🚨 CRITICAL: Service DOWN for over 1 hour",
  },
  {
    level: 4,
    delayMinutes: 240, // 4 hours
    channels: ["email", "slack", "discord"],
    message: "🚨 EMERGENCY: Service DOWN for over 4 hours",
  },
];

// Store active escalation timers
const activeEscalations = new Map<string, NodeJS.Timeout>();

export const startEscalationMonitoring = () => {
  // Check for monitors that need escalation every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    try {
      const monitors = await Monitor.find({
        status: "down",
        isActive: true,
      });

      for (const monitor of monitors) {
        if (monitor.lastDowntimeAt) {
          const downtimeMinutes = Math.floor(
            (Date.now() - monitor.lastDowntimeAt.getTime()) / (1000 * 60)
          );

          // Check each escalation level
          for (const rule of DEFAULT_ESCALATION_RULES) {
            if (downtimeMinutes >= rule.delayMinutes) {
              const escalationKey = `${monitor._id}_${rule.level}`;

              // Only send if we haven't sent this level yet
              if (!activeEscalations.has(escalationKey)) {
                await sendEscalationAlert(monitor, rule, downtimeMinutes);
                activeEscalations.set(
                  escalationKey,
                  setTimeout(() => {
                    activeEscalations.delete(escalationKey);
                  }, 24 * 60 * 60 * 1000)
                ); // Clean up after 24 hours
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Escalation monitoring error:", error);
    }
  });
};

const sendEscalationAlert = async (
  monitor: any,
  rule: EscalationRule,
  downtimeMinutes: number
) => {
  try {
    const user = await User.findById(monitor.userId);
    if (!user) return;

    const alertData: AlertData = {
      monitorName: monitor.name,
      url: monitor.url,
      status: "down",
      escalationLevel: rule.level,
      downtimeDuration: downtimeMinutes,
      errorMessage: `Service has been down for ${downtimeMinutes} minutes`,
    };

    // Send alerts based on configured channels
    if (
      rule.channels.includes("email") &&
      monitor.alertSettings.email &&
      user.email
    ) {
      await sendEmailAlert(user.email, {
        ...alertData,
        status: `${rule.message} (${downtimeMinutes}min downtime)`,
      });
    }

    if (rule.channels.includes("slack") && monitor.alertSettings.slackWebhook) {
      await sendSlackAlert(monitor.alertSettings.slackWebhook, {
        ...alertData,
        status: `${rule.message} (${downtimeMinutes}min downtime)`,
      });
    }

    if (
      rule.channels.includes("discord") &&
      monitor.alertSettings.discordWebhook
    ) {
      await sendDiscordAlert(monitor.alertSettings.discordWebhook, {
        ...alertData,
        status: `${rule.message} (${downtimeMinutes}min downtime)`,
      });
    }

    console.log(
      `📈 Escalation Level ${rule.level} alert sent for ${monitor.name}`
    );
  } catch (error) {
    console.error("Failed to send escalation alert:", error);
  }
};

// Clear escalation timers when monitor comes back up
export const clearEscalationTimers = (monitorId: string) => {
  for (const [key, timer] of activeEscalations.entries()) {
    if (key.startsWith(`${monitorId}_`)) {
      clearTimeout(timer);
      activeEscalations.delete(key);
    }
  }
};

export const sendEmailAlert = async (email: string, data: AlertData) => {
  try {
    // Create transporter based on environment configuration
    let transporter;

    if (process.env.EMAIL_SERVICE === "sendgrid") {
      // SendGrid configuration
      transporter = nodemailer.createTransport({
        host: "smtp.sendgrid.net",
        port: 587,
        secure: false,
        auth: {
          user: "apikey",
          pass: process.env.SENDGRID_API_KEY,
        },
      });
    } else if (process.env.EMAIL_SERVICE === "mailgun") {
      // Mailgun configuration
      transporter = nodemailer.createTransport({
        host: "smtp.mailgun.org",
        port: 587,
        secure: false,
        auth: {
          user: `postmaster@${process.env.MAILGUN_DOMAIN}`,
          pass: process.env.MAILGUN_API_KEY,
        },
      });
    } else {
      // Default SMTP configuration
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }

    // Email content based on status
    const subject =
      data.status === "down"
        ? `🚨 ALERT: ${data.monitorName} is DOWN`
        : `✅ RECOVERY: ${data.monitorName} is back UP`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${
          data.status === "down" ? "#fee2e2" : "#d1fae5"
        }; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: ${
            data.status === "down" ? "#dc2626" : "#059669"
          }; margin: 0;">
            ${
              data.status === "down"
                ? "🚨 Service Down Alert"
                : "✅ Service Recovery"
            }
          </h2>
        </div>

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid ${
          data.status === "down" ? "#dc2626" : "#059669"
        };">
          <h3 style="margin-top: 0; color: #1f2937;">Monitor Details</h3>
          <p><strong>Service:</strong> ${data.monitorName}</p>
          <p><strong>URL:</strong> <a href="${
            data.url
          }" style="color: #3b82f6;">${data.url}</a></p>
          <p><strong>Status:</strong> <span style="color: ${
            data.status === "down" ? "#dc2626" : "#059669"
          }; font-weight: bold;">${data.status.toUpperCase()}</span></p>
          ${
            data.responseTime
              ? `<p><strong>Response Time:</strong> ${data.responseTime}ms</p>`
              : ""
          }
          ${
            data.errorMessage
              ? `<p><strong>Error:</strong> ${data.errorMessage}</p>`
              : ""
          }
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <div style="margin-top: 20px; padding: 15px; background: #e5e7eb; border-radius: 6px;">
          <p style="margin: 0; font-size: 14px; color: #6b7280;">
            This is an automated alert from your Uptime Monitor.
            <br>
            <a href="${
              process.env.FRONTEND_URL || "http://localhost:5174"
            }" style="color: #3b82f6;">View Dashboard</a>
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@uptimemonitor.com",
      to: email,
      subject: subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(
      `✅ Email alert sent to ${email} for ${data.monitorName}: ${data.status}`
    );
  } catch (error) {
    console.error("❌ Failed to send email alert:", error);
    throw error;
  }
};

export const sendSlackAlert = async (webhookUrl: string, data: AlertData) => {
  if (!webhookUrl) return;

  try {
    const message = {
      text: `🚨 Monitor Alert: ${data.monitorName}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Monitor:* ${data.monitorName}\n*URL:* ${
              data.url
            }\n*Status:* ${data.status}\n*Response Time:* ${
              data.responseTime || "N/A"
            }ms`,
          },
        },
      ],
    };

    await axios.post(webhookUrl, message);
    console.log(`Slack alert sent for ${data.monitorName}`);
  } catch (error) {
    console.error("Failed to send Slack alert:", error);
  }
};

export const sendDiscordAlert = async (webhookUrl: string, data: AlertData) => {
  if (!webhookUrl) return;

  try {
    const message = {
      content: `🚨 **Monitor Alert: ${data.monitorName}**`,
      embeds: [
        {
          title: data.monitorName,
          url: data.url,
          color: data.status === "down" ? 0xff0000 : 0x00ff00,
          fields: [
            { name: "Status", value: data.status, inline: true },
            {
              name: "Response Time",
              value: `${data.responseTime || "N/A"}ms`,
              inline: true,
            },
            {
              name: "Error",
              value: data.errorMessage || "None",
              inline: false,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    };

    await axios.post(webhookUrl, message);
    console.log(`Discord alert sent for ${data.monitorName}`);
  } catch (error) {
    console.error("Failed to send Discord alert:", error);
  }
};

export const triggerAlerts = async (monitor: any, alertData: AlertData) => {
  if (!monitor.alertSettings.enabled) return;

  try {
    // Get user email for email alerts
    const user = await User.findById(monitor.userId);
    if (!user) {
      console.error("User not found for monitor:", monitor._id);
      return;
    }

    // If monitor is back up, clear escalation timers
    if (alertData.status === "up") {
      clearEscalationTimers(monitor._id.toString());
    }

    // Send email alert
    if (monitor.alertSettings.email && user.email) {
      try {
        await sendEmailAlert(user.email, alertData);
      } catch (emailError) {
        console.error("Failed to send email alert:", emailError);
      }
    }

    // Send Slack alert
    if (monitor.alertSettings.slackWebhook) {
      await sendSlackAlert(monitor.alertSettings.slackWebhook, alertData);
    }

    // Send Discord alert
    if (monitor.alertSettings.discordWebhook) {
      await sendDiscordAlert(monitor.alertSettings.discordWebhook, alertData);
    }
  } catch (error) {
    console.error("Error triggering alerts:", error);
  }
};
