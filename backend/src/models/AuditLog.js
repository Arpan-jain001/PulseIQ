import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    targetType: { type: String, required: true }, // USER/WORKSPACE/PROJECT
    targetId: { type: mongoose.Schema.Types.ObjectId },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

export default mongoose.model("AuditLog", auditLogSchema);
