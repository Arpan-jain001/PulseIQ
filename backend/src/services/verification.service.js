import VerificationRequest from "../models/VerificationRequest.js";
import User from "../models/User.js";

export const createVerificationRequest = async ({ userId, companyName, website, notes }) => {
  const existing = await VerificationRequest.findOne({ userId, status: "PENDING" });
  if (existing) return existing;

  return VerificationRequest.create({ userId, companyName, website: website || "", notes: notes || "" });
};

export const listVerificationRequests = async () => {
  return VerificationRequest.find().populate("userId", "name email role verificationStatus status").sort({ createdAt: -1 });
};

export const reviewVerification = async ({ requestId, reviewerId, status, reviewNote }) => {
  const req = await VerificationRequest.findById(requestId);
  if (!req) throw Object.assign(new Error("Request not found"), { statusCode: 404 });

  req.status = status; // APPROVED / REJECTED
  req.reviewedBy = reviewerId;
  req.reviewNote = reviewNote || "";
  await req.save();

  await User.findByIdAndUpdate(req.userId, {
    verificationStatus: status === "APPROVED" ? "VERIFIED" : "REJECTED",
  });

  return req;
};
