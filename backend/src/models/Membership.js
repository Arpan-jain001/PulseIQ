import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["OWNER", "ADMIN", "MEMBER", "VIEWER"], default: "MEMBER" },
    status: { type: String, enum: ["ACTIVE", "REMOVED"], default: "ACTIVE" },
  },
  { timestamps: true }
);

membershipSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Membership", membershipSchema);
