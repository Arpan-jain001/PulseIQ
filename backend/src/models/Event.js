import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    eventName: { type: String, required: true, trim: true },
    anonymousId: { type: String, default: "" },
    userId: { type: String, default: "" },
    properties: { type: Object, default: {} },
    ts: { type: Date, default: Date.now },
    ip: { type: String, default: "" },
    ua: { type: String, default: "" },
  },
  { timestamps: true }
);

eventSchema.index({ projectId: 1, ts: -1 });
eventSchema.index({ projectId: 1, eventName: 1, ts: -1 });

export default mongoose.model("Event", eventSchema);
