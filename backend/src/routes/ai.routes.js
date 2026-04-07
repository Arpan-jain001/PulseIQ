// backend/src/routes/ai.routes.js — REPLACE existing
import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { insights, chat, pageInsights } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/insights",      protect, insights);
router.post("/chat",          protect, chat);
router.post("/page-insights", protect, pageInsights);

export default router;