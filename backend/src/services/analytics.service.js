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
const getPageExpr = () => ({
  $let: {
    vars: {
      rawPage: { $ifNull: ["$properties.page", "$properties.path"] },
    },
    in: {
      $cond: [
        {
          $or: [
            { $eq: ["$$rawPage", null] },
            { $eq: ["$$rawPage", ""] },
          ],
        },
        "/",
        "$$rawPage",
      ],
    },
  },
});
const PAGE_INTERACTION_EVENTS = ["click", "button_click", "tap"];
const JOURNEY_CONVERSION_EVENTS = [
  "identify",
  "login_success",
  "signup_success",
  "form_submit",
  "form_success",
  "checkout_complete",
  "payment_success",
  "purchase",
  "order_completed",
  "exam_submit",
  "exam_complete",
  "lead_created",
  "conversion",
];

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
            _id: getPageExpr(),
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
        _id:         getPageExpr(),
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
  ]);

  // DAU per page (last 7 days)
  const pageDau = await Event.aggregate([
    { $match: { ...match, ts: { $gte: new Date(Date.now() - 7 * 86400000), $lte: new Date() } } },
    { $group: {
        _id: {
          page: getPageExpr(),
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
  const pageFilter = page
    ? [{ $or: [{ "properties.page": page }, { "properties.path": page }] }]
    : [];

  const clickPoints = await Event.aggregate([
    {
      $match: {
        $and: [
          match,
          ...pageFilter,
          { $or: [{ eventName: "click" }, { eventName: "button_click" }, { eventName: "tap" }] },
          { "properties.x": { $type: "number" } },
          { "properties.y": { $type: "number" } },
        ],
      },
    },
    {
      $project: {
        page: getPageExpr(),
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
        $and: [
          match,
          ...pageFilter,
          { "properties.scrollDepth": { $exists: true, $ne: null } },
        ],
      },
    },
    {
      $group: {
        _id: getPageExpr(),
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
        entryPage: { $first: getPageExpr() },
        exitPage: { $last: getPageExpr() },
        totalEvents: { $sum: 1 },
        pages: { $addToSet: getPageExpr() },
        conversionEvents: {
          $sum: { $cond: [{ $in: ["$eventName", JOURNEY_CONVERSION_EVENTS] }, 1, 0] },
        },
        events: {
          $push: {
            eventName: "$eventName",
            page: getPageExpr(),
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
        entryPage: 1,
        exitPage: 1,
        totalEvents: 1,
        totalPages: { $size: "$pages" },
        conversionEvents: 1,
        hasConversion: { $gt: ["$conversionEvents", 0] },
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
        pages: { $addToSet: getPageExpr() },
        conversionEvents: {
          $sum: { $cond: [{ $in: ["$eventName", JOURNEY_CONVERSION_EVENTS] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        durationMs: { $subtract: ["$endedAt", "$startedAt"] },
        totalEvents: 1,
        totalPages: { $size: "$pages" },
        converted: { $gt: ["$conversionEvents", 0] },
      },
    },
    {
      $group: {
        _id: null,
        sessions: { $sum: 1 },
        avgDurationMs: { $avg: "$durationMs" },
        avgEventsPerSession: { $avg: "$totalEvents" },
        avgPagesPerSession: { $avg: "$totalPages" },
        convertedSessions: { $sum: { $cond: ["$converted", 1, 0] } },
        singleEventSessions: { $sum: { $cond: [{ $lte: ["$totalEvents", 1] }, 1, 0] } },
      },
    },
  ]);

  const totalSessions = summary?.[0]?.sessions || 0;
  const convertedSessions = summary?.[0]?.convertedSessions || 0;
  const singleEventSessions = summary?.[0]?.singleEventSessions || 0;

  return {
    summary: {
      totalSessions,
      avgDurationSeconds: Math.round((summary?.[0]?.avgDurationMs || 0) / 1000),
      avgEventsPerSession: Number((summary?.[0]?.avgEventsPerSession || 0).toFixed(1)),
      avgPagesPerSession: Number((summary?.[0]?.avgPagesPerSession || 0).toFixed(1)),
      convertedSessions,
      conversionRate: totalSessions > 0 ? Math.round((convertedSessions / totalSessions) * 100) : 0,
      singleEventSessions,
      dropOffRate: totalSessions > 0 ? Math.round((singleEventSessions / totalSessions) * 100) : 0,
    },
    sessions: sessions.map((session) => ({
      sessionId: session._id,
      userKey: session.userKey || "anonymous",
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      entryPage: session.entryPage || "/",
      exitPage: session.exitPage || "/",
      totalEvents: session.totalEvents,
      totalPages: session.totalPages,
      conversionEvents: session.conversionEvents || 0,
      hasConversion: Boolean(session.hasConversion),
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

  const users = await Event.aggregate([
    { $match: match },
    { $group: {
        _id:      getUserExpr(),
        firstDay: { $min: { $dateToString: { format: "%Y-%m-%d", date: "$ts" } } },
        days:     { $addToSet: { $dateToString: { format: "%Y-%m-%d", date: "$ts" } } },
    }},
  ]);

  const cohortUsers = users.length;
  const dayToUtc = (day) => new Date(`${day}T00:00:00.000Z`).getTime();
  const usersWithOffsets = users.map((user) => {
    const firstDayMs = dayToUtc(user.firstDay);
    const activeOffsets = new Set(
      (user.days || [])
        .map((day) => Math.round((dayToUtc(day) - firstDayMs) / 86400000))
        .filter((offset) => offset >= 0 && offset <= 6)
    );
    return { ...user, activeOffsets };
  });

  const cohort = Array.from({ length: 7 }, (_, i) => {
    const retained = usersWithOffsets.filter((user) => user.activeOffsets.has(i)).length;
    return {
      day: `Day ${i}`,
      users: retained,
      retainedUsers: retained,
      cohortUsers,
      rate: cohortUsers > 0 ? Math.round((retained / cohortUsers) * 100) : 0,
      description:
        i === 0
          ? "Users active on their first tracked day"
          : `Users who returned ${i} day${i > 1 ? "s" : ""} after first activity`,
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

const formatRangeLabel = (from, to) =>
  `${new Date(from).toDateString()} -> ${new Date(to).toDateString()}`;

const formatBlock = (items, formatter, fallback = "  No data available") =>
  items?.length ? items.map(formatter).join("\n") : fallback;

const buildBaseMatch = ({ projectId, from, to }) => ({
  projectId: toObjId(projectId),
  ts: { $gte: new Date(from), $lte: new Date(to) },
});

const buildPageMatch = ({ projectId, from, to, page }) => ({
  ...buildBaseMatch({ projectId, from, to }),
  $or: [{ "properties.page": page }, { "properties.path": page }],
});

const getPeakHour = (distribution = []) =>
  distribution.reduce((best, current) => (current.count > best.count ? current : best), {
    hour: "N/A",
    count: 0,
  });

const getDaysBetween = (from, to) =>
  Math.max(1, Math.round((new Date(to) - new Date(from)) / 86400000));

export const getPageInsightFacts = async ({ projectId, from, to, projectName, page }) => {
  const [ov, pageData, pageHeatmap, pageTotalsAgg, pageTopEvents, pageTrend, pageSessions] = await Promise.all([
    overview({ projectId, from, to }),
    pageAnalytics({ projectId, from, to }),
    heatmap({ projectId, from, to, page }),
    Event.aggregate([
      { $match: buildPageMatch({ projectId, from, to, page }) },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          pageViews: {
            $sum: { $cond: [{ $eq: ["$eventName", "page_view"] }, 1, 0] },
          },
          totalClicks: {
            $sum: { $cond: [{ $in: ["$eventName", PAGE_INTERACTION_EVENTS] }, 1, 0] },
          },
          uniqueUsers: { $addToSet: getUserExpr() },
          uniqueSessions: { $addToSet: getSessionExpr() },
          firstSeen: { $min: "$ts" },
          lastSeen: { $max: "$ts" },
        },
      },
      {
        $project: {
          totalEvents: 1,
          pageViews: 1,
          totalClicks: 1,
          uniqueUsers: { $size: "$uniqueUsers" },
          uniqueSessions: { $size: "$uniqueSessions" },
          firstSeen: 1,
          lastSeen: 1,
        },
      },
    ]),
    Event.aggregate([
      { $match: buildPageMatch({ projectId, from, to, page }) },
      { $group: { _id: "$eventName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]),
    Event.aggregate([
      { $match: buildPageMatch({ projectId, from, to, page }) },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$ts" } },
          totalEvents: { $sum: 1 },
          pageViews: {
            $sum: { $cond: [{ $eq: ["$eventName", "page_view"] }, 1, 0] },
          },
          clicks: {
            $sum: { $cond: [{ $in: ["$eventName", PAGE_INTERACTION_EVENTS] }, 1, 0] },
          },
          uniqueUsers: { $addToSet: getUserExpr() },
        },
      },
      {
        $project: {
          totalEvents: 1,
          pageViews: 1,
          clicks: 1,
          uniqueUsers: { $size: "$uniqueUsers" },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Event.aggregate([
      { $match: buildPageMatch({ projectId, from, to, page }) },
      { $sort: { ts: 1 } },
      {
        $group: {
          _id: getSessionExpr(),
          userKey: { $first: getUserExpr() },
          startedAt: { $first: "$ts" },
          endedAt: { $last: "$ts" },
          totalEvents: { $sum: 1 },
          flow: { $push: "$eventName" },
        },
      },
      {
        $project: {
          userKey: 1,
          startedAt: 1,
          totalEvents: 1,
          durationMs: { $subtract: ["$endedAt", "$startedAt"] },
          flow: { $slice: ["$flow", 6] },
        },
      },
      { $sort: { startedAt: -1 } },
      { $limit: 5 },
    ]),
  ]);

  const pageTotals = pageTotalsAgg?.[0] || {
    totalEvents: 0,
    pageViews: 0,
    totalClicks: 0,
    uniqueUsers: 0,
    uniqueSessions: 0,
    firstSeen: null,
    lastSeen: null,
  };
  const pageRecord = (pageData?.pages || []).find((item) => item._id === page) || null;
  const allPages = pageData?.pages || [];
  const totalSiteViews = allPages.reduce((sum, item) => sum + (item.totalViews || 0), 0);
  const avgViewsPerPage = allPages.length ? Math.round(totalSiteViews / allPages.length) : 0;
  const viewRank = pageRecord ? allPages.findIndex((item) => item._id === page) + 1 : null;
  const viewShare =
    totalSiteViews > 0 && pageRecord ? Math.round((pageRecord.totalViews / totalSiteViews) * 100) : 0;
  const peakHour = getPeakHour(ov.hourlyDistribution);
  const scrollStats = (pageHeatmap?.scrollDepth || []).find((item) => item.page === page) || {
    avgScrollDepth: 0,
    maxScrollDepth: 0,
    samples: 0,
  };
  const clickSampleCount = (pageHeatmap?.points || []).reduce((sum, item) => sum + item.count, 0);
  const eventCounts = Object.fromEntries(pageTopEvents.map((item) => [item._id, item.count]));

  return {
    page,
    projectName: projectName || "Unknown",
    category: ov.category?.label || "General Web App",
    periodDays: getDaysBetween(from, to),
    periodLabel: formatRangeLabel(from, to),
    metrics: {
      pageViews: pageRecord?.totalViews || pageTotals.pageViews || 0,
      uniqueUsers: pageRecord?.uniqueUsers || pageTotals.uniqueUsers || 0,
      totalEvents: pageTotals.totalEvents,
      totalClicks: pageTotals.totalClicks,
      uniqueSessions: pageTotals.uniqueSessions,
      viewsPerUser:
        (pageRecord?.uniqueUsers || pageTotals.uniqueUsers || 0) > 0
          ? Number(
              ((pageRecord?.totalViews || pageTotals.pageViews || 0) /
                (pageRecord?.uniqueUsers || pageTotals.uniqueUsers || 1)).toFixed(1)
            )
          : 0,
      eventsPerSession:
        pageTotals.uniqueSessions > 0
          ? Number((pageTotals.totalEvents / pageTotals.uniqueSessions).toFixed(1))
          : 0,
      clicksPerUser:
        (pageRecord?.uniqueUsers || pageTotals.uniqueUsers || 0) > 0
          ? Number((pageTotals.totalClicks / (pageRecord?.uniqueUsers || pageTotals.uniqueUsers || 1)).toFixed(1))
          : 0,
      viewRank: viewRank || null,
      viewShare,
      avgViewsPerPage,
      siteBounceRate: ov.bounceRate,
      siteAvgEventsPerUser: ov.avgEventsPerUser,
      sitePeakHour: peakHour.hour,
      sitePeakHourEvents: peakHour.count,
      firstSeen: pageTotals.firstSeen,
      lastSeen: pageTotals.lastSeen,
    },
    scroll: scrollStats,
    clickClusters: pageHeatmap?.points?.length || 0,
    clickSamples: clickSampleCount,
    topEvents: pageTopEvents.map((item) => ({ name: item._id, count: item.count })),
    eventCounts,
    trend: pageTrend.map((item) => ({
      date: item._id,
      pageViews: item.pageViews || 0,
      totalEvents: item.totalEvents || 0,
      clicks: item.clicks || 0,
      uniqueUsers: item.uniqueUsers || 0,
    })),
    referrers: (pageRecord?.referrers || []).filter(Boolean),
    sessions: pageSessions.map((session) => ({
      userKey: session.userKey,
      startedAt: session.startedAt,
      totalEvents: session.totalEvents,
      durationSeconds: Math.max(0, Math.round((session.durationMs || 0) / 1000)),
      flow: session.flow,
    })),
  };
};

export const buildProjectAiContext = async ({ projectId, from, to, projectName }) => {
  const [ov, dauData, ret, mauCount, pageData, heatmapData, sessionData, examData] = await Promise.all([
    overview({ projectId, from, to }),
    dau({ projectId, from, to }),
    retention({ projectId, from, to }),
    mau({ projectId }),
    pageAnalytics({ projectId, from, to }),
    heatmap({ projectId, from, to }),
    sessionJourney({ projectId, from, to }),
    examAnalytics({ projectId, from, to }),
  ]);

  const peakHour = getPeakHour(ov.hourlyDistribution);
  const topEventsStr = formatBlock(
    ov.topEvents.slice(0, 6),
    (event) => `  - ${event._id}: ${event.count} events`
  );
  const topPagesStr = formatBlock(
    (pageData?.pages || []).slice(0, 6),
    (pageItem) =>
      `  - ${pageItem._id || "/"}: ${pageItem.totalViews} views, ${pageItem.uniqueUsers} users, first ${new Date(
        pageItem.firstSeen
      ).toDateString()}, last ${new Date(pageItem.lastSeen).toDateString()}`
  );
  const dauTrend = formatBlock(
    dauData.slice(-7),
    (day) => `  - ${day._id}: ${day.activeUsers} active users`
  );
  const retentionStr = formatBlock(
    ret,
    (item) => `  - ${item.day}: ${item.rate}% retention (${item.users} users)`
  );
  const scrollStr = formatBlock(
    (heatmapData?.scrollDepth || []).slice(0, 5),
    (item) =>
      `  - ${item.page}: avg scroll ${item.avgScrollDepth}%, max ${item.maxScrollDepth}%, samples ${item.samples}`
  );
  const sessionSamples = formatBlock(
    (sessionData?.sessions || []).slice(0, 5),
    (session) =>
      `  - ${session.userKey}: ${session.totalEvents} events across ${session.totalPages} pages in ${session.durationSeconds}s`
  );
  const examSignals = examData?.hasExamSignals
    ? [
        "EXAM / CATEGORY SIGNALS:",
        `  - Question drop-offs: ${formatBlock(
          examData.questionDropOffs.slice(0, 3),
          (item) => `${item.questionId} (${item.section}): ${item.quits}`
        )}`,
        `  - Reattempt leaders: ${formatBlock(
          examData.reattempts.slice(0, 3),
          (item) => `${item.examId}: ${item.reattemptRate}% reattempt rate`
        )}`,
      ].join("\n")
    : "EXAM / CATEGORY SIGNALS:\n  - No exam-specific signals detected in this range";

  return `
PROJECT: ${projectName || "Unknown"}
ANALYSIS SCOPE: Entire project / website only
CATEGORY: ${ov.category?.label || "General Web App"}
JOURNEY MODE: ${ov.category?.journeysLabel || "User journeys"}
PERIOD: ${getDaysBetween(from, to)} days (${formatRangeLabel(from, to)})

CORE METRICS:
  - Total events: ${ov.totalEvents}
  - Unique users: ${ov.uniqueUsers}
  - DAU today: ${ov.dauToday}
  - MAU this month: ${mauCount}
  - Avg events per user: ${ov.avgEventsPerUser}
  - Bounce rate: ${ov.bounceRate}%
  - Peak hour: ${peakHour.hour} (${peakHour.count} events)
  - Total tracked pages: ${pageData?.pages?.length || 0}

TOP EVENTS:
${topEventsStr}

TOP PAGES:
${topPagesStr}

DAILY ACTIVE USER TREND:
${dauTrend}

RETENTION:
${retentionStr}

INTERACTION READINESS:
  - Click clusters: ${heatmapData?.points?.length || 0}
  - Click samples: ${(heatmapData?.points || []).reduce((sum, item) => sum + item.count, 0)}
  - Scroll coverage:
${scrollStr}

SESSION SUMMARY:
  - Total sessions: ${sessionData?.summary?.totalSessions || 0}
  - Avg duration: ${sessionData?.summary?.avgDurationSeconds || 0}s
  - Avg events per session: ${sessionData?.summary?.avgEventsPerSession || 0}
  - Sample recent sessions:
${sessionSamples}

${examSignals}
  `.trim();
};

export const buildPageAiContext = async ({ projectId, from, to, projectName, page }) => {
  const facts = await getPageInsightFacts({ projectId, from, to, projectName, page });
  const topEventsStr = formatBlock(
    facts.topEvents,
    (item) => `  - ${item.name}: ${item.count} events`
  );
  const trendStr = formatBlock(
    facts.trend.slice(-7),
    (item) =>
      `  - ${item.date}: ${item.pageViews} page views, ${item.totalEvents} total events, ${item.clicks} clicks, ${item.uniqueUsers} users`
  );
  const sessionStr = formatBlock(
    facts.sessions,
    (session) =>
      `  - ${session.userKey}: ${session.totalEvents} events in ${session.durationSeconds}s -> ${session.flow.join(" -> ")}`
  );
  const referrerStr = formatBlock(facts.referrers, (referrer) => `  - ${referrer}`);

  return `
PROJECT: ${facts.projectName}
ANALYSIS SCOPE: Single page only
FOCUS PAGE: ${facts.page}
CATEGORY: ${facts.category}
PERIOD: ${facts.periodDays} days (${facts.periodLabel})

PAGE PERFORMANCE:
  - Page views: ${facts.metrics.pageViews}
  - Unique users: ${facts.metrics.uniqueUsers}
  - Total page-tagged events: ${facts.metrics.totalEvents}
  - Click/tap events: ${facts.metrics.totalClicks}
  - Sessions touching this page: ${facts.metrics.uniqueSessions}
  - Views per user: ${facts.metrics.viewsPerUser}
  - Events per session: ${facts.metrics.eventsPerSession}
  - Site-wide bounce rate for comparison: ${facts.metrics.siteBounceRate}%
  - Site-wide avg events per user: ${facts.metrics.siteAvgEventsPerUser}
  - Site-wide peak hour: ${facts.metrics.sitePeakHour} (${facts.metrics.sitePeakHourEvents} events)

PAGE COMPARISON VS WEBSITE:
  - View rank: ${facts.metrics.viewRank || "Not ranked"}
  - View share of all tracked page views: ${facts.metrics.viewShare}%
  - Avg views per page across site: ${facts.metrics.avgViewsPerPage}
  - First seen: ${facts.metrics.firstSeen ? new Date(facts.metrics.firstSeen).toDateString() : "N/A"}
  - Last seen: ${facts.metrics.lastSeen ? new Date(facts.metrics.lastSeen).toDateString() : "N/A"}

BEHAVIOR ON THIS PAGE:
  - Scroll samples: ${facts.scroll.samples}
  - Avg scroll depth: ${facts.scroll.avgScrollDepth}%
  - Max scroll depth: ${facts.scroll.maxScrollDepth}%
  - Click clusters: ${facts.clickClusters}
  - Click samples: ${facts.clickSamples}

TOP EVENTS ON THIS PAGE:
${topEventsStr}

7-DAY PAGE TREND:
${trendStr}

TOP REFERRERS:
${referrerStr}

RECENT PAGE SESSIONS:
${sessionStr}
  `.trim();
};
