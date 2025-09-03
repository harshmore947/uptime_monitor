import mongoose,{Schema} from "mongoose";

const statusPageSchema = new Schema(
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
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    customization: {
      primaryColor: { type: String, default: "#3B82F6" },
      logo: { type: String, default: "" },
      favicon: { type: String, default: "" },
      customCSS: { type: String, default: "" },
    },
    customDomain: {
      type: String,
      trim: true,
      lowercase: true,
    },
    monitors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Monitor",
      },
    ],
    showMetrics: {
      uptime: { type: Boolean, default: true },
      responseTime: { type: Boolean, default: true },
      incidentHistory: { type: Boolean, default: true },
    },
    contactInfo: {
      email: String,
      twitter: String,
      website: String,
    },
  },
  {
    timestamps:true
  }
);

export const StatusPage = mongoose.model("StatusPage",statusPageSchema);