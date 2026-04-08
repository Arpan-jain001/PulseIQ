import Event from "../models/Event.js";
import Project from "../models/Project.js";
import { overview } from "./analytics.service.js";

const DAY_MS = 24 * 60 * 60 * 1000;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const getScoreLabel = (score) => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Healthy";
  if (score >= 40) return "Needs Attention";
  return "Critical";
};

const getTrendDirection = (current, previous) => {
  if (!previous && !current) return "flat";
  if (!previous && current) return "up";
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "flat";
};

const getRecommendations = ({ summary, project }) => {
  const recommendations = [];

  if (summary.totalEvents === 0) {
    recommendations.push("Verify the tracking SDK and send live traffic to this project, because no events were ingested during the current review window.");
  }
  if (summary.bounceRate >= 60) {
    recommendations.push("Improve the CTA-to-content match on the top landing pages, because the bounce rate is currently very high.");
  }
  if (summary.avgEventsPerUser < 2) {
    recommendations.push("Add stronger onboarding prompts and guided actions in core journeys to increase user engagement depth.");
  }
  if (!project.sdkVerified && project.graceDaysLeft <= 3) {
    recommendations.push("Complete SDK verification before the grace period ends so analytics trust and reporting coverage are not affected.");
  }
  if (summary.uniqueUsers < 5) {
    recommendations.push("Build a stronger behavioral baseline by driving additional traffic or running controlled internal test sessions.");
  }

  if (!recommendations.length) {
    recommendations.push("Double down on the strongest converting flow and launch one focused experiment based on the latest AI insight.");
  }

  return recommendations.slice(0, 3);
};

export const buildProjectPulse = async (projectDoc, options = {}) => {
  const project = projectDoc.toObject ? projectDoc.toObject() : projectDoc;
  const now = options.now ? new Date(options.now) : new Date();
  const reportDays = options.reportDays || 7;
  const windowStart = new Date(now.getTime() - reportDays * DAY_MS);
  const previousStart = new Date(windowStart.getTime() - reportDays * DAY_MS);

  const [currentOverview, previousEvents, recentEvents24h, latestEvent] = await Promise.all([
    overview({
      projectId: project._id,
      from: windowStart.toISOString(),
      to: now.toISOString(),
    }),
    Event.countDocuments({
      projectId: project._id,
      ts: { $gte: previousStart, $lt: windowStart },
    }),
    Event.countDocuments({
      projectId: project._id,
      ts: { $gte: new Date(now.getTime() - DAY_MS), $lte: now },
    }),
    Event.findOne({ projectId: project._id }).sort({ ts: -1 }).select("ts eventName"),
  ]);

  let score = 100;

  if (currentOverview.totalEvents === 0) score -= 70;
  if (currentOverview.uniqueUsers < 5) score -= 20;
  if (currentOverview.bounceRate >= 80) score -= 25;
  else if (currentOverview.bounceRate >= 60) score -= 18;
  else if (currentOverview.bounceRate >= 40) score -= 8;

  if (currentOverview.avgEventsPerUser < 2) score -= 18;
  else if (currentOverview.avgEventsPerUser < 4) score -= 8;

  if (currentOverview.dauToday === 0) score -= 12;
  if (recentEvents24h === 0) score -= 18;
  if (!project.sdkVerified) score -= 10;
  if (!project.sdkVerified && project.graceDaysLeft <= 3) score -= 12;
  if (!currentOverview.topPages?.length) score -= 8;

  score = clamp(Math.round(score), 0, 100);
  const label = getScoreLabel(score);
  const trendDirection = getTrendDirection(currentOverview.totalEvents, previousEvents);

  const summary =
    currentOverview.totalEvents === 0
      ? "No tracking activity detected in the last 7 days."
      : `${currentOverview.totalEvents} events, ${currentOverview.uniqueUsers} users, ${currentOverview.bounceRate}% bounce rate in the last ${reportDays} days.`;

  return {
    projectId: project._id,
    projectName: project.name,
    score,
    label,
    summary,
    recommendations: getRecommendations({ summary: currentOverview, project }),
    metrics: {
      totalEvents: currentOverview.totalEvents,
      uniqueUsers: currentOverview.uniqueUsers,
      bounceRate: currentOverview.bounceRate,
      avgEventsPerUser: currentOverview.avgEventsPerUser,
      dauToday: currentOverview.dauToday,
      recentEvents24h,
      previousEvents,
      trendDirection,
      topEvents: currentOverview.topEvents?.slice(0, 3) || [],
      topPages: currentOverview.topPages?.slice(0, 3) || [],
      lastEventAt: latestEvent?.ts || null,
      lastEventName: latestEvent?.eventName || null,
    },
    grace: {
      sdkVerified: project.sdkVerified,
      inGracePeriod: project.inGracePeriod,
      graceDaysLeft: project.graceDaysLeft,
    },
  };
};

export const listProjectPulseReports = async ({ onlyUnverified = false } = {}) => {
  const projectQuery = { status: "ACTIVE" };
  if (onlyUnverified) projectQuery.sdkVerified = false;

  const projects = await Project.find(projectQuery)
    .populate({
      path: "workspaceId",
      populate: { path: "ownerId", select: "name email role" },
    });

  const reports = [];
  for (const project of projects) {
    if (!project.workspaceId?.ownerId?.email) continue;
    const pulse = await buildProjectPulse(project);
    reports.push({
      project,
      workspace: project.workspaceId,
      owner: project.workspaceId.ownerId,
      pulse,
    });
  }

  return reports;
};

export const enrichProjectHealthSnapshot = async (projectId) => {
  const project = await Project.findById(projectId);
  if (!project) return null;

  const pulse = await buildProjectPulse(project);
  await Project.findByIdAndUpdate(projectId, {
    recentHealthScore: pulse.score,
    recentHealthLabel: pulse.label,
    recentHealthSummary: pulse.summary,
    lastHealthEvaluatedAt: new Date(),
  });

  return pulse;
};
