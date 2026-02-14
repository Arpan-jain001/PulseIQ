import AuditLog from "../models/AuditLog.js";

export const writeAudit = async ({ actorId, action, targetType, targetId, meta }) => {
  return AuditLog.create({ actorId, action, targetType, targetId, meta: meta || {} });
};
