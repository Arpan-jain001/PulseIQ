import express from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import {
  registerUser,
  loginUser,
  googleLogin,
  refreshAccessToken,
  logoutUser,
  verifyEmailByLink,
  verifyEmailByOTP,
  resendVerification,
  forgotPassword,
  resetPassword,
  resetPasswordByOTP,
} from "../services/auth.service.js";

import { protect } from "../middleware/auth.middleware.js";
import { authLimiter } from "../middleware/rateLimit.middleware.js";

const router = express.Router();

/* ================= REGISTER ================= */
router.post("/register", authLimiter, async (req, res) => {
  try {
    const user = await registerUser(req.body);

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "15m",
    });

    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, {
      expiresIn: process.env.REFRESH_EXPIRE || "7d",
    });

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (e) {
    res.status(e.statusCode || 400).json({
      success: false,
      message: e.message || "Registration failed",
    });
  }
});

/* ================= LOGIN ================= */
router.post("/login", authLimiter, async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const { user, accessToken, refreshToken } = await loginUser({
      email,
      password,
      role,
    });

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (e) {
    res.status(e.statusCode || 401).json({
      success: false,
      message: e.message || "Login failed",
    });
  }
});

/* ================= GOOGLE LOGIN (auth-code flow) ================= */
router.post("/google", authLimiter, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: "Authorization code required" });
    }

    // ✅ Client inside handler — env variables available yahan
    const googleClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "postmessage"
    );

    console.log("CLIENT_ID:", process.env.GOOGLE_CLIENT_ID?.slice(0, 20));
    console.log("CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET?.slice(0, 10));

    // Step 1: Exchange auth code for tokens
    const { tokens } = await googleClient.getToken(code);
    const idToken = tokens.id_token;

    if (!idToken) {
      return res.status(400).json({ success: false, message: "Failed to get ID token from Google" });
    }

    // Step 2: Verify ID token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // Step 3: Find or create user in DB
    const { user, accessToken, refreshToken } = await googleLogin({
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      avatar: payload.picture,
      emailVerified: payload.email_verified,
    });

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (e) {
    console.error("Google login error:", e?.message || e);
    res.status(e.statusCode || 401).json({
      success: false,
      message: e.message || "Google login failed",
    });
  }
});

/* ================= REFRESH ================= */
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const { accessToken } = await refreshAccessToken(refreshToken);
    res.json({ success: true, accessToken });
  } catch (e) {
    res.status(401).json({ success: false, message: "Token refresh failed" });
  }
});

/* ================= LOGOUT ================= */
router.post("/logout", protect, async (req, res) => {
  await logoutUser(req.user._id);
  res.json({ success: true, message: "Logged out" });
});

/* ================= VERIFY EMAIL (Link) ================= */
router.get("/verify-email/:token", async (req, res) => {
  try {
    await verifyEmailByLink(req.params.token);
    res.json({ success: true, message: "Email verified successfully" });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

/* ================= VERIFY EMAIL (OTP) ================= */
router.post("/verify-email-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    await verifyEmailByOTP(email, otp);
    res.json({ success: true, message: "Email verified successfully" });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

/* ================= RESEND VERIFICATION ================= */
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    await resendVerification(email);
    res.json({ success: true, message: "Verification email sent again" });
  } catch (e) {
    res.status(e.statusCode || 400).json({ success: false, message: e.message });
  }
});

/* ================= FORGOT PASSWORD ================= */
router.post("/forgot-password", async (req, res) => {
  try {
    await forgotPassword(req.body.email);
    res.json({ success: true, message: "Reset link + OTP sent to email" });
  } catch (e) {
    res.status(e.statusCode || 400).json({
      success: false,
      message: e.message || "Failed to send reset email",
    });
  }
});

/* ================= RESET PASSWORD (Link) ================= */
router.post("/reset-password/:token", async (req, res) => {
  try {
    await resetPassword(req.params.token, req.body.password);
    res.json({ success: true, message: "Password reset successfully" });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

/* ================= RESET PASSWORD (OTP) ================= */
router.post("/reset-password-otp", async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    await resetPasswordByOTP(email, otp, password);
    res.json({ success: true, message: "Password reset successfully" });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

export default router;