import Notification from "../models/Notification.js";

export const sendNotification = async ({ title, message, type, targetUser, targetWorkspace }) => {
  return Notification.create({ title, message, type, targetUser, targetWorkspace });
};

export const getMyNotifications = async ({ userId }) => {
  const list = await Notification.find({
    $or: [{ type: "GLOBAL" }, { type: "USER", targetUser: userId }],
  }).sort({ createdAt: -1 });

  return list;
};

export const markRead = async ({ userId, notificationId }) => {
  const n = await Notification.findById(notificationId);
  if (!n) throw Object.assign(new Error("Notification not found"), { statusCode: 404 });

  if (!n.readBy?.includes(userId)) {
    n.readBy.push(userId);
    await n.save();
  }
  return true;
};
