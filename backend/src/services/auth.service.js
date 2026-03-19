import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import { getVerificationTemplate } from "../utils/emailTemplate.js";
import { getForgotPasswordTemplate } from "../utils/emailTemplate.js";
import { getWelcomeTemplate, getLoginAlertTemplate } from "../utils/emailTemplate.js";


const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* ================= TOKENS ================= */

const generateAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "15m",
  });

const generateRefreshToken = (id) =>
  jwt.sign({ id }, process.env.REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_EXPIRE || "7d",
  });

/* ================= REGISTER ================= */

export const registerUser = async ({ name, email, password, role }) => {
  const exists = await User.findOne({ email });
  if (exists) throw { statusCode: 409, message: "Email already exists" };

  const token = crypto.randomBytes(32).toString("hex");
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const user = await User.create({
    name,
    email,
    password,
    role: role || "USER",
    emailVerificationToken: token,
    emailVerificationOTP: otp,
    emailVerificationExpire: Date.now() + 10 * 60 * 1000,
  });

  const link = `${process.env.CLIENT_URL}/verify-email/${token}`;

  await sendEmail({
    to: email,
    subject: "Verify Email",
   html: getVerificationTemplate({
  name: user.name,
  email: user.email,
  otp,
  link,
}),
  });

  

  return user;
};

export const loginUser = async ({ email, password, role }) => {
  const user = await User.findOne({ email });

  // ❌ USER NOT FOUND
  if (!user) {
    throw { statusCode: 401, message: "Invalid credentials" };
  }

  // ❌ ROLE CHECK FIRST
  if (!role || user.role !== role) {
    throw {
      statusCode: 403,
      message: "Your role is not correct for this account",
    };
  }

  // ❌ PASSWORD CHECK
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw { statusCode: 401, message: "Invalid credentials" };
  }

  // ❌ EMAIL VERIFY (SUPER_ADMIN KO SKIP)
  if (user.role !== "SUPER_ADMIN" && !user.emailVerified) {
    throw {
      statusCode: 403,
      message: "EMAIL_NOT_VERIFIED",
    };
  }

  // ❌ STATUS CHECK
  if (user.status !== "ACTIVE") {
    throw {
      statusCode: 403,
      message: "Account is not active",
    };
  }

  // ❌ ORGANIZER APPROVAL
  if (user.role === "ORGANIZER" && user.verificationStatus !== "VERIFIED") {
    throw {
      statusCode: 403,
      message: "Organizer not approved yet",
    };
  }

  // ✅ TOKENS GENERATE
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // ✅ SMART LOGIN ALERT (NO SPAM)
  if (!user.lastLoginAt || Date.now() - user.lastLoginAt > 5 * 60 * 1000) {
    try {
      await sendEmail({
        to: user.email,
        subject: "New Login Alert 🔐",
        html: getLoginAlertTemplate({
          name: user.name,
          email: user.email,
          ip: "Unknown",
          device: "Browser",
        }),
      });
    } catch (err) {
      console.log("Login alert email failed:", err.message);
    }
  }

  // ✅ SINGLE SAVE (IMPORTANT FIX)
  user.refreshToken = refreshToken;
  user.lastLoginAt = Date.now();

  await user.save();

  // ✅ FINAL RETURN
  return { user, accessToken, refreshToken };
};
/* ================= GOOGLE ================= */

export const googleLogin = async (token) => {
  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const { email, name, picture } = ticket.getPayload();

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      avatar: picture,
      emailVerified: true,
      verificationStatus: "VERIFIED",
    });
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  return { user, accessToken, refreshToken };
};

/* ================= VERIFY ================= */

export const verifyEmailByLink = async (token) => {
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) throw { statusCode: 400, message: "Invalid token" };

  // ✅ prevent duplicate welcome emails
  if (!user.emailVerified) {
    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationOTP = null;
    user.emailVerificationExpire = null;

    await user.save();

    // ✅ SEND WELCOME EMAIL
    try {
      await sendEmail({
        to: user.email,
        subject: "Welcome to PulseIQ 🚀",
        html: getWelcomeTemplate({
          name: user.name,
          email: user.email,
        }),
      });
    } catch (err) {
      console.log("Welcome email failed:", err.message);
    }
  }
};

export const verifyEmailByOTP = async (email, otp) => {
  const user = await User.findOne({
    email,
    emailVerificationOTP: otp,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw { statusCode: 400, message: "Invalid or expired OTP" };
  }

  // ✅ prevent duplicate verification + email
  if (!user.emailVerified) {
    user.emailVerified = true;
    user.emailVerificationOTP = null;
    user.emailVerificationToken = null;
    user.emailVerificationExpire = null;

    await user.save();

    // ✅ 🔥 SEND WELCOME EMAIL AFTER VERIFY
    try {
      await sendEmail({
        to: user.email,
        subject: "Welcome to PulseIQ 🚀",
        html: getWelcomeTemplate({
          name: user.name,
          email: user.email,
        }),
      });
    } catch (err) {
      console.log("Welcome email failed:", err.message);
    }
  }

  return user;
};



/* ================= RESEND ================= */

export const resendVerification = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw { statusCode: 404, message: "User not found" };

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const token = crypto.randomBytes(32).toString("hex");

  user.emailVerificationOTP = otp;
  user.emailVerificationToken = token;
  user.emailVerificationExpire = Date.now() + 10 * 60 * 1000;

  await user.save();

  const link = `${process.env.CLIENT_URL}/verify-email/${token}`;

  await sendEmail({
    to: email,
    subject: "Resend Verification",
    html: getVerificationTemplate({
  name: user.name,
  email: user.email,
  otp,
  link,
}),
  });
};

/* ================= FORGOT PASSWORD ================= */

export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw { statusCode: 404, message: "User not found" };

  const token = crypto.randomBytes(32).toString("hex");
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.resetPasswordToken = token;
  user.resetPasswordOTP = otp;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await user.save();

  const link = `${process.env.CLIENT_URL}/reset-password/${token}`;

  await sendEmail({
  to: user.email,
  subject: "Reset Password Request PulseIQ 🔐",
  html: getForgotPasswordTemplate({
    name: user.name,
    email: user.email,
    link,
  }),
});
};

/* ================= RESET ================= */

export const resetPassword = async (token, password) => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) throw { statusCode: 400, message: "Invalid token" };

  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordOTP = null;
  user.resetPasswordExpire = null;

  await user.save();
};

export const resetPasswordByOTP = async (email, otp, password) => {
  const user = await User.findOne({
    email,
    resetPasswordOTP: otp,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) throw { statusCode: 400, message: "Invalid OTP" };

  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordOTP = null;
  user.resetPasswordExpire = null;

  await user.save();
};

/* ================= LOGOUT ================= */

export const logoutUser = async (id) => {
  await User.findByIdAndUpdate(id, { refreshToken: "" });
};

export const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      throw { statusCode: 401, message: "Invalid refresh token" };
    }

    return {
      accessToken: generateAccessToken(user._id),
    };
  } catch (err) {
    throw { statusCode: 401, message: "Invalid or expired token" };
  }
};