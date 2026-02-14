import express from "express";
import { protect, allowRoles } from "../middleware/auth.middleware.js";
import { requestVerification, listRequests, review } from "../controllers/verification.controller.js";

const router = express.Router();

router.post("/request", protect, allowRoles("ORGANIZER"), requestVerification);
router.get("/requests", protect, allowRoles("SUPER_ADMIN"), listRequests);
router.patch("/requests/:id/review", protect, allowRoles("SUPER_ADMIN"), review);

export default router;
