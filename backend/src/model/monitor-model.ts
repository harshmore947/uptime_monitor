import mongoose, { Schema } from "mongoose";

const monitorSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    method: {
      type: String,
      enum: ["GET", "POST", "DELETE", "HEAD"],
      default: "GET",
    },
    intervalSeconds: {
      type: Number,
      default: 300, //5 min
      min: 30,
      max: 3600, //max one hrs
    },
    timeoutSeconds: {
      type: Number,
      default: 30,
      min: 5,
      max: 120,
    },
    status: {
      type: String,
      enum: ["up", "down", "paused", "pending"],
      default: "pending",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    alertSettings: {
      enabled: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      slackWebhook: { type: String, default: "" },
      discordWebhook: { type: String, default: "" },
    },
    expectedStatusCode: {
      type: Number,
      default: 200,
    },
    customHeaders: [
      {
        key: String,
        value: String,
      },
    ],
    lastCheckAt: Date,
    lastDowntimeAt: Date,
    totalDowntime: {
      type: Number,
      default: 0, // in minutes
    },
  },
  {
    timestamps: true,
  }
);

export const Monitor = mongoose.model("Monitor", monitorSchema);
