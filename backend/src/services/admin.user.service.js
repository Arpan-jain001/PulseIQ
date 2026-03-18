import User from "../models/User.js";

/* ===== LIST USERS ===== */

export const getAllUsers = async () => {
  return User.find()
    .select("-password -refreshToken")
    .sort({ createdAt: -1 });
};

/* ===== UPDATE STATUS ===== */

export const updateUserStatus = async (userId, status) => {
  return User.findByIdAndUpdate(
    userId,
    { status },
    { new: true }
  ).select("-password -refreshToken");
};

/* ===== VERIFY USER ===== */

export const verifyUser = async (userId, verificationStatus) => {
  return User.findByIdAndUpdate(
    userId,
    { verificationStatus },
    { new: true }
  ).select("-password -refreshToken");
};