import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import Event from "../models/Event.js";

const router = express.Router();

router.get("/", protect, async (req, res, next) => {
  try {
    const {
      projectId,
      eventName,
      from,
      to,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (projectId) query.projectId = projectId;
    if (eventName) query.eventName = eventName;

    if (from && to) {
      query.ts = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    const events = await Event.find(query)
      .sort({ ts: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: events,
    });
  } catch (e) {
    next(e);
  }
});

export default router;