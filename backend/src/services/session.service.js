import Session from "../models/Session.js";

/* ================= CREATE SESSION ================= */

export const createSession = async ({ userId, ip, userAgent }) => {
  return Session.create({
    userId,
    ip,
    userAgent,
    startedAt: new Date(),
  });
};

/* ================= END SESSION ================= */

export const endSession = async (sessionId) => {
  return Session.findByIdAndUpdate(sessionId, {
    endedAt: new Date(),
  });
};

/* ================= GET USER SESSIONS ================= */

export const getUserSessions = async (userId) => {
  return Session.find({ userId }).sort({ createdAt: -1 });
};