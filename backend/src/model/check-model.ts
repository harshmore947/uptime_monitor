import mongoose, { Schema } from "mongoose";

const checkSchema = new Schema(
  {
    monitorId: {
      type: Schema.Types.ObjectId,
      ref: "Monitor",
      required: true,
    },
    success: {
      type: Boolean,
      required: true,
    },
    responseTimeMs: {
      type: Number,
      required: true,
      min: 0,
    },
    statusCode: {
      type: Number,
      min: 100,
      max: 599,
      required: false,
    },
    errorMessage: {
      type: String,
      trim: true,
    },
    checkedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    location: {
      name: {
        type: String,
        default: "Primary Server",
      },
      region: {
        type: String,
        default: "us-east-1",
        enum: [
          "us-east-1", // N. Virginia
          "us-west-1", // N. California
          "us-west-2", // Oregon
          "eu-west-1", // Ireland
          "eu-central-1", // Frankfurt
          "ap-southeast-1", // Singapore
          "ap-northeast-1", // Tokyo
          "sa-east-1", // São Paulo
        ],
      },
      city: {
        type: String,
        default: "Unknown",
      },
      country: {
        type: String,
        default: "Unknown",
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    responseHeaders: {
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: "checkedAt", updatedAt: false },
  }
);

checkSchema.pre("save", function (next) {
  if (this.responseHeaders) {
    for (const [key, value] of this.responseHeaders) {
      if (Array.isArray(value)) {
        // Convert arrays to comma-separated strings for headers like set-cookie
        this.responseHeaders.set(key, value.join(", "));
      }
    }
  }
  next();
});

export const Check = mongoose.model("Check", checkSchema);
