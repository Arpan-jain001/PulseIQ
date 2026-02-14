import express from "express";
import { protect, allowRoles, verifiedOnly } from "../middleware/auth.middleware.js";
import { create, mine, members, addMember } from "../controllers/workspace.controller.js";

const router = express.Router();

router.get("/mine", protect, mine);
router.post("/", protect, allowRoles("SUPER_ADMIN", "ORGANIZER"), verifiedOnly, create);
router.get("/:id/members", protect, members);
router.post("/:id/members", protect, allowRoles("SUPER_ADMIN", "ORGANIZER"), addMember);

export default router;
