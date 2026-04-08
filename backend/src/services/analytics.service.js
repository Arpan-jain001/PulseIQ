// backend/src/services/analytics.service.js — REPLACE existing
import Event from "../models/Event.js";
import mongoose from "mongoose";
import Project from "../models/Project.js";
import { getCategoryConfig } from "./projectCategory.service.js";

const toObjId = (id) => new mongoose.Types.ObjectId(id);
const getUserExpr = () => ({
  $cond: [{ $ne: ["$userId", ""] }, "$userId", "$anonymousId"],
});
const getSessionExpr = () => ({
  $cond: [
    { $ne: ["$sessionId", ""] },
    "$sessionId",
    {
      $concat: [
        { $cond: [{ $ne: ["$userId", ""] }, "$userId", "$anonymousId"] },
        "::",
        { $dateToString: { format: "%Y-%m-%dT%H", date: "$ts" } },
      ],
    },
  ],
});

/* ── Overview ─────────────────────────────────── */
export const overview = async ({ projectId, from, to }) => {
  const project = await Project.findById(projectId).select("categoryKey categoryLabel categoryConfidence");
  const match = {
    projectId: toObjId(projectId),
    ts: { $gte: new Date(from), $lte: new Date(to) },
  };

  const [totalEvents, uniqueUsersAgg, topEvents, pageViews, bounceData, hourlyData, dauToday] =
    await Promise.all([
      Event.countDocuments(match),

      Event.aggregate([
        { $match: match },
        { $group: { _id: { $cond: [{ $ne: ["$userId",""] }, "$userId", "$anonymousId"] } } },
        { $count: "uniqueUsers" },
      ]),

      Event.aggregate([
        { $match: match },
        { $group: { _id: "$eventName", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Top pages with unique users per page
      Event.aggregate([
        { $match: { ...match, eventName: "page_view" } },
        { $group: {
            _id: "$properties.page",
            count: { $sum: 1 },
            uniqueUsers: { $addToSet: { $cond: [{ $ne: ["$userId",""] }, "$userId", "$anonymousId"] } },
        }},
        { $project: { count: 1, uniqueUsers: { $size: "$uniqueUsers" } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Bounce rate
      Event.aggregate([
        { $match: match },
        { $group: { _id: { $cond: [{ $ne: ["$userId",""] }, "$userId", "$anonymousId"] }, count: { $sum: 1 } } },
        { $group: {
            _id: null,
            bounced: { $sum: { $cond: [{ $eq: ["$count", 1] }, 1, 0] } },
            total:   { $sum: 1 },
        }},
      ]),

      // Hourly distribution
      Event.aggregate([
        { $match: match },
        { $group: { _id: { $hour: "$ts" }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      // DAU today
      Event.aggregate([
        { $match: {
            projectId: toObjId(projectId),
            ts: { $gte: new Date(new Date().setHours(0,0,0,0)), $lte: new Date() },
        }},
        { $group: { _id: { $cond: [{ $ne: ["$userId",""] }, "$userId", "$anonymousId"] } } },
        { $count: "dau" },
      ]),
    ]);

  const uniqueUsers = uniqueUsersAgg?.[0]?.uniqueUsers || 0;
  const bounced    = bounceData?.[0]?.bounced || 0;
  const totalSess  = bounceData?.[0]?.total || 1;
  const bounceRate = Math.round((bounced / totalSess) * 100);

  const hourly = Array.from({ length: 24 }, (_, h) => ({
    hour:  `${h}:00`,
    count: hourlyData.find(d => d._id === h)?.count || 0,
  }));

  return {
    category: {
      key: project?.categoryKey || "general",
      label: project?.categoryLabel || "General Web App",
      confidence: project?.categoryConfidence || 0,
      journeysLabel: getCategoryConfig(project?.categoryKey).journeysLabel,
    },
    totalEvents,
    uniqueUsers,
    topEvents,
    topPages:            pageViews,
    bounceRate,
    avgEventsPerUser:    uniqueUsers > 0 ? +(totalEvents / uniqueUsers).toFixed(1) : 0,
    hourlyDistribution:  hourly,
    dauToday:            dauToday?.[0]?.dau || 0,
  };
};

/* ── DAU + MAU ────────────────────────────────── */
export const dau = async ({ projectId, from, to }) => {
  const match = {
    projectId: toObjId(projectId),
    ts: { $gte: new Date(from), $lte: new Date(to) },
  };
  return Event.aggregate([
    { $match: match },
    { $group: {
        _id: {
          day:  { $dateToString: { format: "%Y-%m-%d", date: "$ts" } },
          user: { $cond: [{ $ne: ["$userId",""] }, "$userId", "$anonymousId"] },
        },
    }},
    { $group: { _id: "$_id.day", activeUsers: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
};

export const mau = async ({ projectId }) => {
  const now   = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1); // 1st of month
  const match = {
    projectId: toObjId(projectId),
    ts: { $gte: start, $lte: now },
  };
  const res = await Event.aggregate([
    { $match: match },
    { $group: { _id: { $cond: [{ $ne: ["$userId",""] }, "$userId", "$anonymousId"] } } },
    { $count: "mau" },
  ]);
  return res?.[0]?.mau || 0;
};

/* ── Page Analytics (detailed) ───────────────── */
export const pageAnalytics = async ({ projectId, from, to }) => {
  const match = {
    projectId: toObjId(projectId),
    ts: { $gte: new Date(from), $lte: new Date(to) },
    eventName: "page_view",
  };

  const pages = await Event.aggregate([
    { $match: match },
    { $group: {
        _id:         "$properties.page",
        totalViews:  { $sum: 1 },
        uniqueUsers: { $addToSet: { $cond: [{ $ne: ["$userId",""] }, "$userId", "$anonymousId"] } },
        firstSeen:   { $min: "$ts" },
        lastSeen:    { $max: "$ts" },
        // Avg time on page using ts diff when available
        referrers:   { $addToSet: "$properties.referrer" },
    }},
    { $project: {
        totalViews:  1,
        uniqueUsers: { $size: "$uniqueUsers" },
        firstSeen:   1,
        lastSeen:    1,
        referrers:   { $slice: ["$referrers", 5] },
    }},
    { $sort: { totalViews: -1 } },
    { $limit: 20 },
  ]);

  // DAU per page (last 7 days)
  const pageDau = await Event.aggregate([
    { $match: { ...match, ts: { $gte: new Date(Date.now() - 7 * 86400000), $lte: new Date() } } },
    { $group: {
        _id: {
          page: "$properties.page",
          day:  { $dateToString: { format: "%Y-%m-%d", date: "$ts" } },
          user: { $cond: [{ $ne: ["$userId",""] }, "$userId", "$anonymousId"] },
        },
    }},
    { $group: { _id: { page: "$_id.page", day: "$_id.day" }, users: { $sum: 1 } } },
    { $sort: { "_id.day": 1 } },
  ]);

  return { pages, pageDau };
};

export const heatmap = async ({ projectId, from, to, page }) => {
  const match = {
    projectId: toObjId(projectId),
    ts: { $gte: new Date(from), $lte: new Date(to) },
  };

  if (page) {
    match["properties.page"] = page;
  }

  const clickPoints = await Event.aggregate([
    {
      $match: {
        ...match,
        $or: [{ eventName: "click" }, { eventName: "button_click" }, { eventName: "tap" }],
        "properties.x": { $type: "number" },
        "properties.y": { $type: "number" },
      },
    },
    {
      $project: {
        page: "$properties.page",
        xBucket: { $multiply: [{ $floor: { $divide: ["$properties.x", 10] } }, 10] },
        yBucket: { $multiply: [{ $floor: { $divide: ["$properties.y", 10] } }, 10] },
      },
    },
    {
      $group: {
        _id: { page: "$page", x: "$xBucket", y: "$yBucket" },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 150 },
  ]);

  const scrollDepth = await Event.aggregate([
    {
      $match: {
        ...match,
        "properties.scrollDepth": { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: "$properties.page",
        avgScrollDepth: { $avg: "$properties.scrollDepth" },
        maxScrollDepth: { $max: "$properties.scrollDepth" },
        samples: { $sum: 1 },
      },
    },
    { $sort: { samples: -1 } },
    { $limit: 20 },
  ]);

  return {
    hasCoordinateData: clickPoints.length > 0,
    points: clickPoints.map((item) => ({
      page: item._id.page || "/",
      x: item._id.x,
      y: item._id.y,
      count: item.count,
    })),
    scrollDepth: scrollDepth.map((item) => ({
      page: item._id || "/",
      avgScrollDepth: Math.round(item.avgScrollDepth || 0),
      maxScrollDepth: Math.round(item.maxScrollDepth || 0),
      samples: item.samples,
    })),
  };
};

export const sessionJourney = async ({ projectId, from, to }) => {
  const match = {
    projectId: toObjId(projectId),
    ts: { $gte: new Date(from), $lte: new Date(to) },
  };

  const sessions = await Event.aggregate([
    { $match: match },
    { $sort: { ts: 1 } },
    {
      $group: {
        _id: getSessionExpr(),
        userKey: { $first: getUserExpr() },
        startedAt: { $first: "$ts" },
        endedAt: { $last: "$ts" },
        totalEvents: { $sum: 1 },
        pages: { $addToSet: "$properties.page" },
        events: {
          $push: {
            eventName: "$eventName",
            page: "$properties.page",
            ts: "$ts",
          },
        },
      },
    },
    {
      $project: {
        userKey: 1,
        startedAt: 1,
        endedAt: 1,
        totalEvents: 1,
        totalPages: { $size: "$pages" },
        durationMs: { $subtract: ["$endedAt", "$startedAt"] },
        events: { $slice: ["$events", 12] },
      },
    },
    { $sort: { startedAt: -1 } },
    { $limit: 12 },
  ]);

  const summary = await Event.aggregate([
    { $match: match },
    {
      $group: {
        _id: getSessionExpr(),
        startedAt: { $min: "$ts" },
        endedAt: { $max: "$ts" },
        totalEvents: { $sum: 1 },
      },
    },
    {
      $project: {
        durationMs: { $subtract: ["$endedAt", "$startedAt"] },
        totalEvents: 1,
      },
    },
    {
      $group: {
        _id: null,
        sessions: { $sum: 1 },
        avgDurationMs: { $avg: "$durationMs" },
        avgEventsPerSession: { $avg: "$totalEvents" },
      },
    },
  ]);

  return {
    summary: {
      totalSessions: summary?.[0]?.sessions || 0,
      avgDurationSeconds: Math.round((summary?.[0]?.avgDurationMs || 0) / 1000),
      avgEventsPerSession: Number((summary?.[0]?.avgEventsPerSession || 0).toFixed(1)),
    },
    sessions: sessions.map((session) => ({
      sessionId: session._id,
      userKey: session.userKey || "anonymous",
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      totalEvents: session.totalEvents,
      totalPages: session.totalPages,
      durationSeconds: Math.max(0, Math.round((session.durationMs || 0) / 1000)),
      events: session.events,
    })),
  };
};

export const examAnalytics = async ({ projectId, from, to }) => {
  const match = {
    projectId: toObjId(projectId),
    ts: { $gte: new Date(from), $lte: new Date(to) },
  };

  const [questionDropOffs, sectionDifficulty, reattempts, avgTimePerQuestion] = await Promise.all([
    Event.aggregate([
      {
        $match: {
          ...match,
          eventName: { $in: ["question_quit", "exam_quit", "question_drop"] },
          "properties.questionId": { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$properties.questionId",
          quits: { $sum: 1 },
          section: { $first: "$properties.section" },
        },
      },
      { $sort: { quits: -1 } },
      { $limit: 10 },
    ]),
    Event.aggregate([
      {
        $match: {
          ...match,
          "properties.section": { $exists: true, $ne: null },
          eventName: { $in: ["question_quit", "exam_quit", "incorrect_answer", "section_drop"] },
        },
      },
      {
        $group: {
          _id: "$properties.section",
          issues: { $sum: 1 },
        },
      },
      { $sort: { issues: -1 } },
      { $limit: 8 },
    ]),
    Event.aggregate([
      {
        $match: {
          ...match,
          eventName: { $in: ["exam_start", "exam_restart", "question_retry"] },
        },
      },
      {
        $group: {
          _id: {
            examId: "$properties.examId",
            userKey: getUserExpr(),
          },
          attempts: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.examId",
          totalUsers: { $sum: 1 },
          reattemptUsers: { $sum: { $cond: [{ $gt: ["$attempts", 1] }, 1, 0] } },
        },
      },
      { $sort: { reattemptUsers: -1 } },
      { $limit: 8 },
    ]),
    Event.aggregate([
      {
        $match: {
          ...match,
          "properties.questionId": { $exists: true, $ne: null },
          "properties.timeSpent": { $type: "number" },
        },
      },
      {
        $group: {
          _id: "$properties.questionId",
          avgSeconds: { $avg: "$properties.timeSpent" },
          section: { $first: "$properties.section" },
        },
      },
      { $sort: { avgSeconds: -1 } },
      { $limit: 10 },
    ]),
  ]);

  return {
    hasExamSignals:
      questionDropOffs.length > 0 ||
      sectionDifficulty.length > 0 ||
      reattempts.length > 0 ||
      avgTimePerQuestion.length > 0,
    questionDropOffs: questionDropOffs.map((item) => ({
      questionId: item._id,
      section: item.section || "General",
      quits: item.quits,
    })),
    sectionDifficulty: sectionDifficulty.map((item) => ({
      section: item._id || "General",
      issues: item.issues,
    })),
    reattempts: reattempts.map((item) => ({
      examId: item._id || "exam",
      totalUsers: item.totalUsers,
      reattemptUsers: item.reattemptUsers,
      reattemptRate: item.totalUsers > 0 ? Math.round((item.reattemptUsers / item.totalUsers) * 100) : 0,
    })),
    avgTimePerQuestion: avgTimePerQuestion.map((item) => ({
      questionId: item._id,
      section: item.section || "General",
      avgSeconds: Math.round(item.avgSeconds || 0),
    })),
  };
};

/* ── Retention cohorts ────────────────────────── */
export const retention = async ({ projectId, from, to }) => {
  const match = {
    projectId: toObjId(projectId),
    ts: { $gte: new Date(from), $lte: new Date(to) },
  };

  const firstSeen = await Event.aggregate([
    { $match: match },
    { $group: {
        _id:      { $cond: [{ $ne: ["$userId",""] }, "$userId", "$anonymousId"] },
        firstDay: { $min: { $dateToString: { format: "%Y-%m-%d", date: "$ts" } } },
        days:     { $addToSet: { $dateToString: { format: "%Y-%m-%d", date: "$ts" } } },
    }},
  ]);

  const cohort = Array.from({ length: 7 }, (_, i) => {
    const retained = firstSeen.filter(u => u.days.length > i).length;
    return {
      day:   `Day ${i}`,
      users:  retained,
      rate:   firstSeen.length > 0 ? Math.round((retained / firstSeen.length) * 100) : 0,
    };
  });

  return cohort;
};

/* ── Event trend ──────────────────────────────── */
export const eventTrend = async ({ projectId, from, to }) => {
  const match = {
    projectId: toObjId(projectId),
    ts: { $gte: new Date(from), $lte: new Date(to) },
  };
  return Event.aggregate([
    { $match: match },
    { $group: {
        _id:   { day: { $dateToString: { format: "%Y-%m-%d", date: "$ts" } }, event: "$eventName" },
        count: { $sum: 1 },
    }},
    { $sort: { "_id.day": 1 } },
  ]);
};

/* ── AI context builder ───────────────────────── */
export const buildAiContext = async ({ projectId, from, to, projectName, page }) => {
  const [ov, dauData, ret, mauCount] = await Promise.all([
    overview({ projectId, from, to }),
    dau({ projectId, from, to }),
    retention({ projectId, from, to }),
    mau({ projectId }),
  ]);

  const days        = Math.round((new Date(to) - new Date(from)) / 86400000);
  const topEventsStr = ov.topEvents.slice(0,5).map(e => `  ${e._id}: ${e.count}`).join("\n");
  const topPagesStr  = ov.topPages?.slice(0,5).map(p =>
    `  ${p._id||"/"}: ${p.count} views, ${p.uniqueUsers} users`).join("\n") || "  No page data";
  const dauTrend    = dauData.slice(-7).map(d => `${d._id}: ${d.activeUsers} users`).join(", ");
  const retStr      = ret.map(r => `${r.day}: ${r.rate}%`).join(", ");
  const peakHour    = ov.hourlyDistribution?.reduce((a, b) => (b.count > a.count ? b : a), { hour:"N/A", count:0 });

  // If specific page focus
  const pageFocus = page ? `\nFOCUS PAGE: ${page}
Page Views: ${ov.topPages?.find(p => p._id === page)?.count || 0}
Unique Visitors: ${ov.topPages?.find(p => p._id === page)?.uniqueUsers || 0}` : "";

  return `
Project: ${projectName || "Unknown"}
Category: ${ov.category?.label || "General Web App"}
Period: ${days} days (${new Date(from).toDateString()} → ${new Date(to).toDateString()})

KEY METRICS:
- Total Events: ${ov.totalEvents}
- Unique Users: ${ov.uniqueUsers}
- DAU Today: ${ov.dauToday}
- MAU (this month): ${mauCount}
- Avg Events/User: ${ov.avgEventsPerUser}
- Bounce Rate: ${ov.bounceRate}%
- Peak Hour: ${peakHour.hour} (${peakHour.count} events)
${pageFocus}
TOP EVENTS:
${topEventsStr}

TOP PAGES (views | unique users):
${topPagesStr}

DAU TREND (last 7 days):
${dauTrend}

RETENTION (Day 0–6):
${retStr}
  `.trim();
};
