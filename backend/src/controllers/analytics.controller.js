import { overview, dau } from "../services/analytics.service.js";

const range = (req) => {
  const to = req.query.to ? new Date(req.query.to) : new Date();
  const from = req.query.from ? new Date(req.query.from) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return { from, to };
};

export const overviewCtrl = async (req, res, next) => {
  try {
    const { from, to } = range(req);
    const data = await overview({ projectId: req.query.projectId, from, to });
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
};

export const dauCtrl = async (req, res, next) => {
  try {
    const { from, to } = range(req);
    const data = await dau({ projectId: req.query.projectId, from, to });
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
};
