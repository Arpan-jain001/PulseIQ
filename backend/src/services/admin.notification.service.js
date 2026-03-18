import Notification from "../models/Notification.js";

export const listNotifications = async () => {
  return Notification.find().sort({ createdAt: -1 });
};