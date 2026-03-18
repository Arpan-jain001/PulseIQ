import Event from "../models/Event.js";
import mongoose from "mongoose";

export const funnel = async ({ projectId, steps }) => {
  const results = [];

  for (let step of steps) {
    const count = await Event.countDocuments({
      projectId: new mongoose.Types.ObjectId(projectId),
      eventName: step,
    });

    results.push({ step, count });
  }

  return results;
};