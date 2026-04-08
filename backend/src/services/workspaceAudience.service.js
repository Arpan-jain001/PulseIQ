import Membership from "../models/Membership.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import Workspace from "../models/Workspace.js";

const DEFAULT_ROLES = ["OWNER", "ADMIN"];

const getRecipientKey = (recipient) =>
  recipient.userId?.toString?.() || recipient.email?.toLowerCase?.() || "";

export const listWorkspaceAudience = async ({
  workspaceId,
  includeRoles = DEFAULT_ROLES,
  extraUserIds = [],
} = {}) => {
  if (!workspaceId) {
    return { workspace: null, recipients: [], userIds: [] };
  }

  const workspace = await Workspace.findById(workspaceId).populate("ownerId", "name email");
  if (!workspace) {
    return { workspace: null, recipients: [], userIds: [] };
  }

  const memberships = await Membership.find({
    workspaceId,
    status: "ACTIVE",
    role: { $in: includeRoles },
  }).populate("userId", "name email");

  const extras = extraUserIds.length
    ? await User.find({ _id: { $in: extraUserIds } }).select("name email")
    : [];

  const recipients = [];

  if (workspace.ownerId?.email) {
    recipients.push({
      userId: workspace.ownerId._id,
      name: workspace.ownerId.name,
      email: workspace.ownerId.email,
      role: "OWNER",
    });
  }

  memberships.forEach((membership) => {
    if (!membership.userId?.email) return;
    recipients.push({
      userId: membership.userId._id,
      name: membership.userId.name,
      email: membership.userId.email,
      role: membership.role,
    });
  });

  extras.forEach((user) => {
    if (!user.email) return;
    recipients.push({
      userId: user._id,
      name: user.name,
      email: user.email,
      role: "ACTOR",
    });
  });

  const deduped = Array.from(
    recipients.reduce((map, recipient) => {
      const key = getRecipientKey(recipient);
      if (!key) return map;
      if (!map.has(key)) map.set(key, recipient);
      return map;
    }, new Map()).values()
  );

  return {
    workspace,
    recipients: deduped,
    userIds: deduped.map((recipient) => recipient.userId).filter(Boolean),
  };
};

export const createWorkspaceNotifications = async ({
  userIds = [],
  title,
  message,
  targetWorkspace,
}) => {
  const documents = userIds
    .filter(Boolean)
    .map((userId) => ({
      title,
      message,
      type: "USER",
      targetUser: userId,
      targetWorkspace: targetWorkspace || undefined,
    }));

  if (!documents.length) return 0;

  await Notification.insertMany(documents, { ordered: false });
  return documents.length;
};
