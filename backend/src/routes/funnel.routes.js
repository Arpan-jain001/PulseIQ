import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { funnel } from "../services/funnel.service.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  const { projectId, steps } = req.body;

  const data = await funnel({ projectId, steps });

  res.json({ success: true, data });
});

export default router;