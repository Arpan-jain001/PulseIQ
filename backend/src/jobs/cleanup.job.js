import Event from "../models/Event.js";
import Session from "../models/Session.js";

export const runCleanupJob = async () => {
  try {
    console.log("🧹 Cleanup Job Running...");

    /* ===== OLD EVENTS CLEANUP (30 days old) ===== */

    const oldDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const deletedEvents = await Event.deleteMany({
      ts: { $lt: oldDate },
    });

    console.log(`🗑️ Deleted Events: ${deletedEvents.deletedCount}`);

    /* ===== EXPIRED SESSIONS CLEANUP ===== */

    const expiredSessions = await Session.deleteMany({
      endedAt: { $ne: null },
      updatedAt: { $lt: oldDate },
    });

    console.log(`🗑️ Deleted Sessions: ${expiredSessions.deletedCount}`);

    console.log("✅ Cleanup completed");
  } catch (error) {
    console.error("❌ Cleanup job error:", error.message);
  }
};