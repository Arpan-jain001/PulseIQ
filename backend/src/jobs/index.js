import cron from "node-cron";
import { runAlertJob } from "./alert.job.js";
import { runInsightsJob } from "./insights.job.js";
import { runNotificationDispatcher } from "./notificationDispatcher.job.js";
import { runPlatformMetrics } from "./platformMetrics.job.js";
import { runVerificationReminder } from "./verificationReminder.job.js";
import { runWeeklyReportJob } from "./weeklyReport.job.js";

let jobsStarted = false;

export const startJobs = () => {
  if (jobsStarted) {
    console.log("⏱️ Scheduled jobs already started.");
    return;
  }

  const timezone = process.env.CRON_TIMEZONE || "Asia/Kolkata";
  console.log("⏱️ Starting scheduled jobs...");

  cron.schedule("*/5 * * * *", runAlertJob, { timezone });
  cron.schedule("*/10 * * * *", runInsightsJob, { timezone });
  cron.schedule("*/15 * * * *", runNotificationDispatcher, { timezone });
  cron.schedule("*/20 * * * *", runPlatformMetrics, { timezone });
  cron.schedule("0 * * * *", runVerificationReminder, { timezone });
  cron.schedule("0 9 * * 1", runWeeklyReportJob, { timezone });

  jobsStarted = true;
};
