import cron from "node-cron";
import { runAlertJob } from "./alert.job.js";
import { runInsightsJob } from "./insights.job.js";
import { runNotificationDispatcher } from "./notificationDispatcher.job.js";
import { runPlatformMetrics } from "./platformMetrics.job.js";
import { runVerificationReminder } from "./verificationReminder.job.js";

export const startJobs = () => {
  console.log("⏱️ Starting scheduled jobs...");

  cron.schedule("*/5 * * * *", runAlertJob); // every 5 min
  cron.schedule("*/10 * * * *", runInsightsJob);
  cron.schedule("*/15 * * * *", runNotificationDispatcher);
  cron.schedule("*/20 * * * *", runPlatformMetrics);
  cron.schedule("0 * * * *", runVerificationReminder); // every hour
};