import Event from "../models/Event.js";
import mongoose from "mongoose";

export const overview = async ({ projectId, from, to }) => {
  const match = {
    projectId: new mongoose.Types.ObjectId(projectId),
    ts: { $gte: new Date(from), $lte: new Date(to) },
  };

  const totalEvents = await Event.countDocuments(match);

  const uniqueUsersAgg = await Event.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          $cond: [{ $ne: ["$userId", ""] }, "$userId", "$anonymousId"],
        },
      },
    },
    { $count: "uniqueUsers" },
  ]);

  const uniqueUsers = uniqueUsersAgg?.[0]?.uniqueUsers || 0;

  const topEvents = await Event.aggregate([
    { $match: match },
    { $group: { _id: "$eventName", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  return { totalEvents, uniqueUsers, topEvents };
};

export const dau = async ({ projectId, from, to }) => {
  const match = {
    projectId: new mongoose.Types.ObjectId(projectId),
    ts: { $gte: new Date(from), $lte: new Date(to) },
  };

  return Event.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          day: { $dateToString: { format: "%Y-%m-%d", date: "$ts" } },
          user: { $cond: [{ $ne: ["$userId", ""] }, "$userId", "$anonymousId"] },
        },
      },
    },
    { $group: { _id: "$_id.day", activeUsers: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
};
