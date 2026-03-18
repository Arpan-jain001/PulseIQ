import { hasPermission } from "../utils/permissionMatrix.js";

export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({
        success: false,
        message: "Permission denied",
      });
    }
    next();
  };
};