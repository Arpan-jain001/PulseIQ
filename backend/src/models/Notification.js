import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },

    type: { type: String, enum: ["GLOBAL", "USER", "WORKSPACE"], default: "GLOBAL" },

    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    targetWorkspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" },

    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
