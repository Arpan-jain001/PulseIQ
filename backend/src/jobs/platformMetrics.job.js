import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import Project from "../models/Project.js";
import Event from "../models/Event.js";

export const runPlatformMetrics = async () => {
  try {
    console.log("📊 Platform Metrics Job Running...");

    const users = await User.countDocuments();
    const workspaces = await Workspace.countDocuments();
    const projects = await Project.countDocuments();
    const events = await Event.countDocuments();

    console.log("📈 Platform Stats:");
    console.log(`👤 Users: ${users}`);
    console.log(`🏢 Workspaces: ${workspaces}`);
    console.log(`📦 Projects: ${projects}`);
    console.log(`📊 Events: ${events}`);

    console.log("✅ Metrics calculated");
  } catch (error) {
    console.error("❌ Platform metrics error:", error.message);
  }
};