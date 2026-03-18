import Event from "../models/Event.js";

export const runAlertJob = async () => {
  try {
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);

    const count = await Event.countDocuments({
      ts: { $gte: lastHour },
    });

    if (count < 10) {
      console.log("⚠️ ALERT: Low user activity detected!");
    } else {
      console.log("✅ System normal");
    }
  } catch (error) {
    console.error("❌ Alert job error:", error.message);
  }
};