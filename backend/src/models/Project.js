// backend/src/models/Project.js — REPLACE existing file
import mongoose from "mongoose";

const GRACE_DAYS = 7; // days before verification reminder shows

const projectSchema = new mongoose.Schema(
  {
    workspaceId:    { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    name:           { type: String, required: true, trim: true },
    apiKeyHash:     { type: String, required: true },
    allowedDomains: [{ type: String, trim: true }],
    status:         { type: String, enum: ["ACTIVE", "DISABLED"], default: "ACTIVE" },

    // ── SDK Verification ──────────────────────────────────
    // false = not verified yet
    // true  = at least one event received → analytics unlocked permanently
    sdkVerified:    { type: Boolean, default: false },
    sdkVerifiedAt:  { type: Date, default: null },

    // ── Grace Period ──────────────────────────────────────
    // skippedAt = when user clicked "Skip for now"
    // grace expires 7 days after project creation
    // After grace: analytics still accessible but warning shown
    skippedVerification: { type: Boolean, default: false },
    skippedAt:           { type: Date, default: null },
  },
  { timestamps: true }
);

// Virtual: is grace period still active?
projectSchema.virtual("inGracePeriod").get(function () {
  if (this.sdkVerified) return false;
  const graceCutoff = new Date(this.createdAt);
  graceCutoff.setDate(graceCutoff.getDate() + GRACE_DAYS);
  return new Date() < graceCutoff;
});

// Virtual: days remaining in grace period
projectSchema.virtual("graceDaysLeft").get(function () {
  if (this.sdkVerified) return 0;
  const graceCutoff = new Date(this.createdAt);
  graceCutoff.setDate(graceCutoff.getDate() + GRACE_DAYS);
  const diff = graceCutoff - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

projectSchema.set("toJSON",   { virtuals: true });
projectSchema.set("toObject", { virtuals: true });

projectSchema.index({ workspaceId: 1, createdAt: -1 });

export default mongoose.model("Project", projectSchema);