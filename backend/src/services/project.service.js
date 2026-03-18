import Project from "../models/Project.js";

export const getProjects = async () => {
  return Project.find().sort({ createdAt: -1 });
};

export const getProjectById = async (id) => {
  return Project.findById(id);
};

export const disableProject = async (id) => {
  return Project.findByIdAndUpdate(
    id,
    { status: "DISABLED" },
    { new: true }
  );
};