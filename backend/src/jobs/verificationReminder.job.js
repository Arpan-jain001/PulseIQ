import VerificationRequest from "../models/VerificationRequest.js";

export const runVerificationReminder = async () => {
  try {
    console.log("🔔 Verification Reminder Job Running...");

    const pending = await VerificationRequest.find({
      status: "PENDING",
    }).populate("userId", "email name");

    if (!pending.length) {
      console.log("✅ No pending verifications");
      return;
    }

    pending.forEach((req) => {
      console.log(
        `⏳ Reminder: ${req.userId?.email} pending verification`
      );
    });

    console.log("📢 Reminder processed");
  } catch (error) {
    console.error("❌ Verification reminder error:", error.message);
  }
};