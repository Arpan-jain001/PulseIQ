import Event from "../models/Event.js";
import Membership from "../models/Membership.js";
import Notification from "../models/Notification.js";
import Project from "../models/Project.js";
import Session from "../models/Session.js";
import User from "../models/User.js";
import VerificationRequest from "../models/VerificationRequest.js";
import Workspace from "../models/Workspace.js";

export const isDeleteConfirmationValid = (value) =>
  String(value || "").trim().toLowerCase() === "delete";

export const deleteProjectCascade = async (projectId) => {
  await Event.deleteMany({ projectId });
  await Project.findByIdAndDelete(projectId);
};

export const deleteWorkspaceCascade = async (workspaceId) => {
  const projects = await Project.find({ workspaceId }).select("_id");
  const projectIds = projects.map((project) => project._id);

  if (projectIds.length) {
    await Event.deleteMany({ projectId: { $in: projectIds } });
  }

  await Promise.all([
    Project.deleteMany({ workspaceId }),
    Membership.deleteMany({ workspaceId }),
    Notification.deleteMany({ targetWorkspace: workspaceId }),
    Workspace.findByIdAndDelete(workspaceId),
  ]);
};

export const deleteUserCascade = async (userId) => {
  const ownedWorkspaces = await Workspace.find({ ownerId: userId }).select("_id");

  for (const workspace of ownedWorkspaces) {
    await deleteWorkspaceCascade(workspace._id);
  }

  await Promise.all([
    Membership.deleteMany({ userId }),
    Session.deleteMany({ userId }),
    Notification.deleteMany({ targetUser: userId }),
    Notification.updateMany({ readBy: userId }, { $pull: { readBy: userId } }),
    VerificationRequest.deleteMany({ userId }),
    VerificationRequest.updateMany({ reviewedBy: userId }, { $unset: { reviewedBy: 1 } }),
    User.findByIdAndDelete(userId),
  ]);
};
