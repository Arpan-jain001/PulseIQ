import mongoose from "mongoose";

const verificationRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    companyName: { type: String, required: true, trim: true },
    website: { type: String, default: "" },
    notes: { type: String, default: "" },
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewNote: { type: String, default: "" },
  },
  { timestamps: true }
);

verificationRequestSchema.index({ userId: 1, status: 1 });

export default mongoose.model("VerificationRequest", verificationRequestSchema);
