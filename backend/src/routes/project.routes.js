import express from "express";
import Project from "../models/Project.js";
import Workspace from "../models/Workspace.js";
import { protect, allowRoles, verifiedOnly } from "../middleware/auth.middleware.js";
import { generateApiKey } from "../utils/generateApiKey.js";

const router = express.Router();

// create project (organizer + verified)
router.post("/", protect, allowRoles("SUPER_ADMIN", "ORGANIZER"), verifiedOnly, async (req, res) => {
  const { workspaceId, name, allowedDomains = [] } = req.body;

  const ws = await Workspace.findById(workspaceId);
  if (!ws) return res.status(404).json({ success: false, message: "Workspace not found" });

  const { raw, hash } = generateApiKey();

  const project = await Project.create({
    workspaceId,
    name,
    apiKeyHash: hash,
    allowedDomains,
  });

  // raw key only once
  res.status(201).json({
    success: true,
    data: {
      project,
      apiKey: raw,
    },
  });
});

router.get("/", protect, async (req, res) => {
  const list = await Project.find().sort({ createdAt: -1 });
  res.json({ success: true, data: list });
});

export default router;
