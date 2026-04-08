import Notification from "../models/Notification.js";
import Project from "../models/Project.js";
import { buildProjectPulse } from "../services/reporting.service.js";
import { sendEmail } from "../utils/sendEmail.js";
import {
  getLowHealthAlertTemplate,
  getVerificationGraceAlertTemplate,
} from "../utils/emailTemplate.js";

export const runAlertJob = async () => {
  try {
    const now = new Date();
    const projects = await Project.find({ status: "ACTIVE" }).populate({
      path: "workspaceId",
      populate: { path: "ownerId", select: "name email" },
    });

    for (const project of projects) {
      const owner = project.workspaceId?.ownerId;
      if (!owner?.email) continue;

      const pulse = await buildProjectPulse(project, { now });
      await Project.findByIdAndUpdate(project._id, {
        recentHealthScore: pulse.score,
        recentHealthLabel: pulse.label,
        recentHealthSummary: pulse.summary,
        lastHealthEvaluatedAt: now,
      });

      const shouldSendLowHealthAlert =
        pulse.score <= 35 &&
        (!project.lastHealthAlertAt || now - new Date(project.lastHealthAlertAt) >= 24 * 60 * 60 * 1000);

      if (shouldSendLowHealthAlert) {
        await sendEmail({
          to: owner.email,
          subject: `PulseIQ Alert: ${project.name} score dropped to ${pulse.score}`,
          html: getLowHealthAlertTemplate({
            ownerName: owner.name,
            projectName: project.name,
            workspaceName: project.workspaceId?.name,
            score: pulse.score,
            label: pulse.label,
            summary: pulse.summary,
            recommendations: pulse.recommendations,
          }),
        });

        await Notification.create({
          title: `Low health alert for ${project.name}`,
          message: `Project score is ${pulse.score}. Immediate action recommended.`,
          type: "USER",
          targetUser: owner._id,
        });

        await Project.findByIdAndUpdate(project._id, { lastHealthAlertAt: now });
      }

      const shouldSendGraceAlert =
        !project.sdkVerified &&
        [5, 3, 1].includes(project.graceDaysLeft) &&
        (!project.lastGraceReminderAt || now - new Date(project.lastGraceReminderAt) >= 20 * 60 * 60 * 1000);

      if (shouldSendGraceAlert) {
        await sendEmail({
          to: owner.email,
          subject: `PulseIQ Reminder: ${project.graceDaysLeft} day(s) left to verify ${project.name}`,
          html: getVerificationGraceAlertTemplate({
            ownerName: owner.name,
            projectName: project.name,
            workspaceName: project.workspaceId?.name,
            graceDaysLeft: project.graceDaysLeft,
            summary: pulse.summary,
          }),
        });

        await Notification.create({
          title: `Grace period reminder: ${project.name}`,
          message: `${project.graceDaysLeft} day(s) left to verify SDK before grace ends.`,
          type: "USER",
          targetUser: owner._id,
        });

        await Project.findByIdAndUpdate(project._id, { lastGraceReminderAt: now });
      }
    }
  } catch (error) {
    console.error("❌ Alert job error:", error.message);
  }
};
