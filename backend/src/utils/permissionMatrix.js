import { ROLES } from "../config/roles.js";
import { PERMISSIONS } from "../config/permissions.js";

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),

  [ROLES.ORGANIZER]: [
    PERMISSIONS.MANAGE_PROJECTS,
    PERMISSIONS.VIEW_ANALYTICS,
  ],

  [ROLES.USER]: [],
};

export const hasPermission = (role, permission) => {
  return ROLE_PERMISSIONS[role]?.includes(permission);
};