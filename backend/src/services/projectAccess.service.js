import Project from "../models/Project.js";
import Membership from "../models/Membership.js";
import Workspace from "../models/Workspace.js";

const makeError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const getAccessibleProject = async ({
  projectId,
  user,
  allowedMembershipRoles = ["OWNER", "ADMIN", "MEMBER", "VIEWER"],
}) => {
  if (!projectId) {
    throw makeError(400, "projectId is required");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw makeError(404, "Project not found");
  }

  if (user?.role === "SUPER_ADMIN") {
    return project;
  }

  const membership = await Membership.findOne({
    workspaceId: project.workspaceId,
    userId: user?._id,
    status: "ACTIVE",
    role: { $in: allowedMembershipRoles },
  });

  if (!membership) {
    throw makeError(403, "You do not have access to this project");
  }

  return project;
};

export const getAccessibleWorkspace = async ({
  workspaceId,
  user,
  allowedMembershipRoles = ["OWNER", "ADMIN", "MEMBER", "VIEWER"],
}) => {
  if (!workspaceId) {
    throw makeError(400, "workspaceId is required");
  }

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw makeError(404, "Workspace not found");
  }

  if (user?.role === "SUPER_ADMIN") {
    return workspace;
  }

  const membership = await Membership.findOne({
    workspaceId,
    userId: user?._id,
    status: "ACTIVE",
    role: { $in: allowedMembershipRoles },
  });

  if (!membership) {
    throw makeError(403, "You do not have access to this workspace");
  }

  return workspace;
};
