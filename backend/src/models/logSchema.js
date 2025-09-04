import mongoose from "mongoose";

const Log = new mongoose.Schema(
  {
    level: {
      type: String,
      enum: ["fatal", "error", "warn", "info", "audit"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },

    // Optional fields for structured logging
    requestId: { type: String },
    method: { type: String },
    endpoint: { type: String },
    statusCode: { type: Number },
    duration: { type: Number },
    userId: { type: String },
    action: { type: String },

    // To handle any extra metadata dynamically
    meta: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { strict: false } // allows saving extra fields without defining them
);

const logSchema = mongoose.model("Log", Log);

export default logSchema;