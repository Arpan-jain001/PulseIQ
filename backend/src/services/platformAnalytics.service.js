import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import Project from "../models/Project.js";
import Event from "../models/Event.js";

export const platformOverview = async () => {
  const users = await User.countDocuments();
  const workspaces = await Workspace.countDocuments();
  const projects = await Project.countDocuments();
  const events = await Event.countDocuments();

  return { users, workspaces, projects, events };
};