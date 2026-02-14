import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    name: { type: String, required: true, trim: true },
    apiKeyHash: { type: String, required: true },
    allowedDomains: [{ type: String, trim: true }],
    status: { type: String, enum: ["ACTIVE", "DISABLED"], default: "ACTIVE" },
  },
  { timestamps: true }
);

projectSchema.index({ workspaceId: 1, createdAt: -1 });

export default mongoose.model("Project", projectSchema);
