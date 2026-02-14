import { getMyNotifications, markRead } from "../services/notification.service.js";

export const myNotifications = async (req, res, next) => {
  try {
    const list = await getMyNotifications({ userId: req.user._id });
    res.json({ success: true, data: list });
  } catch (e) {
    next(e);
  }
};

export const read = async (req, res, next) => {
  try {
    await markRead({ userId: req.user._id, notificationId: req.params.id });
    res.json({ success: true, message: "Marked read" });
  } catch (e) {
    next(e);
  }
};
