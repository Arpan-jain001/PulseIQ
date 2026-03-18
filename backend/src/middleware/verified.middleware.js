export const verifiedOnly = (req, res, next) => {
  if (req.user.verificationStatus !== "VERIFIED") {
    return res.status(403).json({
      success: false,
      message: "User not verified",
    });
  }
  next();
};