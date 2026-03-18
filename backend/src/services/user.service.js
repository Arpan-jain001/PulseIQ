import User from "../models/User.js";

export const getUserById = async (id) => {
  return User.findById(id).select("-password -refreshToken");
};

export const updateUserProfile = async (id, data) => {
  return User.findByIdAndUpdate(id, data, {
    new: true,
  }).select("-password -refreshToken");
};

export const getAllUsers = async () => {
  return User.find().select("-password -refreshToken");
};