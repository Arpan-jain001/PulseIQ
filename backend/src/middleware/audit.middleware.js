import { writeAudit } from "../services/audit.service.js";

export const audit = (action, targetType) => async (req, res, next) => {
  try {
    await writeAudit({
      actorId: req.user?._id,
      action,
      targetType,
      targetId: req.params.id || null,
    });
    next();
  } catch (e) {
    next(e);
  }
};