import Workspace from "../models/Workspace.js";

export const getAllWorkspaces = async (req, res, next) => {
  try {
    const list = await Workspace.find().sort({ createdAt: -1 });
    res.json({ success: true, data: list });
  } catch (e) {
    next(e);
  }
};