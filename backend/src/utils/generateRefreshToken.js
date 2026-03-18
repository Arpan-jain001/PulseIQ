import jwt from "jsonwebtoken";

export const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_EXPIRE || "7d",
  });
};