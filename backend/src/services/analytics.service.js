// backend/src/services/analytics.service.js — REPLACE existing
import Event from "../models/Event.js";
import mongoose from "mongoose";

const toObjId = (id) => new mongoose.Types.ObjectId(id);

/* ── Overview ─────────────────────────────────── */
export const overview = async ({ projectId, from, to }) => {
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