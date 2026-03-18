import Session from "../models/Session.js";

export const createSession = async ({ userId, ip, userAgent }) => {
  return Session.create({
    userId,
    ip,
    userAgent,
  });
};

export const getUserSessions = async (userId) => {
  return Session.find({ userId }).sort({ createdAt: -1 });
};