import User from "../models/User.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password -refreshToken");
    res.json({ success: true, data: users });
  } catch (e) {
    next(e);
  }
};