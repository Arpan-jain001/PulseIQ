import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { overviewCtrl, dauCtrl } from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/overview", protect, overviewCtrl);
router.get("/dau", protect, dauCtrl);

export default router;
