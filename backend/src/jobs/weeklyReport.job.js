import Project from "../models/Project.js";
import { buildProjectPulse } from "../services/reporting.service.js";
import {
  createWorkspaceNotifications,
  listWorkspaceAudience,
} from "../services/workspaceAudience.service.js";
import { getWeeklyPerformanceTemplate } from "../utils/emailTemplate.js";
import { sendEmail } from "../utils/sendEmail.js";

export const runWeeklyReportJob = async () => {
  try {
    const now = new Date();
    const projects = await Project.find({ status: "ACTIVE" }).populate({
      path: "workspaceId",
      populate: { path: "ownerId", select: "name email" },
    });

    for (const project of projects) {
      const alreadySentRecently =
        project.lastWeeklyReportAt &&
        now - new Date(project.lastWeeklyReportAt) < 6.5 * 24 * 60 * 60 * 1000;

      if (alreadySentRecently) continue;

      const pulse = await buildProjectPulse(project, { now, reportDays: 7 });
      const audience = await listWorkspaceAudience({
        workspaceId: project.workspaceId?._id || project.workspaceId,
      });

      if (!audience.recipients.length) continue;

      let delivered = 0;

      for (const recipient of audience.recipients) {
        const ok = await sendEmail({
          to: recipient.email,
          subject: `PulseIQ Weekly Report: ${project.name} is ${pulse.label}`,
          html: getWeeklyPerformanceTemplate({
            ownerName: recipient.name,
            projectName: project.name,
            workspaceName: project.workspaceId?.name,
            score: pulse.score,
            label: pulse.label,
            summary: pulse.summary,
            metrics: pulse.metrics,
            recommendations: pulse.recommendations,
          }),
        });

        if (ok) delivered += 1;
      }

      await createWorkspaceNotifications({
        userIds: audience.userIds,
        targetWorkspace: project.workspaceId?._id || project.workspaceId,
        title: `Weekly report ready: ${project.name}`,
        message: `Health score ${pulse.score}. ${pulse.summary}`,
      });

      if (delivered > 0) {
        await Project.findByIdAndUpdate(project._id, {
          recentHealthScore: pulse.score,
          recentHealthLabel: pulse.label,
          recentHealthSummary: pulse.summary,
          lastHealthEvaluatedAt: now,
          lastWeeklyReportAt: now,
        });
      }
    }
  } catch (error) {
    console.error("❌ Weekly report job error:", error.message);
  }
};
