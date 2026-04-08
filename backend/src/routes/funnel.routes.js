import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { funnel } from "../services/funnel.service.js";
import { getAccessibleProject } from "../services/projectAccess.service.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  const { projectId, steps } = req.body;
  await getAccessibleProject({ projectId, user: req.user });

  const data = await funnel({ projectId, steps });

  res.json({ success: true, data });
});

export default router;
