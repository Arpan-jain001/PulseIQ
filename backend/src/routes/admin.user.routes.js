import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { superAdminOnly } from "../middleware/superAdmin.middleware.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/", protect, superAdminOnly, async (req, res) => {
  const users = await User.find().select("-password");
  res.json({ success: true, data: users });
});

router.delete("/:id", protect, superAdminOnly, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "User deleted" });
});

export default router;