export const success = (res, data, message = "Success") => {
  return res.json({
    success: true,
    message,
    data,
  });
};

export const error = (res, message = "Error", status = 500) => {
  return res.status(status).json({
    success: false,
    message,
  });
};