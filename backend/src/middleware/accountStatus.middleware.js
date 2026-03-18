export const checkAccountStatus = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (req.user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Account not active",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};