import User from "../models/User.js";
import Workspace from "../models/Workspace.js";

export const getAdminStats = async () => {
  const users = await User.countDocuments();
  const workspaces = await Workspace.countDocuments();

  return { users, workspaces };
};