export const errorHandler = (error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message || "Server Error";

  if (process.env.NODE_ENV !== "production") {
    console.error("❌", error);
  }

  res.status(status).json({
    success: false,
    message,
  });
};
