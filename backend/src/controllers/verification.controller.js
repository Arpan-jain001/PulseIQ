import { createVerificationRequest, listVerificationRequests, reviewVerification } from "../services/verification.service.js";
import { sendNotification } from "../services/notification.service.js";

export const requestVerification = async (req, res, next) => {
  try {
    const vr = await createVerificationRequest({
      userId: req.user._id,
      companyName: req.body.companyName,
      website: req.body.website,
      notes: req.body.notes,
    });
    res.status(201).json({ success: true, data: vr });
  } catch (e) {
    next(e);
  }
};

export const listRequests = async (req, res, next) => {
  try {
    const list = await listVerificationRequests();
    res.json({ success: true, data: list });
  } catch (e) {
    next(e);
  }
};

export const review = async (req, res, next) => {
  try {
    const updated = await reviewVerification({
      requestId: req.params.id,
      reviewerId: req.user._id,
      status: req.body.status, // APPROVED/REJECTED
      reviewNote: req.body.reviewNote,
    });

    await sendNotification({
      title: "Verification Update",
      message: updated.status === "APPROVED" ? "Your account has been verified ✅" : "Your verification was rejected ❌",
      type: "USER",
      targetUser: updated.userId,
    });

    res.json({ success: true, data: updated });
  } catch (e) {
    next(e);
  }
};
