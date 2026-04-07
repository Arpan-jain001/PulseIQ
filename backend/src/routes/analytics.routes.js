// backend/src/routes/analytics.routes.js — REPLACE existing
import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { overviewCtrl, dauCtrl, mauCtrl, retentionCtrl, eventTrendCtrl, pageAnalyticsCtrl } from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/overview",      protect, overviewCtrl);
router.get("/dau",           protect, dauCtrl);
router.get("/mau",           protect, mauCtrl);
router.get("/retention",     protect, retentionCtrl);
router.get("/event-trend",   protect, eventTrendCtrl);
router.get("/page-analytics",protect, pageAnalyticsCtrl);

export default router;