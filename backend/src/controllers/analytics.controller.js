// backend/src/controllers/analytics.controller.js — REPLACE existing
import { overview, dau, mau, retention, eventTrend, pageAnalytics } from "../services/analytics.service.js";

const range = (req) => {
  const to   = req.query.to   ? new Date(req.query.to)   : new Date();
  const from = req.query.from ? new Date(req.query.from) : new Date(Date.now() - 7 * 86400000);
  return { from, to };
};

export const overviewCtrl = async (req, res, next) => {
  try {
    const { from, to } = range(req);
    const data = await overview({ projectId: req.query.projectId, from, to });
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

export const dauCtrl = async (req, res, next) => {
  try {
    const { from, to } = range(req);
    const data = await dau({ projectId: req.query.projectId, from, to });
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

export const mauCtrl = async (req, res, next) => {
  try {
    const data = await mau({ projectId: req.query.projectId });
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

export const retentionCtrl = async (req, res, next) => {
  try {
    const { from, to } = range(req);
    const data = await retention({ projectId: req.query.projectId, from, to });
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

export const eventTrendCtrl = async (req, res, next) => {
  try {
    const { from, to } = range(req);
    const data = await eventTrend({ projectId: req.query.projectId, from, to });
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

export const pageAnalyticsCtrl = async (req, res, next) => {
  try {
    const { from, to } = range(req);
    const data = await pageAnalytics({ projectId: req.query.projectId, from, to });
    res.json({ success: true, data });
  } catch (e) { next(e); }
};