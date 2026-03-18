import { getAdminOverview } from "../services/admin.service.js";

export const adminOverview = async (req, res, next) => {
  try {
    const data = await getAdminOverview();

    res.json({
      success: true,
      data,
    });
  } catch (e) {
    next(e);
  }
};