import { createWorkspace, listMyWorkspaces, inviteMember, listMembers } from "../services/workspace.service.js";
import { writeAudit } from "../services/audit.service.js";

export const create = async (req, res, next) => {
  try {
    const ws = await createWorkspace({ name: req.body.name, ownerId: req.user._id });
    await writeAudit({ actorId: req.user._id, action: "WORKSPACE_CREATE", targetType: "WORKSPACE", targetId: ws._id });
    res.status(201).json({ success: true, data: ws });
  } catch (e) {
    next(e);
  }
};

export const mine = async (req, res, next) => {
  try {
    const list = await listMyWorkspaces({ userId: req.user._id });
    res.json({ success: true, data: list });
  } catch (e) {
    next(e);
  }
};

export const members = async (req, res, next) => {
  try {
    const list = await listMembers({ workspaceId: req.params.id });
    res.json({ success: true, data: list });
  } catch (e) {
    next(e);
  }
};

export const addMember = async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    const m = await inviteMember({ workspaceId: req.params.id, userId, role });
    await writeAudit({ actorId: req.user._id, action: "WORKSPACE_INVITE", targetType: "WORKSPACE", targetId: req.params.id, meta: { userId, role } });
    res.status(201).json({ success: true, data: m });
  } catch (e) {
    next(e);
  }
};
