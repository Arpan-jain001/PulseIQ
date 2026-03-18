import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import Project from "../models/Project.js";
import Event from "../models/Event.js";

export const getAdminOverview = async () => {
  const users = await User.countDocuments();
  const activeUsers = await User.countDocuments({ status: "ACTIVE" });

  const workspaces = await Workspace.countDocuments();
  const projects = await Project.countDocuments();

  const totalEvents = await Event.countDocuments();

  return {
    users,
    activeUsers,
    workspaces,
    projects,
    totalEvents,
  };
};