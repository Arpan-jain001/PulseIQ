import rateLimit from "express-rate-limit";

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
});

export default rateLimiter;
