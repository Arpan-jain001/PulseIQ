import rateLimit from "express-rate-limit";

// 🌍 Global limiter
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
});

// 🔐 Auth limiter (strict)
export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many login attempts. Try later.",
  },
});

export default globalLimiter;