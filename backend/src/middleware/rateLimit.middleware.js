import rateLimit from "express-rate-limit";

const skipRateLimit = (req) =>
  process.env.NODE_ENV !== "production" || req.path === "/health";

// 🌍 Global limiter
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  skip: skipRateLimit,
});

// 🔐 Auth limiter (strict)
export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  skip: skipRateLimit,
  message: {
    success: false,
    message: "Too many login attempts. Try later.",
  },
});

export default globalLimiter;
