import jwt from "jsonwebtoken";
import User from "../models/User.js";

const accessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "15m" });

const refreshToken = (id) =>
  jwt.sign({ id }, process.env.REFRESH_SECRET, { expiresIn: process.env.REFRESH_EXPIRE || "7d" });

export const registerUser = async ({ name, email, password, role }) => {
  const exists = await User.findOne({ email });
  if (exists) {
    const e = new Error("Email already exists");
    e.statusCode = 409;
    throw e;
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || "USER",
    verificationStatus: role === "ORGANIZER" ? "PENDING" : "VERIFIED",
  });

  return user;
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    const e = new Error("Invalid credentials");
    e.statusCode = 401;
    throw e;
  }

  if (user.status !== "ACTIVE") {
    const e = new Error("Account not active");
    e.statusCode = 403;
    throw e;
  }

  const ok = await user.matchPassword(password);
  if (!ok) {
    const e = new Error("Invalid credentials");
    e.statusCode = 401;
    throw e;
  }

  const at = accessToken(user._id);
  const rt = refreshToken(user._id);

  user.refreshToken = rt;
  await user.save();

  return { user, at, rt };
};

export const refreshAccessToken = async (refreshTok) => {
  const decoded = jwt.verify(refreshTok, process.env.REFRESH_SECRET);
  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== refreshTok) {
    const e = new Error("Invalid refresh token");
    e.statusCode = 401;
    throw e;
  }

  if (user.status !== "ACTIVE") {
    const e = new Error("Account not active");
    e.statusCode = 403;
    throw e;
  }

  return { at: accessToken(user._id) };
};

export const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: "" });
};
