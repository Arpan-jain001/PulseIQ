import { platformOverview } from "../services/platformAnalytics.service.js";

export const platformStats = async (req, res, next) => {
  try {
    const data = await platformOverview();
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
};