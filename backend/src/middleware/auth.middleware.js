import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    // Bearer token
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password -refreshToken");

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({ success: false, message: "Account not active" });
    }

    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  next();
};

export const verifiedOnly = (req, res, next) => {
  if (req.user.verificationStatus !== "VERIFIED") {
    return res.status(403).json({ success: false, message: "Account not verified" });
  }
  next();
};
