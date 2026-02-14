import express from "express";
import { protect, allowRoles } from "../middleware/auth.middleware.js";
import { overviewCtrl, dauCtrl } from "../controllers/analytics.controller.js";

const router = express.Router();

// Admin analytics (SUPER_ADMIN only)
router.get("/overview", protect, allowRoles("SUPER_ADMIN"), overviewCtrl);
router.get("/dau", protect, allowRoles("SUPER_ADMIN"), dauCtrl);

export default router;
