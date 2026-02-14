import Workspace from "../models/Workspace.js";
import Membership from "../models/Membership.js";

export const createWorkspace = async ({ name, ownerId }) => {
  const ws = await Workspace.create({ name, ownerId });

  // auto membership
  await Membership.create({
    workspaceId: ws._id,
    userId: ownerId,
    role: "OWNER",
  });

  return ws;
};

export const listMyWorkspaces = async ({ userId }) => {
  const memberships = await Membership.find({ userId, status: "ACTIVE" }).populate("workspaceId");
  return memberships.map((m) => m.workspaceId).filter(Boolean);
};

export const inviteMember = async ({ workspaceId, userId, role }) => {
  const m = await Membership.findOneAndUpdate(
    { workspaceId, userId },
    { role: role || "MEMBER", status: "ACTIVE" },
    { upsert: true, new: true }
  );
  return m;
};

export const listMembers = async ({ workspaceId }) => {
  const members = await Membership.find({ workspaceId, status: "ACTIVE" })
    .populate("userId", "name email role status verificationStatus");
  return members;
};
