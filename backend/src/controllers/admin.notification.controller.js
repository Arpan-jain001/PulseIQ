import { sendNotification } from "../services/notification.service.js";

export const sendAdminNotification = async (req, res, next) => {
  try {
    const { title, message, type, targetUser, targetWorkspace } = req.body;

    const notif = await sendNotification({
      title,
      message,
      type,
      targetUser,
      targetWorkspace,
    });

    res.status(201).json({ success: true, data: notif });
  } catch (e) {
    next(e);
  }
};