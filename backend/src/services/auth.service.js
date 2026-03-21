import jwt from "jsonwebtoken";
import User from "../models/User.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import {
  getVerificationTemplate,
  getForgotPasswordTemplate,
  getWelcomeTemplate,
  getLoginAlertTemplate,
} from "../utils/emailTemplate.js";

/* ═══════════════════════════════════════════
   TOKEN GENERATORS
═══════════════════════════════════════════ */

const generateAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "15m",
  });

const generateRefreshToken = (id) =>
  jwt.sign({ id }, process.env.REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_EXPIRE || "7d",
  });

/* ═══════════════════════════════════════════
   REGISTER
═══════════════════════════════════════════ */

export const registerUser = async ({ name, email, password, role, companyName }) => {
  const exists = await User.findOne({ email });
  if (exists) throw { statusCode: 409, message: "Email already exists" };

  const token = crypto.randomBytes(32).toString("hex");
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const user = await User.create({
    name,
    email,
    password,
    role: role || "USER",
    companyName: companyName || null,           // ✅ companyName support added
    emailVerificationToken: token,
    emailVerificationOTP: otp,
    emailVerificationExpire: Date.now() + 10 * 60 * 1000, // 10 min
  });

  const link = `${process.env.CLIENT_URL}/verify-email/${token}`;

  await sendEmail({
    to: email,
    subject: "Verify Your PulseIQ Email",
    html: getVerificationTemplate({ name: user.name, email: user.email, otp, link }),
  });

  return user;
};

/* ═══════════════════════════════════════════
   LOGIN
═══════════════════════════════════════════ */

export const loginUser = async ({ email, password, role }) => {
  // ✅ FIX: .select("+refreshToken") — refreshToken has select:false in schema
  const user = await User.findOne({ email }).select("+refreshToken");

  if (!user) throw { statusCode: 401, message: "Invalid credentials" };

  // Role check first
  if (!role || user.role !== role) {
    throw { statusCode: 403, message: "Your role is not correct for this account" };
  }

  // Password check
  const isMatch = await user.matchPassword(password);
  if (!isMatch) throw { statusCode: 401, message: "Invalid credentials" };

  // Email verify (SUPER_ADMIN skip karo)
  if (user.role !== "SUPER_ADMIN" && !user.emailVerified) {
    throw { statusCode: 403, message: "EMAIL_NOT_VERIFIED" };
  }

  // Status check
  if (user.status !== "ACTIVE") {
    throw { statusCode: 403, message: "Account is suspended or banned. Contact support." };
  }

  // Organizer approval check
  if (user.role === "ORGANIZER" && user.verificationStatus !== "VERIFIED") {
    throw {
      statusCode: 403,
      message: "Organizer account not approved yet. Please wait for admin review.",
    };
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // ✅ Login alert email — non-blocking (don't crash login if email fails)
  if (!user.lastLoginAt || Date.now() - user.lastLoginAt > 5 * 60 * 1000) {
    try {
      await sendEmail({
        to: user.email,
        subject: "New Login Detected 🔐 — PulseIQ",
        html: getLoginAlertTemplate({
          name: user.name,
          email: user.email,
          time: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        }),
      });
    } catch (_) {
      // Silently ignore — don't block login
    }
  }

  user.refreshToken = refreshToken;
  user.lastLoginAt = Date.now();
  await user.save();

  return { user, accessToken, refreshToken };
};

/* ═══════════════════════════════════════════
   GOOGLE LOGIN
   ✅ FIXED: Accepts object instead of raw token.
   Token exchange + verification is done in auth.routes.js
   This function only handles DB find/create logic.
═══════════════════════════════════════════ */

export const googleLogin = async ({ googleId, email, name, avatar, emailVerified }) => {
  // Find by googleId OR email (handles existing users who signup via Google)
  let user = await User.findOne({ $or: [{ googleId }, { email }] }).select("+refreshToken");

  if (!user) {
    // New Google user — auto-verified, no password needed
    user = await User.create({
      name,
      email,
      googleId,
      avatar,
      role: "USER",
      emailVerified: emailVerified !== false, // true unless explicitly false
      verificationStatus: "VERIFIED",
      status: "ACTIVE",
    });

    // Welcome email — non-blocking
    try {
      await sendEmail({
        to: email,
        subject: "Welcome to PulseIQ! 🚀",
        html: getWelcomeTemplate({ name }),
      });
    } catch (_) {}
  } else {
    // Update missing Google info on existing user
    let changed = false;
    if (!user.googleId) { user.googleId = googleId; changed = true; }
    if (!user.avatar && avatar) { user.avatar = avatar; changed = true; }
    if (!user.emailVerified) { user.emailVerified = true; changed = true; }
    // Don't save yet — will save after setting refreshToken below
  }

  if (user.status !== "ACTIVE") {
    throw { statusCode: 403, message: "Account is suspended. Contact support." };
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  user.lastLoginAt = Date.now();
  await user.save();

  return { user, accessToken, refreshToken };
};

/* ═══════════════════════════════════════════
   VERIFY EMAIL — LINK
═══════════════════════════════════════════ */

export const verifyEmailByLink = async (token) => {
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) throw { statusCode: 400, message: "Invalid or expired verification link" };

  user.emailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationOTP = null;
  user.emailVerificationExpire = null;
  await user.save();
};

/* ═══════════════════════════════════════════
   VERIFY EMAIL — OTP
═══════════════════════════════════════════ */

export const verifyEmailByOTP = async (email, otp) => {
  const user = await User.findOne({
    email,
    emailVerificationOTP: otp,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) throw { statusCode: 400, message: "Invalid or expired OTP" };

  user.emailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationOTP = null;
  user.emailVerificationExpire = null;
  await user.save();
};

/* ═══════════════════════════════════════════
   RESEND VERIFICATION
═══════════════════════════════════════════ */

export const resendVerification = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw { statusCode: 404, message: "User not found" };
  if (user.emailVerified) throw { statusCode: 400, message: "Email is already verified" };

  const token = crypto.randomBytes(32).toString("hex");
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.emailVerificationToken = token;
  user.emailVerificationOTP = otp;
  user.emailVerificationExpire = Date.now() + 10 * 60 * 1000;
  await user.save();

  const link = `${process.env.CLIENT_URL}/verify-email/${token}`;

  await sendEmail({
    to: email,
    subject: "Resend: Verify Your PulseIQ Email",
    html: getVerificationTemplate({ name: user.name, email: user.email, otp, link }),
  });
};

/* ═══════════════════════════════════════════
   FORGOT PASSWORD
═══════════════════════════════════════════ */

export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw { statusCode: 404, message: "No account found with this email" };

  const token = crypto.randomBytes(32).toString("hex");
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.resetPasswordToken = token;
  user.resetPasswordOTP = otp;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min
  await user.save();

  const link = `${process.env.CLIENT_URL}/reset-password/${token}`;

  await sendEmail({
    to: user.email,
    subject: "Reset Your PulseIQ Password 🔐",
    html: getForgotPasswordTemplate({ name: user.name, email: user.email, otp, link }),
  });
};

/* ═══════════════════════════════════════════
   RESET PASSWORD — LINK
═══════════════════════════════════════════ */

export const resetPassword = async (token, password) => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) throw { statusCode: 400, message: "Invalid or expired reset link" };

  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordOTP = null;
  user.resetPasswordExpire = null;
  await user.save();
};

/* ═══════════════════════════════════════════
   RESET PASSWORD — OTP
═══════════════════════════════════════════ */

export const resetPasswordByOTP = async (email, otp, password) => {
  const user = await User.findOne({
    email,
    resetPasswordOTP: otp,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) throw { statusCode: 400, message: "Invalid or expired OTP" };

  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordOTP = null;
  user.resetPasswordExpire = null;
  await user.save();
};

/* ═══════════════════════════════════════════
   LOGOUT
═══════════════════════════════════════════ */

export const logoutUser = async (id) => {
  await User.findByIdAndUpdate(id, { refreshToken: "" });
};

/* ═══════════════════════════════════════════
   REFRESH ACCESS TOKEN
═══════════════════════════════════════════ */

export const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) throw { statusCode: 401, message: "No refresh token provided" };

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
  } catch {
    throw { statusCode: 401, message: "Invalid or expired refresh token" };
  }

  // ✅ FIX: .select("+refreshToken") to load the hidden field
  const user = await User.findById(decoded.id).select("+refreshToken");

  if (!user || user.refreshToken !== refreshToken) {
    throw { statusCode: 401, message: "Refresh token mismatch. Please login again." };
  }

  return { accessToken: generateAccessToken(user._id) };
};