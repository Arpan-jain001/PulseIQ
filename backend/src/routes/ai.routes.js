import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { insights } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/insights", protect, insights);

export default router;
