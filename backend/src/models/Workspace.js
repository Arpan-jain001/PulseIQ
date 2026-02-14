import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["ACTIVE", "SUSPENDED"], default: "ACTIVE" },
  },
  { timestamps: true }
);

export default mongoose.model("Workspace", workspaceSchema);
