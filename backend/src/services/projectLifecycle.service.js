import { sendEmail } from "../utils/sendEmail.js";
import {
  getProjectCreatedTemplate,
  getProjectDeletedTemplate,
} from "../utils/emailTemplate.js";
import { getFrontendUrl } from "../utils/frontendUrl.js";
import {
  createWorkspaceNotifications,
  listWorkspaceAudience,
} from "./workspaceAudience.service.js";

const sendToAudience = async ({ recipients, subject, buildHtml }) => {
  let delivered = 0;

  for (const recipient of recipients) {
    const ok = await sendEmail({
      to: recipient.email,
      subject,
      html: buildHtml(recipient),
    });
    if (ok) delivered += 1;
  }

  return delivered;
};

export const notifyProjectCreated = async ({ workspaceId, project, actor }) => {
  const audience = await listWorkspaceAudience({
    workspaceId,
    extraUserIds: actor?._id ? [actor._id] : [],
  });

  if (!audience.recipients.length) return { delivered: 0, recipients: 0 };

  const delivered = await sendToAudience({
    recipients: audience.recipients,
    subject: `PulseIQ Project Created: ${project.name}`,
    buildHtml: (recipient) =>
      getProjectCreatedTemplate({
        ownerName: recipient.name,
        projectName: project.name,
        workspaceName: audience.workspace?.name,
        allowedDomains: project.allowedDomains || [],
        categoryLabel: project.categoryLabel,
        createdBy: actor?.name || actor?.email || "PulseIQ user",
        projectUrl: `${getFrontendUrl()}/organizer-dashboard/projects`,
      }),
  });

  await createWorkspaceNotifications({
    userIds: audience.userIds,
    targetWorkspace: workspaceId,
    title: `Project created: ${project.name}`,
    message: `${actor?.name || "A teammate"} created ${project.name} in ${audience.workspace?.name || "your workspace"}.`,
  });

  return { delivered, recipients: audience.recipients.length };
};

export const notifyProjectDeleted = async ({
  workspaceId,
  projectName,
  actor,
  deletedStats = {},
}) => {
  const audience = await listWorkspaceAudience({
    workspaceId,
    extraUserIds: actor?._id ? [actor._id] : [],
  });

  if (!audience.recipients.length) return { delivered: 0, recipients: 0 };

  const delivered = await sendToAudience({
    recipients: audience.recipients,
    subject: `PulseIQ Project Deleted: ${projectName}`,
    buildHtml: (recipient) =>
      getProjectDeletedTemplate({
        ownerName: recipient.name,
        projectName,
        workspaceName: audience.workspace?.name,
        deletedBy: actor?.name || actor?.email || "PulseIQ user",
        deletedAt: deletedStats.deletedAt || new Date(),
        totalEvents: deletedStats.totalEvents || 0,
        lastEventAt: deletedStats.lastEventAt || null,
      }),
  });

  await createWorkspaceNotifications({
    userIds: audience.userIds,
    targetWorkspace: workspaceId,
    title: `Project deleted: ${projectName}`,
    message: `${actor?.name || "A teammate"} permanently deleted ${projectName}.`,
  });

  return { delivered, recipients: audience.recipients.length };
};
