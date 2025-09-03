// models/Incident.js
import mongoose,{Schema} from "mongoose";

const incidentUpdateSchema = new Schema({
  status: {
    type: String,
    enum: ["investigating", "identified", "monitoring", "resolved"],
    required: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const incidentSchema = new mongoose.Schema(
  {
    statusPageId: {
      type: Schema.Types.ObjectId,
      ref: "StatusPage",
      required: true,
    },
    monitorId: {
      type: Schema.Types.ObjectId,
      ref: "Monitor",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["investigating", "identified", "monitoring", "resolved"],
      default: "investigating",
    },
    severity: {
      type: String,
      enum: ["minor", "major", "critical"],
      default: "major",
    },
    isAutoCreated: {
      type: Boolean,
      default: false,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    resolvedAt: {
      type: Date,
    },
    updates: [incidentUpdateSchema],
    affectedServices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Monitor",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Incident = mongoose.model("Incident", incidentSchema);
