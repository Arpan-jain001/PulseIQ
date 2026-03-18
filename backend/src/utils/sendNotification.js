import Notification from "../models/Notification.js";

export const sendNotificationUtil = async ({
  title,
  message,
  type,
  targetUser,
  targetWorkspace,
}) => {
  return Notification.create({
    title,
    message,
    type,
    targetUser,
    targetWorkspace,
  });
};