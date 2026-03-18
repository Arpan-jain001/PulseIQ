import Event from "../models/Event.js";
import mongoose from "mongoose";

export const retention = async ({ projectId }) => {
  return Event.aggregate([
    {
      $match: {
        projectId: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $group: {
        _id: {
          user: {
            $cond: [{ $ne: ["$userId", ""] }, "$userId", "$anonymousId"],
          },
          day: {
            $dateToString: { format: "%Y-%m-%d", date: "$ts" },
          },
        },
      },
    },
    {
      $group: {
        _id: "$_id.day",
        users: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};