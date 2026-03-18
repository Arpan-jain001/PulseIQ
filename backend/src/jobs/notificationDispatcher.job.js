import Notification from "../models/Notification.js";

export const runNotificationDispatcher = async () => {
  try {
    console.log("📢 Notification Dispatcher Running...");

    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(10);

    if (!notifications.length) {
      console.log("⚠️ No notifications found");
      return;
    }

    notifications.forEach((n) => {
      console.log(`🔔 Dispatching: ${n.title}`);
    });

    console.log("✅ Notifications processed");
  } catch (error) {
    console.error("❌ Notification dispatcher error:", error.message);
  }
};