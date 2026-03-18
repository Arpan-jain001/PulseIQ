import Workspace from "../models/Workspace.js";
import Membership from "../models/Membership.js";

/* ===== LIST WORKSPACES ===== */

export const getAllWorkspaces = async () => {
  return Workspace.find().sort({ createdAt: -1 });
};

/* ===== WORKSPACE DETAILS ===== */

export const getWorkspaceDetails = async (workspaceId) => {
  const workspace = await Workspace.findById(workspaceId);

  const members = await Membership.find({
    workspaceId,
    status: "ACTIVE",
  }).populate("userId", "name email role");

  return {
    workspace,
    members,
  };
};